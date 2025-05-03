import Merchant from '../models/Merchant';
import * as helpers from '../utils/helpers';
const { generateToken, formatError } = helpers;
import logger from '../utils/logger';

/**
 * Register a new merchant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      businessName,
      brandName,
      brandLogo,
      industry,
      subIndustry,
      locationLat,
      locationLng,
      googlePlaceId
    } = req.body;

    // Check if merchant with email already exists
    const existingMerchant = await Merchant.getByEmail(email);
    if (existingMerchant) {
      return res.status(409).json({ 
        error: 'Merchant with this email already exists' 
      });
    }

    // Create new merchant
    const merchantData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      businessName,
      brandName,
      brandLogo,
      industry,
      subIndustry,
      locationLat,
      locationLng,
      googlePlaceId
    };

    const merchant = await Merchant.create(merchantData);

    // Generate JWT token
    const token = generateToken(merchant);

    // Return merchant and token
    res.status(201).json({
      message: 'Merchant registered successfully',
      merchant,
      token
    });
  } catch (error) {
    logger.error('Error in merchant signup:', error);
    res.status(500).json(formatError(error));
  }
};

/**
 * Login merchant with Google OAuth
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const googleLogin = (req, res) => {
  try {
    // Passport.js has already authenticated the user at this point
    const merchant = req.user;
    
    // Generate JWT token
    const token = generateToken(merchant);

    // Return merchant and token
    res.status(200).json({
      message: 'Login successful',
      merchant,
      token
    });
  } catch (error) {
    logger.error('Error in Google login:', error);
    res.status(500).json(formatError(error));
  }
};

/**
 * Get merchant profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    
    // Get merchant data
    const merchant = await Merchant.getById(merchantId);
    
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    
    // Get merchant SPOCs
    const spocs = await Merchant.getSpocs(merchantId);
    
    // Return merchant profile with SPOCs
    res.status(200).json({
      merchant,
      spocs
    });
  } catch (error) {
    logger.error('Error getting merchant profile:', error);
    res.status(500).json(formatError(error));
  }
};

/**
 * Update merchant profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProfile = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const {
      firstName,
      lastName,
      phoneNumber,
      businessName,
      brandName,
      brandLogo,
      industry,
      subIndustry,
      locationLat,
      locationLng,
      googlePlaceId
    } = req.body;

    // Update merchant
    const merchantData = {
      firstName,
      lastName,
      phoneNumber,
      businessName,
      brandName,
      brandLogo,
      industry,
      subIndustry,
      locationLat,
      locationLng,
      googlePlaceId
    };

    const merchant = await Merchant.update(merchantId, merchantData);

    // Return updated merchant
    res.status(200).json({
      message: 'Merchant profile updated successfully',
      merchant
    });
  } catch (error) {
    logger.error('Error updating merchant profile:', error);
    res.status(500).json(formatError(error));
  }
};

export default {
  signup,
  googleLogin,
  getProfile,
  updateProfile
};