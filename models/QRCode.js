import db from './db.js';
import { v4 as uuidv4 } from 'uuid';

class QRCode {
  /**
   * Create a new QR code
   * @param {Object} qrCodeData - The QR code data
   * @returns {Promise<Object>} The created QR code
   */
  static async create(qrCodeData) {
    const [qrCode] = await db('QRCodes')
      .insert({
        id: uuidv4(),
        merchantId: qrCodeData.merchantId,
        labelName: qrCodeData.labelName,
        qrCode: qrCodeData.qrCode
      })
      .returning('*');
    
    return this.formatQRCode(qrCode);
  }

  /**
   * Get QR codes by merchant ID
   * @param {string} merchantId - The merchant ID
   * @returns {Promise<Array>} List of QR codes for the merchant
   */
  static async getByMerchantId(merchantId) {
    const qrCodes = await db('QRCodes')
      .where({ 
        merchantId,
        deletedAt: null
      })
      .select('*');
    
    return qrCodes.map(qrCode => this.formatQRCode(qrCode));
  }

  /**
   * Get a QR code by ID
   * @param {string} id - The QR code ID
   * @returns {Promise<Object|null>} The QR code or null if not found
   */
  static async getById(id) {
    const qrCode = await db('QRCodes')
      .where({ 
        id,
        deletedAt: null 
      })
      .first();
    
    return qrCode ? this.formatQRCode(qrCode) : null;
  }

  /**
   * Delete a QR code (soft delete)
   * @param {string} id - The QR code ID
   * @param {string} merchantId - The merchant ID (for security)
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  static async deleteQrCode(id, merchantId) {
    const result = await db('QRCodes')
      .where({ 
        id,
        merchantId 
      })
      .update({
        deletedAt: db.fn.now()
      });
    
    return result > 0;
  }

  /**
   * Format QR code data to camelCase for API response
   * @param {Object} qrCode - The QR code data from database
   * @returns {Object} Formatted QR code data
   */
  static formatQRCode(qrCode) {
    return {
      id: qrCode.id,
      merchantId: qrCode.merchantId,
      labelName: qrCode.labelName,
      qrCode: qrCode.qrCode,
      createdAt: qrCode.createdAt,
      updatedAt: qrCode.updatedAt
    };
  }
}

export default QRCode;