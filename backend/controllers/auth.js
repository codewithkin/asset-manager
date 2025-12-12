const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const userModel = require('../models/user');
const { comparePassword } = require('../utils/password');
const logger = require('../utils/logger');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId },
    jwtSecret,
    { expiresIn: '7d' }
  );
}

function generateTempToken(data) {
  return jwt.sign(data, jwtSecret, { expiresIn: '5m' });
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    logger.info('POST /api/auth/login', `Login attempt for email: ${email}`);
    
    const user = await userModel.findByEmail(email);
    
    if (!user) {
      logger.warn('POST /api/auth/login', `Failed login: user not found for email: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!user.password_hash) {
      logger.warn('POST /api/auth/login', `Failed login: no password set for email: ${email}`);
      return res.status(401).json({ error: 'Password not set. Please use Google OAuth.' });
    }
    
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      logger.warn('POST /api/auth/login', `Failed login: invalid password for email: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
    });
    
    logger.info('POST /api/auth/login', `Successful login for user: ${user.id} (${email})`);
    
    res.json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        organizationId: user.organization_id,
      }
    });
  } catch (error) {
    logger.error('POST /api/auth/login', `Unexpected error during login: ${error.message}`, error);
    res.status(500).json({ error: error.message });
  }
}

async function googleCallback(req, res) {
  try {
    const user = req.user;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    logger.info('GET /api/auth/google/callback', `Google callback for user: ${user?.email}`);
    
    if (!user || !user.email) {
      logger.error('GET /api/auth/google/callback', 'User not found in callback');
      return res.redirect(`${frontendUrl}/auth/google/select?error=user_not_found`);
    }
    
    const dbUser = await userModel.findByEmail(user.email);
    
    if (dbUser && dbUser.organization_id) {
      const token = generateToken({
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        organizationId: dbUser.organization_id,
      });
      
      logger.info('GET /api/auth/google/callback', `Existing user authenticated: ${dbUser.id} (${dbUser.email})`);
      
      return res.redirect(
        `${frontendUrl}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          status: dbUser.status,
          organizationId: dbUser.organization_id,
        }))}`
      );
    }
    
    const tempToken = generateTempToken({
      email: user.email,
      name: user.name || user.email.split('@')[0],
      googleId: user.id,
    });
    
    logger.info('GET /api/auth/google/callback', `New user redirected to selection: ${user.email}`);
    
    res.redirect(`${frontendUrl}/auth/google/select?token=${tempToken}`);
  } catch (error) {
    logger.error('GET /api/auth/google/callback', `Error in google callback: ${error.message}`, error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
  }
}

async function completeGoogleAuth(req, res) {
  try {
    const { tempToken, role, organizationId, organizationName } = req.body;
    logger.info('POST /api/auth/google/complete', `Complete Google auth with role: ${role}`);
    
    let tempData;
    try {
      tempData = jwt.verify(tempToken, jwtSecret);
    } catch (error) {
      logger.warn('POST /api/auth/google/complete', `Invalid or expired temp token`);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    const { email, name } = tempData;
    let user = await userModel.findByEmail(email);
    
    if (!user) {
      if (role === 'admin' && organizationName) {
        const orgModel = require('../models/organization');
        const { generateSlug } = require('../utils/slug');
        const { hashPassword } = require('../utils/password');
        
        const slug = generateSlug(organizationName);
        const org = await orgModel.create({
          name: organizationName,
          slug,
          createdBy: null,
        });
        
        user = await userModel.create({
          email,
          name,
          role: 'admin',
          organizationId: org.id,
          status: 'approved',
          password: null,
        });
        
        logger.info('POST /api/auth/google/complete', `New admin user created: ${user.id} (${email}) for org: ${org.id}`);
      } else if (role === 'user' && organizationId) {
        user = await userModel.create({
          email,
          name,
          role: 'user',
          organizationId,
          status: 'pending',
          password: null,
        });
        
        logger.info('POST /api/auth/google/complete', `New regular user created: ${user.id} (${email}), status: pending`);
      } else {
        logger.warn('POST /api/auth/google/complete', `Invalid role or organization for user: ${email}`);
        return res.status(400).json({ error: 'Invalid role or organization' });
      }
    } else {
      logger.info('POST /api/auth/google/complete', `Existing user authenticated: ${user.id} (${email})`);
    }
    
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
    });
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        organizationId: user.organization_id,
      }
    });
  } catch (error) {
    logger.error('POST /api/auth/google/complete', `Error completing Google auth: ${error.message}`, error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { generateToken, login, googleCallback, completeGoogleAuth };
