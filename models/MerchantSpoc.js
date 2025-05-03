import db from './db';
import { v4 as uuidv4 } from 'uuid';

class MerchantSpoc {
  /**
   * Create a new merchant SPOC
   * @param {Object} spocData - The SPOC data
   * @returns {Promise<Object>} The created SPOC
   */
  static async create(spocData) {
    const [spoc] = await db('merchant_spocs')
      .insert({
        id: uuidv4(),
        merchant_id: spocData.merchantId,
        name: spocData.name,
        email: spocData.email,
        phone_number: spocData.phoneNumber
      })
      .returning('*');
    
    return this.formatSpoc(spoc);
  }

  /**
   * Get a SPOC by ID
   * @param {string} id - The SPOC ID
   * @returns {Promise<Object|null>} The SPOC or null if not found
   */
  static async getById(id) {
    const spoc = await db('merchant_spocs')
      .where({ id })
      .first();
    
    return spoc ? this.formatSpoc(spoc) : null;
  }

  /**
   * Get SPOCs by merchant ID
   * @param {string} merchantId - The merchant ID
   * @returns {Promise<Array>} List of SPOCs for the merchant
   */
  static async getByMerchantId(merchantId) {
    const spocs = await db('merchant_spocs')
      .where({ merchant_id: merchantId })
      .select('*');
    
    return spocs.map(spoc => this.formatSpoc(spoc));
  }

  /**
   * Update a SPOC
   * @param {string} id - The SPOC ID
   * @param {Object} spocData - The SPOC data to update
   * @returns {Promise<Object>} The updated SPOC
   */
  static async update(id, merchantId, spocData) {
    const [spoc] = await db('merchant_spocs')
      .where({ 
        id,
        merchant_id: merchantId
      })
      .update({
        name: spocData.name,
        email: spocData.email,
        phone_number: spocData.phoneNumber
      })
      .returning('*');
    
    return this.formatSpoc(spoc);
  }

  /**
   * Delete a SPOC
   * @param {string} id - The SPOC ID
   * @param {string} merchantId - The merchant ID (for security)
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  static async delete(id, merchantId) {
    const result = await db('merchant_spocs')
      .where({ 
        id,
        merchant_id: merchantId
      })
      .delete();
    
    return result > 0;
  }

  /**
   * Format SPOC data to camelCase for API response
   * @param {Object} spoc - The SPOC data from database
   * @returns {Object} Formatted SPOC data
   */
  static formatSpoc(spoc) {
    return {
      id: spoc.id,
      merchantId: spoc.merchant_id,
      name: spoc.name,
      email: spoc.email,
      phoneNumber: spoc.phone_number,
      createdAt: spoc.created_at
    };
  }
}

export default MerchantSpoc;