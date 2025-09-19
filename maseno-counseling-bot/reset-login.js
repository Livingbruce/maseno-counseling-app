import pool from './src/db/pool.js';
import bcrypt from 'bcrypt';

async function resetLogin() {
  try {
    console.log('🔍 Checking admin account...');
    
    // Check if admin exists
    const result = await pool.query(
      "SELECT id, email, password_hash, is_admin FROM counselors WHERE email = $1",
      ['vicymbrush@gmail.com']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Admin account not found!');
      return;
    }
    
    const admin = result.rows[0];
    console.log('✅ Admin account found:');
    console.log('📧 Email:', admin.email);
    console.log('👑 Is Admin:', admin.is_admin);
    
    // Test password
    const testPassword = 'Victor254';
    const match = await bcrypt.compare(testPassword, admin.password_hash);
    console.log('🔑 Password test:', match ? '✅ CORRECT' : '❌ INCORRECT');
    
    if (!match) {
      console.log('🔄 Updating password...');
      const newHashedPassword = await bcrypt.hash(testPassword, 10);
      await pool.query(
        'UPDATE counselors SET password_hash = $1 WHERE email = $2',
        [newHashedPassword, 'vicymbrush@gmail.com']
      );
      console.log('✅ Password updated successfully!');
    }
    
    console.log('\n🎯 Login Details:');
    console.log('📧 Email: vicymbrush@gmail.com');
    console.log('🔑 Password: Victor254');
    console.log('⚠️  If still getting "invalid credentials", wait 15 minutes for rate limit to reset');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

resetLogin();
