import knex from 'knex';
import { info, error as _error } from '../utils/logger';
import knexConfig from '../knexfile';

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Initialize knex with configuration from knexfile.js
const db = knex(knexConfig[environment]);

// Test database connection
const testConnection = async () => {
  try {
    await db.raw('SELECT 1');
    info(`Connected to ${environment} database`);
    return true;
  } catch (error) {
    _error('Database connection error:', error);
    return false;
  }
};

export default {
  db,
  testConnection
};