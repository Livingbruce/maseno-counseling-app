import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/db/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateAnnouncementColumns() {
  try {
    console.log('🔄 Adding announcement columns...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add_announcement_columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Announcement columns added successfully!');
    console.log('Added columns: is_force, sent_to_all, counselor_id');
    
  } catch (error) {
    console.error('❌ Error adding announcement columns:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateAnnouncementColumns();
