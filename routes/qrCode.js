const express = require('express');
const { body, param } = require('express-validator');
const { generateQRCode, getQRCodes, getQRCodeById, deleteQRCode } = require('../controllers/qrCodeController');
const { validateRequest } = require('../middleware/validation');
const { authenticateJWT, verifyMerchant } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);
router.use(verifyMerchant);

/**
 * @route POST /api/qrcode
 * @desc Generate a new QR code
 * @access Private
 */
router.post('/', [
  body('labelName').notEmpty().withMessage('Label name is required'),
  validateRequest
], generateQRCode);

/**
 * @route GET /api/qrcode
 * @desc Get all QR codes for a merchant
 * @access Private
 */
router.get('/', getQRCodes);

/**
 * @route GET /api/qrcode/:id
 * @desc Get a specific QR code by ID
 * @access Private
 */
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid QR code ID'),
  validateRequest
], getQRCodeById);

/**
 * @route DELETE /api/qrcode/:id
 * @desc Delete a QR code
 * @access Private
 */
router.delete('/:id', [
  param('id').isUUID().withMessage('Invalid QR code ID'),
  validateRequest
], deleteQRCode);

module.exports = router;