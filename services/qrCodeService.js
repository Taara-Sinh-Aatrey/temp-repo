import { toDataURL } from 'qrcode';
import { create, getByMerchantId, getById, deleteQrCode } from '../models/QRCode.js';
import { encodeData } from '../utils/helpers.js';
import { error as _error } from '../utils/logger.js';

/**
 * Generate a QR code for a merchant
 * @param {string} merchantId - The merchant ID
 * @param {string} labelName - The QR code label
 * @returns {Promise<Object>} The generated QR code
 */
const generateQRCode = async (merchantId, labelName) => {
  try {
    // Create QR code data
    const qrData = {
      merchantId,
      labelName,
      timestamp: Date.now()
    };

    // Encode QR data (URL-safe)
    const encodedData = encodeData(qrData);

    // Generate feedback URL with encoded data
    const feedbackUrl = `${process.env.FRONTEND_URL || 'https://example.com'}/feedback?data=${encodedData}`;

    // Generate QR code as data URL
    const qrCodeImage = await toDataURL(feedbackUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      scale: 8,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Save QR code to database
    const qrCodeData = {
      merchantId,
      labelName,
      qrCode: qrCodeImage
    };

    const savedQRCode = await create(qrCodeData);
    return savedQRCode;
  } catch (error) {
    _error('Error in generateQRCode service:', error);
    throw error;
  }
};

/**
 * Get QR codes for a merchant
 * @param {string} merchantId - The merchant ID
 * @returns {Promise<Array>} List of QR codes
 */
const getQRCodes = async (merchantId) => {
  try {
    return await getByMerchantId(merchantId);
  } catch (error) {
    _error('Error in getQRCodes service:', error);
    throw error;
  }
};

/**
 * Get a specific QR code
 * @param {string} id - The QR code ID
 * @param {string} merchantId - The merchant ID
 * @returns {Promise<Object|null>} The QR code or null if not found
 */
const getQRCodeById = async (id, merchantId) => {
  try {
    const qrCode = await getById(id);
    
    if (!qrCode) {
      return null;
    }
    
    // Verify QR code belongs to merchant
    if (qrCode.merchantId !== merchantId) {
      throw new Error('Unauthorized access to QR code');
    }
    
    return qrCode;
  } catch (error) {
    _error('Error in getQRCodeById service:', error);
    throw error;
  }
};

/**
 * Delete a QR code
 * @param {string} id - The QR code ID
 * @param {string} merchantId - The merchant ID
 * @returns {Promise<boolean>} True if deleted, false otherwise
 */
const deleteQRCode = async (id, merchantId) => {
  try {
    return await deleteQrCode(id, merchantId);
  } catch (error) {
    _error('Error in deleteQRCode service:', error);
    throw error;
  }
};

export default {
  generateQRCode,
  getQRCodes,
  getQRCodeById,
  deleteQRCode
};