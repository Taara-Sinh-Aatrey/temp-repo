const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for a merchant
 * @param {Object} merchant - The merchant object
 * @returns {string} The JWT token
 */
const generateToken = (merchant) => {
  const payload = {
    id: merchant.id,
    email: merchant.email,
    businessName: merchant.businessName
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * Format error response
 * @param {Error|string} error - The error object or message
 * @returns {Object} Formatted error response
 */
const formatError = (error) => {
  if (error instanceof Error) {
    return {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
  return { error };
};

/**
 * Parse date range from predefined ranges
 * @param {string} range - Predefined range (last24h, last7d, last30d)
 * @returns {Object} Object with startDate and endDate
 */
const parseDateRange = (range) => {
  const now = new Date();
  let startDate;

  switch (range) {
    case 'last24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'last7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'last30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      // Default to last 30 days
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return {
    startDate,
    endDate: now
  };
};

/**
 * Create a URL-safe base64 string
 * @param {Object} data - The data to encode
 * @returns {string} URL-safe base64 string
 */
const encodeData = (data) => {
  const jsonStr = JSON.stringify(data);
  return Buffer.from(jsonStr).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Decode a URL-safe base64 string
 * @param {string} str - The URL-safe base64 string to decode
 * @returns {Object|null} Decoded data or null if invalid
 */
const decodeData = (str) => {
  try {
    const base64 = str
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const jsonStr = Buffer.from(base64, 'base64').toString();
    return JSON.parse(jsonStr);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  formatError,
  parseDateRange,
  encodeData,
  decodeData
};