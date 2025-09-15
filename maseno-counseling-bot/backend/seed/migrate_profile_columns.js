import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/db/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateProfileColumns() {
  try {
    console.log('🔄 Adding profile columns to counselors table...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add_profile_columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Profile columns added successfully!');
    console.log('Added columns: phone, specialization, bio, office_location, office_hours, updated_at');
    
  } catch (error) {
    console.error('❌ Error adding profile columns:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateProfileColumns();
