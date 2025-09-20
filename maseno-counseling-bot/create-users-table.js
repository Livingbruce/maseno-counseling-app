import pool from './src/db/pool.js';

async function createUsersTable() {
  try {
    // Create users table to store Telegram user information
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_id BIGINT UNIQUE NOT NULL,
        username VARCHAR(255),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        last_seen TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Users table created successfully');
    
    // Check if table was created
    const result = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'");
    if (result.rows.length > 0) {
      console.log('✅ Users table exists in database');
    }
    
    process.exit(0);
  } catch (e) {
    console.error('Error creating users table:', e.message);
    process.exit(1);
  }
}

createUsersTable();
