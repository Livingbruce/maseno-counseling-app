import pool from './src/db/pool.js';

async function checkTables() {
  try {
    const result = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Database tables:', result.rows.map(t => t.table_name));
    
    // Check if users table exists
    const usersTable = result.rows.find(t => t.table_name === 'users');
    if (usersTable) {
      console.log('✅ Users table exists');
      const userCount = await pool.query('SELECT COUNT(*) FROM users');
      console.log('User count:', userCount.rows[0].count);
    } else {
      console.log('❌ Users table does not exist');
    }
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

checkTables();
