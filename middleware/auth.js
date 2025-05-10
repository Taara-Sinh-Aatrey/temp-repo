import pkg from 'jsonwebtoken';
const { verify } = pkg;
import Merchant from '../models/Merchant.js';
import logger from '../utils/logger.js';

/**
 * Middleware to authenticate JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is required' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'JWT token is required' });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.merchant = decoded;
    next();
  } catch (error) {
    logger.error('JWT verification failed:', error);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to verify merchant exists in database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const verifyMerchant = async (req, res, next) => {
  try {
    const merchant = await Merchant.getById(req.merchant.id);
    
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    
    if (merchant.status !== 'active') {
      return res.status(403).json({ error: 'Merchant account is not active' });
    }
    
    req.merchantData = merchant;
    next();
  } catch (error) {
    logger.error('Merchant verification failed:', error);
    res.status(500).json({ error: 'Failed to verify merchant' });
  }
};
