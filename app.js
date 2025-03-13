require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/validation');

// Import routes
const authRoutes = require('./routes/auth');
const qrCodeRoutes = require('./routes/qrCode');
const dashboardRoutes = require('./routes/dashboard');
const queryRoutes = require('./routes/query');

// Initialize Express app
const app = express();

// Configure passport for Google OAuth
require('./config/passport');

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(passport.initialize());

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/qrcode', qrCodeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/query', queryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // In production, you might want to gracefully shut down the server
  // process.exit(1);
});

module.exports = app;