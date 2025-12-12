require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const { testConnection } = require('./config/database');

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

app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
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

async function startServer() {
  console.log('🔄 Testing database connection...');
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('⚠️  Warning: Database connection failed. Server will start but API may not work.');
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
  });
}

startServer();