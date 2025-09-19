import pool from './src/db/pool.js';
import bcrypt from 'bcrypt';

async function createVictorAdmin() {
  try {
    console.log('👤 Creating Victor admin user...');
    
    // Check if admin already exists
    const existingAdmin = await pool.query(
      "SELECT id FROM counselors WHERE email = 'vicymbrush@gmail.com'"
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('✅ Victor admin user already exists!');
      console.log('📧 Email: vicymbrush@gmail.com');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('Victor254', 10);
    
    // Create admin user
    const result = await pool.query(
      `INSERT INTO counselors (name, email, password_hash, is_admin, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, name, email`,
      ['Victor Mburugu', 'vicymbrush@gmail.com', hashedPassword, true]
    );
    
    console.log('✅ Victor admin user created successfully!');
    console.log('📧 Email: vicymbrush@gmail.com');
    console.log('🔑 Password: Victor254');
    console.log('⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Failed to create Victor admin user:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

createVictorAdmin();
