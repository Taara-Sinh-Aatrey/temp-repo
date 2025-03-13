/**
 * Migration to create additional tables for optimization
 */
exports.up = function(knex) {
    return knex.schema
      // Create customer_visits table for revisit analytics
      .createTable('customer_visits', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('customer_id').references('id').inTable('customers').onDelete('CASCADE');
        table.uuid('merchant_id').references('id').inTable('merchants').onDelete('CASCADE');
        table.integer('visit_count').notNullable().defaultTo(1);
        table.timestamp('first_visit').notNullable();
        table.timestamp('last_visit').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        
        // Add unique constraint to prevent duplicate entries
        table.unique(['customer_id', 'merchant_id']);
        
        // Add indexes for performance
        table.index('merchant_id', 'idx_customer_visits_merchant');
        table.index(['merchant_id', 'visit_count'], 'idx_customer_visits_count');
      })
      
      // Create trending_topics table for faster trend analysis
      .createTable('trending_topics', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('merchant_id').references('id').inTable('merchants').onDelete('CASCADE');
        table.string('entity', 255).notNullable();
        table.integer('count').notNullable().defaultTo(0);
        table.boolean('is_positive').notNullable();
        table.date('date_period').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        
        // Add unique constraint to prevent duplicate entries
        table.unique(['merchant_id', 'entity', 'is_positive', 'date_period']);
        
        // Add indexes for performance
        table.index(['merchant_id', 'is_positive', 'date_period'], 'idx_trending_merchant_positive');
        table.index('count', 'idx_trending_count');
      })
      
      // Create sentiment_summary table for faster dashboard rendering
      .createTable('sentiment_summary', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('merchant_id').references('id').inTable('merchants').onDelete('CASCADE');
        table.date('date_period').notNullable();
        table.integer('positive_count').notNullable().defaultTo(0);
        table.integer('negative_count').notNullable().defaultTo(0);
        table.integer('neutral_count').notNullable().defaultTo(0);
        table.float('average_score').notNullable().defaultTo(0);
        table.string('qr_label', 255).nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        
        // Add unique constraint to prevent duplicate entries
        table.unique(['merchant_id', 'date_period', 'qr_label']);
        
        // Add indexes for performance
        table.index(['merchant_id', 'date_period'], 'idx_sentiment_merchant_date');
        table.index(['merchant_id', 'qr_label', 'date_period'], 'idx_sentiment_qr_label');
      })
      
      // Add QR code reference to feedback table
      .alterTable('feedback', (table) => {
        table.uuid('qr_code_id').references('id').inTable('QRCodes').onDelete('SET NULL');
        table.string('feedback_id', 255).nullable().comment('External feedback ID for reference');
        
        // Add index for the new columns
        table.index('qr_code_id', 'idx_feedback_qr_code');
        table.index('feedback_id', 'idx_feedback_feedback_id');
      });
  };
  
  /**
   * Revert the migrations
   */
  exports.down = function(knex) {
    return knex.schema
      // Remove added columns from feedback table
      .alterTable('feedback', (table) => {
        table.dropIndex('qr_code_id', 'idx_feedback_qr_code');
        table.dropIndex('feedback_id', 'idx_feedback_feedback_id');
        table.dropColumn('qr_code_id');
        table.dropColumn('feedback_id');
      })
      
      // Drop the additional tables
      .dropTableIfExists('sentiment_summary')
      .dropTableIfExists('trending_topics')
      .dropTableIfExists('customer_visits');
  };