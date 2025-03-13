const express = require('express');
const { query } = require('express-validator');
const { 
  getTotalFeedbacks, 
  getCustomerRevisits, 
  getSentimentAnalysis, 
  getTopTrends, 
  getBottomTrends,
  getDashboardOverview
} = require('../controllers/dashboardController');
const { validateRequest, parseDateRange } = require('../middleware/validation');
const { authenticateJWT, verifyMerchant } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);
router.use(verifyMerchant);

// Apply date range parsing middleware to all routes
router.use(parseDateRange);

/**
 * @route GET /api/dashboard/overview
 * @desc Get dashboard overview data
 * @access Private
 */
router.get('/overview', [
  query('timeRange').optional().isIn(['last24h', 'last7d', 'last30d']).withMessage('Invalid time range'),
  query('qrLabel').optional(),
  validateRequest
], getDashboardOverview);

/**
 * @route GET /api/dashboard/feedback
 * @desc Get total feedback count with time series data
 * @access Private
 */
router.get('/feedback', [
  query('timeRange').optional().isIn(['last24h', 'last7d', 'last30d']).withMessage('Invalid time range'),
  query('qrLabel').optional(),
  validateRequest
], getTotalFeedbacks);

/**
 * @route GET /api/dashboard/revisits
 * @desc Get customer revisit data
 * @access Private
 */
router.get('/revisits', [
  query('timeRange').optional().isIn(['last24h', 'last7d', 'last30d']).withMessage('Invalid time range'),
  query('visitTypes').optional(),
  validateRequest
], getCustomerRevisits);

/**
 * @route GET /api/dashboard/sentiment
 * @desc Get sentiment analysis data
 * @access Private
 */
router.get('/sentiment', [
  query('timeRange').optional().isIn(['last24h', 'last7d', 'last30d']).withMessage('Invalid time range'),
  query('qrLabel').optional(),
  query('sentimentType').optional().isIn(['positive', 'negative', 'all']).withMessage('Invalid sentiment type'),
  query('ratingSource').optional().isIn(['pops', 'google']).withMessage('Invalid rating source'),
  validateRequest
], getSentimentAnalysis);

/**
 * @route GET /api/dashboard/top-trends
 * @desc Get top trends from feedback
 * @access Private
 */
router.get('/top-trends', getTopTrends);

/**
 * @route GET /api/dashboard/bottom-trends
 * @desc Get bottom trends from feedback
 * @access Private
 */
router.get('/bottom-trends', getBottomTrends);

module.exports = router;