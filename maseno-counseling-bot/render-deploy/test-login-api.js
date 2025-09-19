import pool from './src/db/pool.js';
import bcrypt from 'bcrypt';

async function testLoginAPI() {
  try {
    console.log('🧪 TESTING LOGIN API...\n');
    
    const testAccounts = [
      { email: 'admin@maseno.ac.ke', password: '123456' },
      { email: 'vicymbrush@gmail.com', password: '123456' }
    ];
    
    for (const account of testAccounts) {
      console.log(`🔍 Testing login for: ${account.email}`);
      console.log('=' .repeat(50));
      
      // Get user from database
      const userResult = await pool.query(
        'SELECT id, name, email, password_hash, is_admin FROM counselors WHERE email = $1',
        [account.email]
      );
      
      if (userResult.rows.length === 0) {
        console.log('❌ User not found');
        continue;
      }
      
      const user = userResult.rows[0];
      console.log(`👤 User found: ${user.name}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`👑 Admin: ${user.is_admin}`);
      
      // Test password
      const passwordMatch = await bcrypt.compare(account.password, user.password_hash);
      console.log(`🔑 Password match: ${passwordMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      if (passwordMatch) {
        console.log('✅ LOGIN WOULD SUCCEED');
        console.log('📊 User data that would be returned:');
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Name: ${user.name}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Is Admin: ${user.is_admin}`);
      } else {
        console.log('❌ LOGIN WOULD FAIL');
      }
      
      console.log('');
    }
    
    console.log('🎯 LOGIN TEST COMPLETED!');
    console.log('\n💡 If the API test passes but you still can\'t login, the issue is in the frontend.');
    console.log('🔧 Try these steps:');
    console.log('1. Clear browser cache and cookies');
    console.log('2. Try incognito/private mode');
    console.log('3. Check browser console for errors');
    console.log('4. Try a different browser');
    
  } catch (error) {
    console.error('❌ Error testing login API:', error.message);
  } finally {
    await pool.end();
  }
}

testLoginAPI();
