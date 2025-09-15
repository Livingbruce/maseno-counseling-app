import pool from './backend/src/db/pool.js';
import bcrypt from 'bcrypt';

async function createAdmin() {
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
  } finally {
    await pool.end();
  }
}

createAdmin();
