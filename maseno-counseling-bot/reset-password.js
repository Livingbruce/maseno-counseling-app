import pool from './src/db/pool.js';
import bcrypt from 'bcrypt';

async function resetPassword() {
  try {
    console.log('🔄 Resetting admin password...');
    
    const email = 'vicymbrush@gmail.com';
    const newPassword = 'Victor254';
    
    console.log('📧 Email:', email);
    console.log('🔑 New Password:', newPassword);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password for the existing account
    const result = await pool.query(
      `UPDATE counselors 
       SET password_hash = $1, updated_at = NOW()
       WHERE email = $2
       RETURNING id, name, email, is_admin`,
      [hashedPassword, email]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ No account found with email:', email);
      return;
    }
    
    const admin = result.rows[0];
    console.log('✅ Password reset successfully!');
    console.log('👤 Name:', admin.name);
    console.log('📧 Email:', admin.email);
    console.log('👑 Is Admin:', admin.is_admin);
    
    console.log('\n🎯 Login Details:');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', newPassword);
    console.log('🌐 Login URL: https://maseno-counseling-bot.vercel.app/');
    
    // Test the password
    const testMatch = await bcrypt.compare(newPassword, hashedPassword);
    console.log('🔍 Password verification:', testMatch ? '✅ SUCCESS' : '❌ FAILED');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
  } finally {
    await pool.end();
  }
}

resetPassword();
