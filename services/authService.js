const Merchant = require('../models/Merchant');
const { generateToken } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Register a new merchant
 * @param {Object} merchantData - The merchant data
 * @returns {Promise<Object>} Object containing merchant and token
 */
const registerMerchant = async (merchantData) => {
  try {
    // Check if merchant with email already exists
    const existingMerchant = await Merchant.getByEmail(merchantData.email);
    if (existingMerchant) {
      throw new Error('Merchant with this email already exists');
    }

    // Create new merchant
    const merchant = await Merchant.create(merchantData);

    // Generate JWT token
    const token = generateToken(merchant);

    return { merchant, token };
  } catch (error) {
    logger.error('Error in registerMerchant service:', error);
    throw error;
  }
};

/**
 * Login with Google OAuth
 * @param {Object} user - The authenticated user from Google OAuth
 * @returns {Promise<Object>} Object containing merchant and token
 */
const loginWithGoogle = async (user) => {
  try {
    const merchant = await Merchant.getByEmail(user.email);
    
    if (!merchant) {
      throw new Error('Merchant not found');
    }
    
    // Generate JWT token
    const token = generateToken(merchant);

    return { merchant, token };
  } catch (error) {
    logger.error('Error in loginWithGoogle service:', error);
    throw error;
  }
};

/**
 * Get merchant profile with SPOCs
 * @param {string} merchantId - The merchant ID
 * @returns {Promise<Object>} Object containing merchant and spocs
 */
const getMerchantProfile = async (merchantId) => {
  try {
    const merchant = await Merchant.getById(merchantId);
    
    if (!merchant) {
      throw new Error('Merchant not found');
    }
    
    const spocs = await Merchant.getSpocs(merchantId);
    
    return { merchant, spocs };
  } catch (error) {
    logger.error('Error in getMerchantProfile service:', error);
    throw error;
  }
};

/**
 * Update merchant profile
 * @param {string} merchantId - The merchant ID
 * @param {Object} merchantData - The merchant data to update
 * @returns {Promise<Object>} The updated merchant
 */
const updateMerchantProfile = async (merchantId, merchantData) => {
  try {
    const merchant = await Merchant.update(merchantId, merchantData);
    
    if (!merchant) {
      throw new Error('Merchant not found');
    }
    
    return merchant;
  } catch (error) {
    logger.error('Error in updateMerchantProfile service:', error);
    throw error;
  }
};

module.exports = {
  registerMerchant,
  loginWithGoogle,
  getMerchantProfile,
  updateMerchantProfile
};