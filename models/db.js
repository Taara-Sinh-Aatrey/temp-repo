import knex from 'knex';
import { info, error } from '../utils/logger';
import knexConfig from '../knexfile';

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Initialize knex instance with configuration from knexfile.js
const db = knex(knexConfig[environment]);

// Test database connection
db.raw('SELECT 1')
  .then(() => {
    info('Database connection established successfully');
  })
  .catch(err => {
    error('Database connection failed:', err);
    process.exit(1);
  });

export default db;