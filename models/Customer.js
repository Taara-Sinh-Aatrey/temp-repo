import db from './db';
import { v4 as uuidv4 } from 'uuid';

class Customer {
  /**
   * Create a new customer or update if exists by googleOAuthId
   * @param {Object} customerData - The customer data
   * @returns {Promise<Object>} The created or updated customer
   */
  static async createOrUpdate(customerData) {
    // Check if customer exists
    const existingCustomer = await db('customers')
      .where({ google_oauth_id: customerData.googleOAuthId })
      .first();
    
    if (existingCustomer) {
      // Update existing customer
      const [customer] = await db('customers')
        .where({ id: existingCustomer.id })
        .update({
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          email: customerData.email,
          profile_pic: customerData.profilePic,
          gender: customerData.gender,
          primary_language: customerData.primaryLanguage,
          updated_at: db.fn.now()
        })
        .returning('*');
      
      return this.formatCustomer(customer);
    } else {
      // Create new customer
      const [customer] = await db('customers')
        .insert({
          id: uuidv4(),
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          email: customerData.email,
          google_oauth_id: customerData.googleOAuthId,
          profile_pic: customerData.profilePic,
          gender: customerData.gender,
          primary_language: customerData.primaryLanguage
        })
        .returning('*');
      
      return this.formatCustomer(customer);
    }
  }

  /**
   * Get a customer by ID
   * @param {string} id - The customer ID
   * @returns {Promise<Object|null>} The customer or null if not found
   */
  static async getById(id) {
    const customer = await db('customers')
      .where({ id })
      .first();
    
    return customer ? this.formatCustomer(customer) : null;
  }

  /**
   * Get a customer by Google OAuth ID
   * @param {string} googleOAuthId - The Google OAuth ID
   * @returns {Promise<Object|null>} The customer or null if not found
   */
  static async getByGoogleOAuthId(googleOAuthId) {
    const customer = await db('customers')
      .where({ google_oauth_id: googleOAuthId })
      .first();
    
    return customer ? this.formatCustomer(customer) : null;
  }

  /**
   * Get a customer by email
   * @param {string} email - The customer email
   * @returns {Promise<Object|null>} The customer or null if not found
   */
  static async getByEmail(email) {
    const customer = await db('customers')
      .where({ email })
      .first();
    
    return customer ? this.formatCustomer(customer) : null;
  }

  /**
   * Format customer data to camelCase for API response
   * @param {Object} customer - The customer data from database
   * @returns {Object} Formatted customer data
   */
  static formatCustomer(customer) {
    return {
      id: customer.id,
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      googleOAuthId: customer.google_oauth_id,
      profilePic: customer.profile_pic,
      gender: customer.gender,
      primaryLanguage: customer.primary_language,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at
    };
  }
}

export default Customer;