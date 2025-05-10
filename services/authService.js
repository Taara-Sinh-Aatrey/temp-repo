import { getByEmail, create, getById, getSpocs, update } from '../models/Merchant.js';
import { generateToken } from '../utils/helpers.js';
import { error as _error } from '../utils/logger.js';

/**
 * Register a new merchant
 * @param {Object} merchantData - The merchant data
 * @returns {Promise<Object>} Object containing merchant and token
 */
const registerMerchant = async (merchantData) => {
  try {
    // Check if merchant with email already exists
    const existingMerchant = await getByEmail(merchantData.email);
    if (existingMerchant) {
      throw new Error('Merchant with this email already exists');
    }

    // Create new merchant
    const merchant = await create(merchantData);

    // Generate JWT token
    const token = generateToken(merchant);

    return { merchant, token };
  } catch (error) {
    _error('Error in registerMerchant service:', error);
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
    const merchant = await getByEmail(user.email);
    
    if (!merchant) {
      throw new Error('Merchant not found');
    }
    
    // Generate JWT token
    const token = generateToken(merchant);

    return { merchant, token };
  } catch (error) {
    _error('Error in loginWithGoogle service:', error);
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
    const merchant = await getById(merchantId);
    
    if (!merchant) {
      throw new Error('Merchant not found');
    }
    
    const spocs = await getSpocs(merchantId);
    
    return { merchant, spocs };
  } catch (error) {
    _error('Error in getMerchantProfile service:', error);
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
    const merchant = await update(merchantId, merchantData);
    
    if (!merchant) {
      throw new Error('Merchant not found');
    }
    
    return merchant;
  } catch (error) {
    _error('Error in updateMerchantProfile service:', error);
    throw error;
  }
};

export default {
  registerMerchant,
  loginWithGoogle,
  getMerchantProfile,
  updateMerchantProfile
};