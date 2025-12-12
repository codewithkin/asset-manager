const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { googleClientId, googleClientSecret, googleCallbackUrl } = require('./auth');
const userModel = require('../models/user');

// Only configure Google OAuth if credentials are available
if (googleClientId && googleClientSecret) {
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: googleCallbackUrl,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const { id, emails, displayName } = profile;
      const email = emails[0].value;
      
      let user = await userModel.findByEmail(email);
      
      if (!user) {
        return done(null, {
          id: null,
          email: email,
          name: displayName || email.split('@')[0],
          role: null,
          organizationId: null,
        });
      }
      
      return done(null, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organization_id,
      });
    } catch (error) {
      return done(error, null);
    }
  }));
} else {
  console.warn('Google OAuth credentials not configured. Google authentication will be unavailable.');
}

module.exports = passport;

