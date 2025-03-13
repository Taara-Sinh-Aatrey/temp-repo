const knex = require('knex');
const logger = require('../utils/logger');
const knexConfig = require('../knexfile');

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Initialize knex with configuration from knexfile.js
const db = knex(knexConfig[environment]);

// Test database connection
const testConnection = async () => {
  try {
    await db.raw('SELECT 1');
    logger.info(`Connected to ${environment} database`);
    return true;
  } catch (error) {
    logger.error('Database connection error:', error);
    return false;
  }
};

module.exports = {
  db,
  testConnection
};