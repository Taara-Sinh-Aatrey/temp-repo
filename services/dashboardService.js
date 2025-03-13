const Feedback = require('../models/Feedback');
const logger = require('../utils/logger');

/**
 * Get total feedback data for dashboard
 * @param {string} merchantId - The merchant ID
 * @param {Object} filters - Filters for the data
 * @returns {Promise<Object>} Feedback data
 */
const getTotalFeedbackData = async (merchantId, filters) => {
  try {
    return await Feedback.getTotalFeedbackCount(merchantId, filters);
  } catch (error) {
    logger.error('Error in getTotalFeedbackData service:', error);
    throw error;
  }
};

/**
 * Get customer revisit data for dashboard
 * @param {string} merchantId - The merchant ID
 * @param {Object} filters - Filters for the data
 * @returns {Promise<Object>} Revisit data
 */
const getCustomerRevisitData = async (merchantId, filters) => {
  try {
    return await Feedback.getCustomerRevisits(merchantId, filters);
  } catch (error) {
    logger.error('Error in getCustomerRevisitData service:', error);
    throw error;
  }
};

/**
 * Get sentiment analysis data for dashboard
 * @param {string} merchantId - The merchant ID
 * @param {Object} filters - Filters for the data
 * @returns {Promise<Object>} Sentiment data
 */
const getSentimentData = async (merchantId, filters) => {
  try {
    return await Feedback.getSentimentAnalysis(merchantId, filters);
  } catch (error) {
    logger.error('Error in getSentimentData service:', error);
    throw error;
  }
};

/**
 * Get top trends data for dashboard
 * @param {string} merchantId - The merchant ID
 * @param {Object} filters - Filters for the data
 * @returns {Promise<Array>} Top trends data
 */
const getTopTrendsData = async (merchantId, filters) => {
  try {
    return await Feedback.getTopTrends(merchantId, filters);
  } catch (error) {
    logger.error('Error in getTopTrendsData service:', error);
    throw error;
  }
};

/**
 * Get bottom trends data for dashboard
 * @param {string} merchantId - The merchant ID
 * @param {Object} filters - Filters for the data
 * @returns {Promise<Array>} Bottom trends data
 */
const getBottomTrendsData = async (merchantId, filters) => {
  try {
    return await Feedback.getBottomTrends(merchantId, filters);
  } catch (error) {
    logger.error('Error in getBottomTrendsData service:', error);
    throw error;
  }
};

/**
 * Get complete dashboard overview data
 * @param {string} merchantId - The merchant ID
 * @param {Object} filters - Filters for the data
 * @returns {Promise<Object>} Complete dashboard data
 */
const getDashboardOverview = async (merchantId, filters) => {
  try {
    // Get all data in parallel
    const [
      totalFeedbacks,
      customerRevisits,
      sentimentAnalysis,
      topTrends,
      bottomTrends
    ] = await Promise.all([
      Feedback.getTotalFeedbackCount(merchantId, filters),
      Feedback.getCustomerRevisits(merchantId, filters),
      Feedback.getSentimentAnalysis(merchantId, filters),
      Feedback.getTopTrends(merchantId, filters),
      Feedback.getBottomTrends(merchantId, filters)
    ]);
    
    return {
      totalFeedbacks,
      customerRevisits,
      sentimentAnalysis,
      topTrends,
      bottomTrends
    };
  } catch (error) {
    logger.error('Error in getDashboardOverview service:', error);
    throw error;
  }
};

module.exports = {
  getTotalFeedbackData,
  getCustomerRevisitData,
  getSentimentData,
  getTopTrendsData,
  getBottomTrendsData,
  getDashboardOverview
};