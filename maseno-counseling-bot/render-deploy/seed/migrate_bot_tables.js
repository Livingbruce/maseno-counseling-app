import pool from '../src/db/pool.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateBotTables() {
  try {
    console.log('🔄 Starting bot tables migration...');
    
    // Read the schema additions
    const schemaPath = path.join(__dirname, 'schema_additions.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema additions
    await pool.query(schemaSQL);
    
    console.log('✅ Bot tables migration completed successfully!');
    
    // Test the tables
    const tables = [
      'user_sessions',
      'support_tickets', 
      'support_messages',
      'support_categories',
      'notifications'
    ];
    
    for (const table of tables) {
      const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`✅ Table ${table}: ${result.rows[0].count} records`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrateBotTables().catch(console.error);
