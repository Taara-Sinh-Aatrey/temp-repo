const db = require('./db');
const { v4: uuidv4 } = require('uuid');

class Merchant {
  /**
   * Create a new merchant
   * @param {Object} merchantData - The merchant data
   * @returns {Promise<Object>} The created merchant
   */
  static async create(merchantData) {
    const [merchant] = await db('merchants')
      .insert({
        id: uuidv4(),
        first_name: merchantData.firstName,
        last_name: merchantData.lastName,
        email: merchantData.email,
        phone_number: merchantData.phoneNumber,
        business_name: merchantData.businessName,
        brand_name: merchantData.brandName,
        brand_logo: merchantData.brandLogo,
        industry: merchantData.industry,
        sub_industry: merchantData.subIndustry,
        location_lat: merchantData.locationLat,
        location_lng: merchantData.locationLng,
        google_place_id: merchantData.googlePlaceId,
        status: 'active'
      })
      .returning('*');
    
    return this.formatMerchant(merchant);
  }

  /**
   * Get a merchant by ID
   * @param {string} id - The merchant ID
   * @returns {Promise<Object|null>} The merchant or null if not found
   */
  static async getById(id) {
    const merchant = await db('merchants')
      .where({ id })
      .first();
    
    return merchant ? this.formatMerchant(merchant) : null;
  }

  /**
   * Get a merchant by email
   * @param {string} email - The merchant email
   * @returns {Promise<Object|null>} The merchant or null if not found
   */
  static async getByEmail(email) {
    const merchant = await db('merchants')
      .where({ email })
      .first();
    
    return merchant ? this.formatMerchant(merchant) : null;
  }

  /**
   * Update a merchant
   * @param {string} id - The merchant ID
   * @param {Object} merchantData - The merchant data to update
   * @returns {Promise<Object>} The updated merchant
   */
  static async update(id, merchantData) {
    const [merchant] = await db('merchants')
      .where({ id })
      .update({
        first_name: merchantData.firstName,
        last_name: merchantData.lastName,
        phone_number: merchantData.phoneNumber,
        business_name: merchantData.businessName,
        brand_name: merchantData.brandName,
        brand_logo: merchantData.brandLogo,
        industry: merchantData.industry,
        sub_industry: merchantData.subIndustry,
        location_lat: merchantData.locationLat,
        location_lng: merchantData.locationLng,
        google_place_id: merchantData.googlePlaceId,
        updated_at: db.fn.now()
      })
      .returning('*');
    
    return this.formatMerchant(merchant);
  }

  /**
   * Format merchant data to camelCase for API response
   * @param {Object} merchant - The merchant data from database
   * @returns {Object} Formatted merchant data
   */
  static formatMerchant(merchant) {
    return {
      id: merchant.id,
      firstName: merchant.first_name,
      lastName: merchant.last_name,
      email: merchant.email,
      phoneNumber: merchant.phone_number,
      businessName: merchant.business_name,
      brandName: merchant.brand_name,
      brandLogo: merchant.brand_logo,
      industry: merchant.industry,
      subIndustry: merchant.sub_industry,
      locationLat: merchant.location_lat,
      locationLng: merchant.location_lng,
      googlePlaceId: merchant.google_place_id,
      status: merchant.status,
      createdAt: merchant.created_at,
      updatedAt: merchant.updated_at
    };
  }

  /**
   * Get SPOC details for a merchant
   * @param {string} merchantId - The merchant ID
   * @returns {Promise<Array>} List of SPOCs for the merchant
   */
  static async getSpocs(merchantId) {
    const spocs = await db('merchant_spocs')
      .where({ merchant_id: merchantId })
      .select('*');
    
    return spocs.map(spoc => ({
      id: spoc.id,
      merchantId: spoc.merchant_id,
      name: spoc.name,
      email: spoc.email,
      phoneNumber: spoc.phone_number,
      createdAt: spoc.created_at
    }));
  }

  /**
   * Add a SPOC for a merchant
   * @param {string} merchantId - The merchant ID
   * @param {Object} spocData - The SPOC data to add
   * @returns {Promise<Object>} The created SPOC
   */
  static async addSpoc(merchantId, spocData) {
    const [spoc] = await db('merchant_spocs')
      .insert({
        id: uuidv4(),
        merchant_id: merchantId,
        name: spocData.name,
        email: spocData.email,
        phone_number: spocData.phoneNumber
      })
      .returning('*');
    
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

module.exports = Merchant;