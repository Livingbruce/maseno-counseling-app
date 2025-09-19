import pool from './src/db/pool.js';
import bcrypt from 'bcrypt';

async function createFreshAdmin() {
  try {
    console.log('🔄 Creating fresh admin account...');
    
    const email = 'vicymbrush@gmail.com';
    const password = 'Victor254';
    const name = 'Victor Mburugu';
    
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Name:', name);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Delete existing admin if exists
    await pool.query('DELETE FROM counselors WHERE email = $1', [email]);
    console.log('🗑️  Removed existing admin account');
    
    // Create fresh admin account
    const result = await pool.query(
      `INSERT INTO counselors (name, email, password_hash, is_admin, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, name, email, is_admin`,
      [name, email, hashedPassword, true]
    );
    
    const admin = result.rows[0];
    console.log('✅ Fresh admin account created successfully!');
    console.log('👤 Name:', admin.name);
    console.log('📧 Email:', admin.email);
    console.log('👑 Is Admin:', admin.is_admin);
    
    // Test the password
    const testMatch = await bcrypt.compare(password, hashedPassword);
    console.log('🔍 Password verification:', testMatch ? '✅ SUCCESS' : '❌ FAILED');
    
    console.log('\n🎯 Your Login Credentials:');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🌐 Login URL: https://maseno-counseling-bot.vercel.app/');
    console.log('\n💡 Try logging in now!');
    
  } catch (error) {
    console.error('❌ Error creating fresh admin:', error.message);
  } finally {
    await pool.end();
  }
}

createFreshAdmin();
