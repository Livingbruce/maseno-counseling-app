import pool from './src/db/pool.js';
import bcrypt from 'bcrypt';

async function updateAdminCredentials() {
  try {
    console.log('🔄 Updating admin credentials...');
    
    // Get new credentials from user
    const newEmail = 'vicymbrush@gmail.com'; // Update this with your new email
    const newPassword = 'Victor254'; // Update this with your new password
    
    console.log('📧 New Email:', newEmail);
    console.log('🔑 New Password:', newPassword);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the admin account
    const result = await pool.query(
      `UPDATE counselors 
       SET email = $1, password_hash = $2, updated_at = NOW()
       WHERE is_admin = true
       RETURNING id, name, email, is_admin`,
      [newEmail, hashedPassword]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ No admin account found to update!');
      return;
    }
    
    const admin = result.rows[0];
    console.log('✅ Admin credentials updated successfully!');
    console.log('👤 Name:', admin.name);
    console.log('📧 Email:', admin.email);
    console.log('👑 Is Admin:', admin.is_admin);
    
    console.log('\n🎯 Updated Login Details:');
    console.log('📧 Email:', newEmail);
    console.log('🔑 Password:', newPassword);
    console.log('🌐 Login URL: https://maseno-counseling-bot.vercel.app/');
    
  } catch (error) {
    console.error('❌ Error updating credentials:', error.message);
  } finally {
    await pool.end();
  }
}

updateAdminCredentials();
