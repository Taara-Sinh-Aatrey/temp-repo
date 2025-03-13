const Feedback = require('../models/Feedback');
const { formatError } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Get total feedback count with time series data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTotalFeedbacks = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { timeRange, qrLabel } = req.query;
    
    // Parse date range from request
    const { startDate, endDate } = req.dateRange;
    
    // Get feedback data
    const feedbackData = await Feedback.getTotalFeedbackCount(
      merchantId,
      {
        startDate,
        endDate,
        timeInterval: timeRange === 'last24h' ? 'hour' : 'day',
        qrLabel
      }
    );
    
    res.status(200).json(feedbackData);
  } catch (error) {
    logger.error('Error getting total feedbacks:', error);
    res.status(500).json(formatError(error));
  }
};

/**
 * Get customer revisit data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCustomerRevisits = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { timeRange, visitTypes } = req.query;
    
    // Parse date range from request
    const { startDate, endDate } = req.dateRange;
    
    // Parse visit types to include
    const visitTypesArray = visitTypes ? visitTypes.split(',') : ['oneTime', 'twoTime', 'multiple'];
    
    // Get revisit data
    const revisitData = await Feedback.getCustomerRevisits(
      merchantId,
      {
        startDate,
        endDate,
        timeInterval: timeRange === 'last24h' ? 'hour' : 'day',
        visitTypes: visitTypesArray
      }
    );
    
    // Filter by visit types if specified
    if (visitTypes) {
      const filteredData = {
        visitFrequency: {},
        timeSeries: revisitData.timeSeries
      };
      
      // Include only requested visit types
      visitTypesArray.forEach(type => {
        if (revisitData.visitFrequency[type] !== undefined) {
          filteredData.visitFrequency[type] = revisitData.visitFrequency[type];
        }
      });
      
      res.status(200).json(filteredData);
    } else {
      res.status(200).json(revisitData);
    }
  } catch (error) {
    logger.error('Error getting customer revisits:', error);
    res.status(500).json(formatError(error));
  }
};

/**
 * Get sentiment analysis data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSentimentAnalysis = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { timeRange, qrLabel, sentimentType, ratingSource } = req.query;
    
    // Parse date range from request
    const { startDate, endDate } = req.dateRange;
    
    // Get sentiment data
    const sentimentData = await Feedback.getSentimentAnalysis(
      merchantId,
      {
        startDate,
        endDate,
        timeInterval: timeRange === 'last24h' ? 'hour' : 'day',
        qrLabel,
        sentimentType,
        ratingSource: ratingSource || 'pops' // Default to PoPs rating
      }
    );
    
    // Filter by sentiment type if specified
    if (sentimentType === 'positive') {
      // Only include positive sentiment data
      const filteredData = {
        overall: {
          positiveCount: sentimentData.overall.positiveCount,
          averageScore: sentimentData.overall.averageScore
        },
        distribution: sentimentData.distribution.filter(item => item.rating > 3),
        timeSeries: sentimentData.timeSeries
      };
      
      res.status(200).json(filteredData);
    } else if (sentimentType === 'negative') {
      // Only include negative sentiment data
      const filteredData = {
        overall: {
          negativeCount: sentimentData.overall.negativeCount,
          averageScore: sentimentData.overall.averageScore
        },
        distribution: sentimentData.distribution.filter(item => item.rating < 3),
        timeSeries: sentimentData.timeSeries
      };
      
      res.status(200).json(filteredData);
    } else {
      // Return all sentiment data
      res.status(200).json(sentimentData);
    }
  } catch (error) {
    logger.error('Error getting sentiment analysis:', error);
    res.status(500).json(formatError(error));
  }
};

/**
 * Get top trends from feedback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTopTrends = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    
    // Parse date range from request
    const { startDate, endDate } = req.dateRange;
    
    // Get top trends
    const trends = await Feedback.getTopTrends(
      merchantId,
      {
        startDate,
        endDate
      }
    );
    
    res.status(200).json({ trends });
  } catch (error) {
    logger.error('Error getting top trends:', error);
    res.status(500).json(formatError(error));
  }
};

/**
 * Get bottom trends from feedback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBottomTrends = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    
    // Parse date range from request
    const { startDate, endDate } = req.dateRange;
    
    // Get bottom trends
    const trends = await Feedback.getBottomTrends(
      merchantId,
      {
        startDate,
        endDate
      }
    );
    
    res.status(200).json({ trends });
  } catch (error) {
    logger.error('Error getting bottom trends:', error);
    res.status(500).json(formatError(error));
  }
};

/**
 * Get dashboard overview data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDashboardOverview = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { timeRange, qrLabel } = req.query;
    
    // Parse date range from request
    const { startDate, endDate } = req.dateRange;
    
    // Get all data in parallel
    const [
      totalFeedbacks,
      customerRevisits,
      sentimentAnalysis,
      topTrends,
      bottomTrends
    ] = await Promise.all([
      Feedback.getTotalFeedbackCount(merchantId, { startDate, endDate, qrLabel }),
      Feedback.getCustomerRevisits(merchantId, { startDate, endDate }),
      Feedback.getSentimentAnalysis(merchantId, { startDate, endDate, qrLabel }),
      Feedback.getTopTrends(merchantId, { startDate, endDate }),
      Feedback.getBottomTrends(merchantId, { startDate, endDate })
    ]);
    
    // Return combined dashboard data
    res.status(200).json({
      totalFeedbacks,
      customerRevisits,
      sentimentAnalysis,
      topTrends,
      bottomTrends
    });
  } catch (error) {
    logger.error('Error getting dashboard overview:', error);
    res.status(500).json(formatError(error));
  }
};

module.exports = {
  getTotalFeedbacks,
  getCustomerRevisits,
  getSentimentAnalysis,
  getTopTrends,
  getBottomTrends,
  getDashboardOverview
};