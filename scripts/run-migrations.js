#!/usr/bin/env node

/**
 * Script to run database migrations
 */
require('dotenv').config();
import { error as _error, info } from '../utils/logger';
import knex from 'knex';
import knexConfig from '../knexfile';

// Get environment from command line args or default to development
const environment = process.argv[2] || process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

if (!config) {
  _error(`Environment "${environment}" not found in knexfile.js`);
  process.exit(1);
}

// Initialize knex instance
const db = knex(config);

async function runMigrations() {
  try {
    info(`Running migrations for environment: ${environment}`);
    
    // Run migrations
    const [batchNo, log] = await db.migrate.latest();
    
    if (log.length === 0) {
      info('Already up to date');
    } else {
      info(`Batch ${batchNo} run: ${log.length} migrations`);
      info(`Migrations completed: ${log.join(', ')}`);
    }
    
    // Exit the process
    process.exit(0);
  } catch (error) {
    _error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run the migrations
runMigrations();