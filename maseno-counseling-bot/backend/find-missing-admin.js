import pool from './src/db/pool.js';

async function findMissingAdmin() {
  try {
    console.log('🔍 Searching for the missing 3rd admin account...\n');
    
    // Check user_sessions table for any admin sessions
    console.log('🔐 CHECKING USER SESSIONS:');
    console.log('=' .repeat(60));
    try {
      const sessionsResult = await pool.query(`
        SELECT * FROM user_sessions 
        ORDER BY created_at DESC 
        LIMIT 10
      `);
      
      if (sessionsResult.rows.length === 0) {
        console.log('❌ No user sessions found');
      } else {
        console.log(`📊 Found ${sessionsResult.rows.length} user sessions:`);
        sessionsResult.rows.forEach((session, index) => {
          console.log(`${index + 1}. Session ID: ${session.id}`);
          console.log(`   👤 User ID: ${session.user_id}`);
          console.log(`   📅 Created: ${new Date(session.created_at).toLocaleString()}`);
          console.log(`   📊 Data:`, JSON.stringify(session, null, 2));
          console.log('');
        });
      }
    } catch (error) {
      console.log('❌ Error checking user_sessions:', error.message);
    }
    
    // Check if there are any accounts with different admin status
    console.log('\n👑 CHECKING ALL ACCOUNTS WITH ADMIN STATUS:');
    console.log('=' .repeat(60));
    
    const allAdmins = await pool.query(`
      SELECT id, name, email, is_admin, created_at
      FROM counselors 
      WHERE is_admin = true
      ORDER BY created_at ASC
    `);
    
    console.log(`📊 Found ${allAdmins.rows.length} admin accounts:`);
    allAdmins.rows.forEach((admin, index) => {
      console.log(`${index + 1}. 👤 ${admin.name}`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   🆔 ID: ${admin.id}`);
      console.log(`   📅 Created: ${new Date(admin.created_at).toLocaleString()}`);
      console.log('');
    });
    
    // Check if there are any accounts that might have been created and then deleted
    console.log('\n🗑️  CHECKING FOR DELETED ACCOUNTS:');
    console.log('=' .repeat(60));
    
    // Check if there's a way to see deleted accounts (like a deleted_at column)
    const deletedCheck = await pool.query(`
      SELECT COUNT(*) as total
      FROM counselors 
      WHERE is_admin = true
    `);
    
    console.log(`📊 Current admin count: ${deletedCheck.rows[0].total}`);
    
    // Check if there are any accounts with different names that might be admins
    console.log('\n🔍 CHECKING FOR ACCOUNTS WITH SIMILAR NAMES:');
    console.log('=' .repeat(60));
    
    const similarNames = await pool.query(`
      SELECT id, name, email, is_admin
      FROM counselors 
      WHERE name ILIKE '%victor%' OR name ILIKE '%admin%' OR name ILIKE '%user%'
      ORDER BY created_at ASC
    `);
    
    console.log(`📊 Found ${similarNames.rows.length} accounts with similar names:`);
    similarNames.rows.forEach((account, index) => {
      console.log(`${index + 1}. 👤 ${account.name}`);
      console.log(`   📧 Email: ${account.email}`);
      console.log(`   👑 Admin: ${account.is_admin ? '✅ YES' : '❌ NO'}`);
      console.log(`   🆔 ID: ${account.id}`);
      console.log('');
    });
    
    // Check if there might be a third account with a different email pattern
    console.log('\n📧 CHECKING FOR ACCOUNTS WITH DIFFERENT EMAIL PATTERNS:');
    console.log('=' .repeat(60));
    
    const emailCheck = await pool.query(`
      SELECT id, name, email, is_admin
      FROM counselors 
      WHERE email LIKE '%@%'
      ORDER BY created_at ASC
    `);
    
    console.log(`📊 Found ${emailCheck.rows.length} accounts with email addresses:`);
    emailCheck.rows.forEach((account, index) => {
      console.log(`${index + 1}. 👤 ${account.name}`);
      console.log(`   📧 Email: ${account.email}`);
      console.log(`   👑 Admin: ${account.is_admin ? '✅ YES' : '❌ NO'}`);
      console.log(`   🆔 ID: ${account.id}`);
      console.log('');
    });
    
    // Check if there might be a third account that was created but not saved properly
    console.log('\n🔍 CHECKING FOR ACCOUNTS WITH MISSING DATA:');
    console.log('=' .repeat(60));
    
    const missingData = await pool.query(`
      SELECT id, name, email, is_admin, created_at
      FROM counselors 
      WHERE name IS NULL OR email IS NULL OR is_admin IS NULL
      ORDER BY created_at ASC
    `);
    
    if (missingData.rows.length === 0) {
      console.log('✅ No accounts with missing data found');
    } else {
      console.log(`📊 Found ${missingData.rows.length} accounts with missing data:`);
      missingData.rows.forEach((account, index) => {
        console.log(`${index + 1}. 👤 ${account.name || 'NULL'}`);
        console.log(`   📧 Email: ${account.email || 'NULL'}`);
        console.log(`   👑 Admin: ${account.is_admin === null ? 'NULL' : (account.is_admin ? '✅ YES' : '❌ NO')}`);
        console.log(`   🆔 ID: ${account.id}`);
        console.log('');
      });
    }
    
    console.log('\n✅ Missing admin search completed!');
    console.log('\n💡 If you remember the 3rd admin account details, I can help you recreate it.');
    
  } catch (error) {
    console.error('❌ Error searching for missing admin:', error.message);
  } finally {
    await pool.end();
  }
}

findMissingAdmin();
