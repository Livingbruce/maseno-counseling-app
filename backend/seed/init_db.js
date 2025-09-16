import pool from '../src/db/pool.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  try {
    console.log('🚀 Initializing database...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('✅ Database schema created successfully');
    
    // Create admin user
    await createAdminUser();
    
    console.log('🎉 Database initialization completed!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function createAdminUser() {
  try {
    console.log('👤 Creating admin user...');
    
    // Check if admin already exists
    const existingAdmin = await pool.query(
      "SELECT id FROM counselors WHERE email = 'admin@maseno.ac.ke'"
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists!');
      return;
    }
    
    // Hash password
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const result = await pool.query(
      `INSERT INTO counselors (name, email, password_hash, is_admin, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, name, email`,
      ['Admin User', 'admin@maseno.ac.ke', hashedPassword, true]
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@maseno.ac.ke');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    throw error;
  }
}

// Run initialization
initDatabase();
