import { Router } from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import { signup, googleLogin, getProfile, updateProfile } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validation.js';
import { authenticateJWT, verifyMerchant } from '../middleware/auth.js';

const router = Router();

/**
 * @route POST /api/auth/signup
 * @desc Register a new merchant
 * @access Public
 */
router.post('/signup', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('industry').notEmpty().withMessage('Industry is required'),
  body('subIndustry').notEmpty().withMessage('Sub-industry is required'),
  body('locationLat').isNumeric().withMessage('Location latitude must be a number'),
  body('locationLng').isNumeric().withMessage('Location longitude must be a number'),
  validateRequest
], signup);

/**
 * @route GET /api/auth/google
 * @desc Initiate Google OAuth flow for merchants
 * @access Public
 */
router.get('/google', passport.authenticate('google-merchant', {
  scope: ['profile', 'email']
}));

/**
 * @route GET /api/auth/google/callback
 * @desc Google OAuth callback for merchants
 * @access Public
 */
router.get('/google/callback', 
  passport.authenticate('google-merchant', { 
    session: false,
    failureRedirect: '/login?error=authentication_failed'
  }),
  googleLogin
);

/**
 * @route GET /api/auth/profile
 * @desc Get merchant profile
 * @access Private
 */
router.get('/profile', authenticateJWT, verifyMerchant, getProfile);

/**
 * @route PUT /api/auth/profile
 * @desc Update merchant profile
 * @access Private
 */
router.put('/profile', [
  authenticateJWT,
  verifyMerchant,
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phoneNumber').optional().notEmpty().withMessage('Phone number cannot be empty'),
  body('businessName').optional().notEmpty().withMessage('Business name cannot be empty'),
  body('industry').optional().notEmpty().withMessage('Industry cannot be empty'),
  body('subIndustry').optional().notEmpty().withMessage('Sub-industry cannot be empty'),
  body('locationLat').optional().isNumeric().withMessage('Location latitude must be a number'),
  body('locationLng').optional().isNumeric().withMessage('Location longitude must be a number'),
  validateRequest
], updateProfile);

export default router;