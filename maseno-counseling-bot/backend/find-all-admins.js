import pool from './src/db/pool.js';

async function findAllAdmins() {
  try {
    console.log('🔍 Searching for ALL admin accounts...\n');
    
    // Check counselors table for all admins
    console.log('👥 ALL COUNSELORS (including admins):');
    console.log('=' .repeat(60));
    const counselorsResult = await pool.query(`
      SELECT id, name, email, is_admin, created_at, updated_at 
      FROM counselors 
      ORDER BY created_at ASC
    `);
    
    if (counselorsResult.rows.length === 0) {
      console.log('❌ No counselor accounts found');
    } else {
      console.log(`📊 Total counselors: ${counselorsResult.rows.length}`);
      counselorsResult.rows.forEach((counselor, index) => {
        console.log(`${index + 1}. 👤 ${counselor.name}`);
        console.log(`   📧 Email: ${counselor.email}`);
        console.log(`   👑 Admin: ${counselor.is_admin ? '✅ YES' : '❌ NO'}`);
        console.log(`   🆔 ID: ${counselor.id}`);
        console.log(`   📅 Created: ${new Date(counselor.created_at).toLocaleString()}`);
        console.log(`   🔄 Updated: ${counselor.updated_at ? new Date(counselor.updated_at).toLocaleString() : 'Never'}`);
        console.log('');
      });
    }
    
    // Check if there are any deleted or soft-deleted accounts
    console.log('🗑️  CHECKING FOR DELETED ACCOUNTS:');
    console.log('=' .repeat(60));
    
    // Check if there's a deleted_at column or similar
    const tableStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'counselors' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Counselors table structure:');
    tableStructure.rows.forEach((column, index) => {
      console.log(`${index + 1}. ${column.column_name} (${column.data_type})`);
    });
    
    // Check for any accounts that might be in other tables
    console.log('\n🔍 CHECKING OTHER TABLES FOR ADMIN ACCOUNTS:');
    console.log('=' .repeat(60));
    
    // Check if there are any admin accounts in other tables
    const allTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%admin%' OR table_name LIKE '%user%' OR table_name LIKE '%counselor%'
      ORDER BY table_name
    `);
    
    console.log('📋 Tables that might contain admin accounts:');
    allTables.rows.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });
    
    // Check if there are any accounts with different email patterns
    console.log('\n📧 CHECKING FOR ACCOUNTS WITH DIFFERENT EMAIL PATTERNS:');
    console.log('=' .repeat(60));
    
    const emailPatterns = await pool.query(`
      SELECT email, COUNT(*) as count
      FROM counselors 
      GROUP BY email
      ORDER BY count DESC
    `);
    
    console.log('📊 Email patterns found:');
    emailPatterns.rows.forEach((pattern, index) => {
      console.log(`${index + 1}. ${pattern.email} (${pattern.count} account(s))`);
    });
    
    // Check for any accounts that might have been created with different names
    console.log('\n👤 CHECKING FOR ACCOUNTS WITH DIFFERENT NAMES:');
    console.log('=' .repeat(60));
    
    const namePatterns = await pool.query(`
      SELECT name, COUNT(*) as count
      FROM counselors 
      GROUP BY name
      ORDER BY count DESC
    `);
    
    console.log('📊 Name patterns found:');
    namePatterns.rows.forEach((pattern, index) => {
      console.log(`${index + 1}. ${pattern.name} (${pattern.count} account(s))`);
    });
    
    console.log('\n✅ Admin account search completed!');
    
  } catch (error) {
    console.error('❌ Error searching for admin accounts:', error.message);
  } finally {
    await pool.end();
  }
}

findAllAdmins();
