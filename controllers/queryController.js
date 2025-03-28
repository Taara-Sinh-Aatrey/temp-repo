const axios = require('axios');
const { formatError } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Forward query to external microservice
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processQuery = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Prepare query data for microservice
    const queryData = {
      merchantId,
      query,
      timestamp: new Date().toISOString()
    };
    
    // Forward query to microservice
    const response = await axios.post(
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
    
    // Return microservice response
    res.status(200).json(response.data);
  } catch (error) {
    logger.error('Error processing query:', error);
    
    // Handle axios errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return res.status(error.response.status).json({
        error: 'Query processing failed',
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(503).json({
        error: 'Query service unavailable',
        details: 'No response received from query service'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json(formatError(error));
    }
  }
};

module.exports = {
  processQuery
};