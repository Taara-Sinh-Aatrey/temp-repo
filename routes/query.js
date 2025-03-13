const express = require('express');
const { body } = require('express-validator');
const { processQuery } = require('../controllers/queryController');
const { validateRequest } = require('../middleware/validation');
const { authenticateJWT, verifyMerchant } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware
router.use(authenticateJWT);
router.use(verifyMerchant);

/**
 * @route POST /api/query
 * @desc Process a natural language query using the query microservice
 * @access Private
 */
router.post('/', [
  body('query').notEmpty().withMessage('Query is required'),
  validateRequest
], processQuery);

module.exports = router;