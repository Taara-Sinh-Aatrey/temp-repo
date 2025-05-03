import { Router } from 'express';
import { body } from 'express-validator';
import { processQuery } from '../controllers/queryController';
import { validateRequest } from '../middleware/validation';
import { authenticateJWT, verifyMerchant } from '../middleware/auth';

const router = Router();

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

export default router;