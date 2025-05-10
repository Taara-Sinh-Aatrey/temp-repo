import knex from 'knex';
import logger from '../utils/logger.js';
import knexConfig from '../knexfile.js';

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Initialize knex instance with configuration from knexfile.js
const db = knex(knexConfig[environment]);

// Test database connection
db.raw('SELECT 1')
  .then(() => {
    logger.info('Database connection established successfully');
  })
  .catch(err => {
    logger.error('Database connection failed:', err);
    process.exit(1);
  });

export default db;