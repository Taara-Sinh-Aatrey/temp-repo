import { post } from 'axios';
import { error as _error } from '../utils/logger.js';

/**
 * Process a natural language query using external microservice
 * @param {string} merchantId - The merchant ID
 * @param {string} query - The natural language query
 * @returns {Promise<Object>} The query result
 */
const processQuery = async (merchantId, query) => {
  try {
    // Prepare query data for microservice
    const queryData = {
      merchantId,
      query,
      timestamp: new Date().toISOString()
    };
    
    // Forward query to microservice
    const response = await post(
      process.env.QUERY_SERVICE_URL,
      queryData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.QUERY_SERVICE_API_KEY}`
        },
        timeout: 10000 // 10 seconds timeout
      }
    );
    
    return response.data;
  } catch (error) {
    _error('Error in processQuery service:', error);
    
    // Handle axios errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(`Query processing failed: ${error.response.data.error || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('Query service unavailable: No response received');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
};

export default {
  processQuery
};