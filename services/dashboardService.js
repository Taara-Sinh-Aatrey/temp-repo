import { getTotalFeedbackCount, getCustomerRevisits, getSentimentAnalysis, getTopTrends, getBottomTrends } from '../models/Feedback.js';
import { error as _error } from '../utils/logger.js';

/**
 * Get total feedback data for dashboard
 * @param {string} merchantId - The merchant ID
 * @param {Object} filters - Filters for the data
 * @returns {Promise<Object>} Feedback data
 */
const getTotalFeedbackData = async (merchantId, filters) => {
  try {
    return await getTotalFeedbackCount(merchantId, filters);
  } catch (error) {
    _error('Error in getTotalFeedbackData service:', error);
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
    return await getCustomerRevisits(merchantId, filters);
  } catch (error) {
    _error('Error in getCustomerRevisitData service:', error);
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
    return await getSentimentAnalysis(merchantId, filters);
  } catch (error) {
    _error('Error in getSentimentData service:', error);
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
    return await getTopTrends(merchantId, filters);
  } catch (error) {
    _error('Error in getTopTrendsData service:', error);
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
    return await getBottomTrends(merchantId, filters);
  } catch (error) {
    _error('Error in getBottomTrendsData service:', error);
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
      getTotalFeedbackCount(merchantId, filters),
      getCustomerRevisits(merchantId, filters),
      getSentimentAnalysis(merchantId, filters),
      getTopTrends(merchantId, filters),
      getBottomTrends(merchantId, filters)
    ]);
    
    return {
      totalFeedbacks,
      customerRevisits,
      sentimentAnalysis,
      topTrends,
      bottomTrends
    };
  } catch (error) {
    _error('Error in getDashboardOverview service:', error);
    throw error;
  }
};

export default {
  getTotalFeedbackData,
  getCustomerRevisitData,
  getSentimentData,
  getTopTrendsData,
  getBottomTrendsData,
  getDashboardOverview
};