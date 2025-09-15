import pool from './src/db/pool.js';

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('Connection string (masked):', process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.replace(/:[^@]*@/, ':***@') : 'Not set');
    
    const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ Connection successful!');
    console.log('🕐 Current time:', result.rows[0].current_time);
    console.log('📊 Database version:', result.rows[0].db_version);
    
    // Test table access
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('📋 Available tables:', tablesResult.rows.map(row => row.table_name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('💡 Please check your DATABASE_URL in the .env file');
  } finally {
    await pool.end();
  }
}

testConnection();
