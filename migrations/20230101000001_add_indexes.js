/**
 * Migration to add indexes for optimizing query performance
 */
exports.up = function(knex) {
    return knex.schema
      // Add indexes to merchants table
      .alterTable('merchants', (table) => {
        table.index('email', 'idx_merchants_email');
        table.index('status', 'idx_merchants_status');
        table.index('industry', 'idx_merchants_industry');
      })
      
      // Add indexes to feedback table
      .alterTable('feedback', (table) => {
        table.index('merchant_id', 'idx_feedback_merchant_id');
        table.index('customer_id', 'idx_feedback_customer_id');
        table.index('score', 'idx_feedback_score');
        table.index('created_at', 'idx_feedback_created_at');
        
        // Create composite index for merchant_id and created_at
        table.index(['merchant_id', 'created_at'], 'idx_feedback_merchant_created');
        
        // We would ideally add a GIN index for the entities array, but
        // this depends on the database supporting GIN indexes
        // For PostgreSQL, you would execute raw SQL:
        // CREATE INDEX idx_feedback_entities ON feedback USING GIN(entities);
      })
      
      // Add indexes to QRCodes table
      .alterTable('QRCodes', (table) => {
        table.index('merchantId', 'idx_qrcodes_merchantid');
        table.index('labelName', 'idx_qrcodes_labelname');
        
        // Create a partial index for non-deleted QR codes
        // This would typically be done using raw SQL for PostgreSQL:
        // CREATE INDEX idx_qrcodes_deleted ON "QRCodes"(deletedAt) WHERE deletedAt IS NULL;
      });
  };
  
  /**
   * Revert the migrations
   */
  exports.down = function(knex) {
    return knex.schema
      // Remove indexes from QRCodes table
      .alterTable('QRCodes', (table) => {
        table.dropIndex('merchantId', 'idx_qrcodes_merchantid');
        table.dropIndex('labelName', 'idx_qrcodes_labelname');
        
        // Drop the partial index - would typically be done using raw SQL:
        // DROP INDEX IF EXISTS idx_qrcodes_deleted;
      })
      
      // Remove indexes from feedback table
      .alterTable('feedback', (table) => {
        table.dropIndex('merchant_id', 'idx_feedback_merchant_id');
        table.dropIndex('customer_id', 'idx_feedback_customer_id');
        table.dropIndex('score', 'idx_feedback_score');
        table.dropIndex('created_at', 'idx_feedback_created_at');
        table.dropIndex(['merchant_id', 'created_at'], 'idx_feedback_merchant_created');
        
        // Drop the GIN index - would typically be done using raw SQL:
        // DROP INDEX IF EXISTS idx_feedback_entities;
      })
      
      // Remove indexes from merchants table
      .alterTable('merchants', (table) => {
        table.dropIndex('email', 'idx_merchants_email');
        table.dropIndex('status', 'idx_merchants_status');
        table.dropIndex('industry', 'idx_merchants_industry');
      });
  };