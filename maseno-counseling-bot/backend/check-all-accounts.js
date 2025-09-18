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
    
    // Check students table
    console.log('🎓 STUDENTS ACCOUNTS:');
    console.log('=' .repeat(50));
    const studentsResult = await pool.query('SELECT id, name, telegram_id, created_at FROM students ORDER BY created_at DESC LIMIT 10');
    
    if (studentsResult.rows.length === 0) {
      console.log('❌ No student accounts found');
    } else {
      console.log(`📊 Total students: ${studentsResult.rows.length} (showing first 10)`);
      studentsResult.rows.forEach((student, index) => {
        console.log(`${index + 1}. 👤 ${student.name || 'Unknown'}`);
        console.log(`   🆔 Telegram ID: ${student.telegram_id}`);
        console.log(`   📅 Created: ${new Date(student.created_at).toLocaleString()}`);
        console.log('');
      });
    }
    
    // Check appointments
    console.log('📅 APPOINTMENTS:');
    console.log('=' .repeat(50));
    const appointmentsResult = await pool.query('SELECT COUNT(*) as total FROM appointments');
    console.log(`📊 Total appointments: ${appointmentsResult.rows[0].total}`);
    
    // Check support tickets
    console.log('🎫 SUPPORT TICKETS:');
    console.log('=' .repeat(50));
    const ticketsResult = await pool.query('SELECT COUNT(*) as total FROM support_tickets');
    console.log(`📊 Total support tickets: ${ticketsResult.rows[0].total}`);
    
    console.log('\n✅ Database check completed!');
    
  } catch (error) {
    console.error('❌ Error checking accounts:', error.message);
  } finally {
    await pool.end();
  }
}

checkAllAccounts();
