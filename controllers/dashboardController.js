import Feedback from '../models/Feedback.js';
import * as helpers from '../utils/helpers.js';
const { formatError } = helpers;
import logger from '../utils/logger.js';

/**
 * Get total feedback count with time series data
 */
const getTotalFeedbacks = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { timeRange, qrLabel } = req.query;
    const { startDate, endDate } = req.dateRange;

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
 */
const getCustomerRevisits = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { timeRange, visitTypes } = req.query;
    const { startDate, endDate } = req.dateRange;
    const visitTypesArray = visitTypes ? visitTypes.split(',') : ['oneTime', 'twoTime', 'multiple'];

    const revisitData = await Feedback.getCustomerRevisits(
      merchantId,
      {
        startDate,
        endDate,
        timeInterval: timeRange === 'last24h' ? 'hour' : 'day',
        visitTypes: visitTypesArray
      }
    );

    if (visitTypes) {
      const filteredData = {
        visitFrequency: {},
        timeSeries: revisitData.timeSeries
      };
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
 */
const getSentimentAnalysis = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { timeRange, qrLabel, sentimentType, ratingSource } = req.query;
    const { startDate, endDate } = req.dateRange;

    const sentimentData = await Feedback.getSentimentAnalysis(
      merchantId,
      {
        startDate,
        endDate,
        timeInterval: timeRange === 'last24h' ? 'hour' : 'day',
        qrLabel,
        sentimentType,
        ratingSource: ratingSource || 'pops'
      }
    );

    if (sentimentType === 'positive') {
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
      res.status(200).json(sentimentData);
    }
  } catch (error) {
    logger.error('Error getting sentiment analysis:', error);
    res.status(500).json(formatError(error));
  }
};

/**
 * Get top trends from feedback
 */
const getTopTrends = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { startDate, endDate } = req.dateRange;

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
 */
const getBottomTrends = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { startDate, endDate } = req.dateRange;

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
 */
const getDashboardOverview = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { timeRange, qrLabel } = req.query;
    const { startDate, endDate } = req.dateRange;

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

export {
  getTotalFeedbacks,
  getCustomerRevisits,
  getSentimentAnalysis,
  getTopTrends,
  getBottomTrends,
  getDashboardOverview
};
