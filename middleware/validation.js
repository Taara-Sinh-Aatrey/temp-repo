const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Middleware to validate request data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: errors.array() 
    });
  }
  
  next();
};

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);
  
  // Handle specific errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Default error handler
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};

/**
 * Middleware to parse date range from query params
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const parseDateRange = (req, res, next) => {
  const { timeRange } = req.query;
  const now = new Date();
  
  let startDate, endDate;

  switch (timeRange) {
    case 'last24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      endDate = now;
      break;
    case 'last7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = now;
      break;
    case 'last30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = now;
      break;
    default:
      // Default to last 30 days if not specified
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = now;
  }
  
  req.dateRange = {
    startDate,
    endDate
  };
  
  next();
};

module.exports = {
  validateRequest,
  errorHandler,
  parseDateRange
};