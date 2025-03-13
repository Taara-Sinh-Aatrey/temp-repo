/**
 * Initial migration to create the base tables
 */
exports.up = function(knex) {
    return knex.schema
      // Create customers table
      .createTable('customers', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('first_name', 255).notNullable();
        table.string('last_name', 255);
        table.string('email', 255).notNullable().unique();
        table.string('google_oauth_id', 255).notNullable().unique();
        table.text('profile_pic');
        table.string('gender', 50);
        table.string('primary_language', 50);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      })
      
      // Create merchants table
      .createTable('merchants', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('first_name', 255).notNullable();
        table.string('last_name', 255).notNullable();
        table.string('email', 255).notNullable().unique();
        table.string('phone_number', 20).notNullable().unique();
        table.string('business_name', 255).notNullable();
        table.string('brand_name', 255);
        table.text('brand_logo');
        table.string('industry', 100).notNullable();
        table.string('sub_industry', 100).notNullable();
        table.decimal('location_lat', 10, 8).notNullable();
        table.decimal('location_lng', 11, 8).notNullable();
        table.string('google_place_id', 255).unique();
        table.enum('status', ['active', 'inactive']).defaultTo('active');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      })
      
      // Create merchant_spocs table
      .createTable('merchant_spocs', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('merchant_id').references('id').inTable('merchants').onDelete('CASCADE');
        table.string('name', 255).notNullable();
        table.string('email', 255).notNullable().unique();
        table.string('phone_number', 20).notNullable().unique();
        table.timestamp('created_at').defaultTo(knex.fn.now());
      })
      
      // Create feedback table
      .createTable('feedback', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('customer_id').references('id').inTable('customers').onDelete('CASCADE');
        table.uuid('merchant_id').references('id').inTable('merchants').onDelete('CASCADE');
        table.string('language', 50);
        table.string('place', 255);
        table.text('raw_text');
        table.text('translated_text');
        table.specificType('entities', 'TEXT[]');
        table.float('magnitude');
        table.float('score');
        table.string('category', 255);
        table.float('discount_percentage').checkPositive();
        table.boolean('is_discount_claimed').defaultTo(false);
        table.timestamp('discount_claimed_date');
        table.timestamp('discount_expiry_date');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.specificType('images', 'TEXT[]');
      })
      
      // Create QRCodes table
      .createTable('QRCodes', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('merchantId').references('id').inTable('merchants').onUpdate('CASCADE').onDelete('SET NULL');
        table.string('labelName', 255).notNullable();
        table.text('qrCode').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt');
      });
  };
  
  /**
   * Revert the migrations
   */
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists('QRCodes')
      .dropTableIfExists('feedback')
      .dropTableIfExists('merchant_spocs')
      .dropTableIfExists('merchants')
      .dropTableIfExists('customers');
  };