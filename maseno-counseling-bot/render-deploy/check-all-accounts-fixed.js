import pool from './src/db/pool.js';

async function checkAllAccounts() {
  try {
    console.log('🔍 Checking all accounts in the database...\n');
    
    // Check counselors table
    console.log('👥 COUNSELORS ACCOUNTS:');
    console.log('=' .repeat(50));
    const counselorsResult = await pool.query('SELECT id, name, email, is_admin, created_at FROM counselors ORDER BY created_at DESC');
    
    if (counselorsResult.rows.length === 0) {
      console.log('❌ No counselor accounts found');
    } else {
      counselorsResult.rows.forEach((counselor, index) => {
        console.log(`${index + 1}. 👤 ${counselor.name}`);
        console.log(`   📧 Email: ${counselor.email}`);
        console.log(`   👑 Admin: ${counselor.is_admin ? 'Yes' : 'No'}`);
        console.log(`   📅 Created: ${new Date(counselor.created_at).toLocaleString()}`);
        console.log('');
      });
    }
    
    // Check students table (with correct column names)
    console.log('🎓 STUDENTS ACCOUNTS:');
    console.log('=' .repeat(50));
    try {
      const studentsResult = await pool.query('SELECT id, name, telegram_username, created_at FROM students ORDER BY created_at DESC LIMIT 10');
      
      if (studentsResult.rows.length === 0) {
        console.log('❌ No student accounts found');
      } else {
        console.log(`📊 Total students: ${studentsResult.rows.length} (showing first 10)`);
        studentsResult.rows.forEach((student, index) => {
          console.log(`${index + 1}. 👤 ${student.name || 'Unknown'}`);
          console.log(`   🆔 Telegram: @${student.telegram_username || 'N/A'}`);
          console.log(`   📅 Created: ${new Date(student.created_at).toLocaleString()}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('❌ Error checking students:', error.message);
      console.log('💡 This might mean the students table has a different structure');
    }
    
    // Check appointments
    console.log('📅 APPOINTMENTS:');
    console.log('=' .repeat(50));
    try {
      const appointmentsResult = await pool.query('SELECT COUNT(*) as total FROM appointments');
      console.log(`📊 Total appointments: ${appointmentsResult.rows[0].total}`);
    } catch (error) {
      console.log('❌ Error checking appointments:', error.message);
    }
    
    // Check support tickets
    console.log('🎫 SUPPORT TICKETS:');
    console.log('=' .repeat(50));
    try {
      const ticketsResult = await pool.query('SELECT COUNT(*) as total FROM support_tickets');
      console.log(`📊 Total support tickets: ${ticketsResult.rows[0].total}`);
    } catch (error) {
      console.log('❌ Error checking support tickets:', error.message);
    }
    
    // Check all tables
    console.log('🗄️  DATABASE TABLES:');
    console.log('=' .repeat(50));
    try {
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      console.log('📋 Available tables:');
      tablesResult.rows.forEach((table, index) => {
        console.log(`${index + 1}. ${table.table_name}`);
      });
    } catch (error) {
      console.log('❌ Error checking tables:', error.message);
    }
    
    console.log('\n✅ Database check completed!');
    
  } catch (error) {
    console.error('❌ Error checking accounts:', error.message);
  } finally {
    await pool.end();
  }
}

checkAllAccounts();
