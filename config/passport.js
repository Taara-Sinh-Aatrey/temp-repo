import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Merchant from '../models/Merchant.js';
import Customer from '../models/Customer.js';
import logger from '../utils/logger.js';

// Configure Google OAuth strategy for merchants
passport.use('google-merchant',
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.GOOGLE_CALLBACK_URL}/merchant`,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Extract relevant information from Google profile
      const email = profile.emails[0].value;
      
      // Check if merchant exists
      let merchant = await Merchant.getByEmail(email);
      
      if (!merchant) {
        // If the merchant doesn't exist, return error
        // We don't auto-create merchants as they need to go through signup process
        logger.info(`Google OAuth: Merchant with email ${email} not found`);
        return done(null, false, { message: 'Merchant not registered. Please sign up first.' });
      }
      
      // Return the merchant profile
      return done(null, merchant);
    } catch (error) {
      logger.error('Google OAuth (Merchant) error:', error);
      return done(error);
    }
  })
);

// Configure Google OAuth strategy for customers
passport.use('google-customer',
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.GOOGLE_CALLBACK_URL}/customer`,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Extract relevant information from Google profile
      const googleOAuthId = profile.id;
      const email = profile.emails[0].value;
      const firstName = profile.name.givenName;
      const lastName = profile.name.familyName;
      const profilePic = profile.photos[0]?.value;
      
      // Create or update customer
      const customerData = {
        googleOAuthId,
        email,
        firstName,
        lastName,
        profilePic,
        primaryLanguage: req.query.language || 'en' // Default to English
      };
      
      const customer = await Customer.createOrUpdate(customerData);
      
      // Return the customer profile
      return done(null, customer);
    } catch (error) {
      logger.error('Google OAuth (Customer) error:', error);
      return done(error);
    }
  })
);

export default passport;