require('dotenv').config();
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { initialize } from 'passport';
import logger from './utils/logger';
import * as validations from './middleware/validation';
const { errorHandler } = validations;

// Import routes
import authRoutes from './routes/auth';
import qrCodeRoutes from './routes/qrCode';
import dashboardRoutes from './routes/dashboard';
import queryRoutes from './routes/query';

// Initialize Express app
const app = express();

// Configure passport for Google OAuth
// Configure passport for Google OAuth
require('./config/passport').default;

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(initialize());

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

export default app;