import knex from 'knex';
import logger from '../utils/logger.js';
import knexConfig from '../knexfile.js';

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

export default {
  db,
  testConnection
};