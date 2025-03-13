const QRCode = require('../models/QRCode');
const qrcode = require('qrcode');
const { formatError, encodeData } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Generate a QR code for a merchant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateQRCode = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { labelName } = req.body;

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
    const qrCodeImage = await qrcode.toDataURL(feedbackUrl, {
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

    const savedQRCode = await QRCode.create(qrCodeData);

    // Return QR code data
    res.status(201).json({
      message: 'QR code generated successfully',
      qrCode: savedQRCode
    });
  } catch (error) {
    logger.error('Error generating QR code:', error);
    res.status(500).json(formatError(error));
  }
};

/**
 * Get all QR codes for a merchant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getQRCodes = async (req, res) => {
  try {
    const merchantId = req.merchant.id;

    // Get all QR codes for merchant
    const qrCodes = await QRCode.getByMerchantId(merchantId);

    // Return QR codes
    res.status(200).json({
      qrCodes
    });
  } catch (error) {
    logger.error('Error getting QR codes:', error);
    res.status(500).json(formatError(error));
  }
};

/**
 * Get a specific QR code by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getQRCodeById = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { id } = req.params;

    // Get QR code
    const qrCode = await QRCode.getById(id);

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Verify QR code belongs to merchant
    if (qrCode.merchantId !== merchantId) {
      return res.status(403).json({ error: 'Unauthorized access to QR code' });
    }

    // Return QR code
    res.status(200).json({
      qrCode
    });
  } catch (error) {
    logger.error('Error getting QR code by ID:', error);
    res.status(500).json(formatError(error));
  }
};

/**
 * Delete a QR code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteQRCode = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { id } = req.params;

    // Delete QR code
    const deleted = await QRCode.delete(id, merchantId);

    if (!deleted) {
      return res.status(404).json({ error: 'QR code not found or not authorized to delete' });
    }

    // Return success message
    res.status(200).json({
      message: 'QR code deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting QR code:', error);
    res.status(500).json(formatError(error));
  }
};

module.exports = {
  generateQRCode,
  getQRCodes,
  getQRCodeById,
  deleteQRCode
};