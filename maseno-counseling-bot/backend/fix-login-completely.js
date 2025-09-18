import pool from './src/db/pool.js';
import bcrypt from 'bcrypt';

async function fixLoginCompletely() {
  try {
    console.log('🔧 FIXING LOGIN ISSUE COMPLETELY...\n');
    
    // First, let's see what accounts exist
    console.log('1️⃣ CHECKING EXISTING ACCOUNTS:');
    console.log('=' .repeat(50));
    const existingAccounts = await pool.query('SELECT id, name, email, is_admin FROM counselors ORDER BY id');
    
    existingAccounts.rows.forEach((account, index) => {
      console.log(`${index + 1}. ID: ${account.id} | ${account.name} | ${account.email} | Admin: ${account.is_admin}`);
    });
    
    // Reset both accounts with simple passwords
    console.log('\n2️⃣ RESETTING BOTH ACCOUNTS:');
    console.log('=' .repeat(50));
    
    const simplePassword = '123456'; // Simple password for testing
    const hashedPassword = await bcrypt.hash(simplePassword, 10);
    
    // Reset Admin User account
    console.log('🔄 Resetting Admin User account...');
    await pool.query(
      'UPDATE counselors SET password_hash = $1, updated_at = NOW() WHERE email = $2',
      [hashedPassword, 'admin@maseno.ac.ke']
    );
    console.log('✅ Admin User password reset');
    
    // Reset Victor Mburugu account
    console.log('🔄 Resetting Victor Mburugu account...');
    await pool.query(
      'UPDATE counselors SET password_hash = $1, updated_at = NOW() WHERE email = $2',
      [hashedPassword, 'vicymbrush@gmail.com']
    );
    console.log('✅ Victor Mburugu password reset');
    
    // Verify the passwords work
    console.log('\n3️⃣ VERIFYING PASSWORDS:');
    console.log('=' .repeat(50));
    
    const testPassword = '123456';
    
    // Test Admin User
    const adminUser = await pool.query('SELECT password_hash FROM counselors WHERE email = $1', ['admin@maseno.ac.ke']);
    if (adminUser.rows.length > 0) {
      const adminMatch = await bcrypt.compare(testPassword, adminUser.rows[0].password_hash);
      console.log(`Admin User (admin@maseno.ac.ke): ${adminMatch ? '✅ WORKS' : '❌ FAILED'}`);
    }
    
    // Test Victor Mburugu
    const victorUser = await pool.query('SELECT password_hash FROM counselors WHERE email = $1', ['vicymbrush@gmail.com']);
    if (victorUser.rows.length > 0) {
      const victorMatch = await bcrypt.compare(testPassword, victorUser.rows[0].password_hash);
      console.log(`Victor Mburugu (vicymbrush@gmail.com): ${victorMatch ? '✅ WORKS' : '❌ FAILED'}`);
    }
    
    console.log('\n4️⃣ YOUR LOGIN CREDENTIALS:');
    console.log('=' .repeat(50));
    console.log('🌐 Login URL: https://maseno-counseling-bot.vercel.app/');
    console.log('');
    console.log('ACCOUNT 1:');
    console.log('📧 Email: admin@maseno.ac.ke');
    console.log('🔑 Password: 123456');
    console.log('');
    console.log('ACCOUNT 2:');
    console.log('📧 Email: vicymbrush@gmail.com');
    console.log('🔑 Password: 123456');
    console.log('');
    console.log('💡 Try logging in with either account now!');
    console.log('🔧 If it still doesn\'t work, there might be a frontend issue.');
    
  } catch (error) {
    console.error('❌ Error fixing login:', error.message);
  } finally {
    await pool.end();
  }
}

fixLoginCompletely();
