require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const { testConnection } = require('./config/database');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const assetRoutes = require('./routes/assets');
const categoryRoutes = require('./routes/categories');
const departmentRoutes = require('./routes/departments');
const orgRoutes = require('./routes/organizations');
const { errorHandler } = require('./middleware/error');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', "http://localhost:3001"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    logger.info(`${req.method} ${req.path}`, `Status: ${res.statusCode} | Duration: ${duration}ms`);
  });
  next();
});

app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  logger.info('GET /health', `Health check - DB: ${dbConnected ? 'connected' : 'disconnected'}`);
  res.json({ 
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/organizations', orgRoutes);

app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  logger.warn(`${req.method} ${req.path}`, '404 Not Found');
  res.status(404).json({ error: 'Not Found' });
});

async function startServer() {
  console.log('🔄 Testing database connection...');
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    logger.warn('Server startup', 'Database connection failed');
    console.error('⚠️  Warning: Database connection failed. Server will start but API may not work.');
  }
  
  app.listen(PORT, () => {
    logger.info('Server startup', `Backend server running on port ${PORT}`);
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
  });
}

startServer();