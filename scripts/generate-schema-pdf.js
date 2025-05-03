#!/usr/bin/env node

/**
 * Script to generate PDF documentation of the database schema
 * Requires: npm install knex-schema-inspector pdfkit fs-extra
 */
require('dotenv').config();
import { createWriteStream } from 'fs-extra';
import { join } from 'path';
import { SchemaInspector } from 'knex-schema-inspector';
import PDFDocument from 'pdfkit';
import { error as _error, info } from '../utils/logger';
import knex from 'knex';
import config from '../knexfile';

// Get environment from command line args or default to development
const environment = process.argv[2] || process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

if (!config) {
  _error(`Environment "${environment}" not found in knexfile.js`);
  process.exit(1);
}

// Initialize knex instance
const db = knex(config);
const inspector = SchemaInspector(db);

async function generateSchemaPDF() {
  try {
    info(`Generating schema documentation for environment: ${environment}`);
    
    // Get all tables
    const tables = await inspector.tables();
    
    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });
    const output = createWriteStream(join(__dirname, '../schema-documentation.pdf'));
    doc.pipe(output);
    
    // Add title
    doc.fontSize(25).text('Database Schema Documentation', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);
    
    // Process each table
    for (const tableName of tables) {
      // Get table columns
      const columns = await inspector.columnInfo(tableName);
      
      // Get table indices
      const indices = await inspector.indices(tableName);
      
      // Add table name
      doc.fontSize(16).text(`Table: ${tableName}`, { underline: true });
      doc.moveDown();
      
      // Add column information
      doc.fontSize(12).text('Columns:');
      doc.moveDown(0.5);
      
      // Create column table headers
      const columnHeaders = ['Name', 'Type', 'Default', 'Nullable', 'Primary'];
      const columnWidths = [150, 100, 100, 70, 70];
      let y = doc.y;
      
      // Draw column table headers
      doc.fontSize(10);
      columnHeaders.forEach((header, i) => {
        let x = 50 + columnWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
        doc.text(header, x, y, { width: columnWidths[i], align: 'left' });
      });
      
      y += 20;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;
      
      // Draw column rows
      for (const column of Object.values(columns)) {
        // Check if we need a new page
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        
        const rowData = [
          column.name,
          column.data_type,
          column.defaultValue || '',
          column.is_nullable ? 'Yes' : 'No',
          column.is_primary ? 'Yes' : 'No'
        ];
        
        rowData.forEach((data, i) => {
          let x = 50 + columnWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
          doc.text(data, x, y, { width: columnWidths[i], align: 'left' });
        });
        
        y += 20;
      }
      
      doc.moveDown();
      
      // Add index information if available
      if (indices.length > 0) {
        // Check if we need a new page
        if (y > 650) {
          doc.addPage();
          y = 50;
        } else {
          y = doc.y;
        }
        
        doc.fontSize(12).text('Indices:', 50, y);
        doc.moveDown(0.5);
        y = doc.y;
        
        // Create index table headers
        const indexHeaders = ['Name', 'Columns', 'Unique'];
        const indexWidths = [150, 250, 70];
        
        // Draw index table headers
        doc.fontSize(10);
        indexHeaders.forEach((header, i) => {
          let x = 50 + indexWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
          doc.text(header, x, y, { width: indexWidths[i], align: 'left' });
        });
        
        y += 20;
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 10;
        
        // Draw index rows
        for (const index of indices) {
          // Check if we need a new page
          if (y > 700) {
            doc.addPage();
            y = 50;
          }
          
          const rowData = [
            index.name,
            Array.isArray(index.columns) ? index.columns.join(', ') : index.columns,
            index.unique ? 'Yes' : 'No'
          ];
          
          rowData.forEach((data, i) => {
            let x = 50 + indexWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
            doc.text(data, x, y, { width: indexWidths[i], align: 'left' });
          });
          
          y += 20;
        }
      }
      
      // Add page break between tables
      doc.addPage();
    }
    
    // Finalize the PDF
    doc.end();
    
    info(`Schema documentation generated: ${join(__dirname, '../schema-documentation.pdf')}`);
    
    // Close the database connection
    await db.destroy();
  } catch (error) {
    _error('Error generating schema documentation:', error);
    process.exit(1);
  }
}

// Generate the schema PDF
generateSchemaPDF();