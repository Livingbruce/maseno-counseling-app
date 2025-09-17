import pool from './src/db/pool.js';

async function checkAdmin() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT email, password FROM counselors WHERE email = $1', ['vicymbrush@gmail.com']);
    
    console.log('Admin account found:', result.rows.length > 0);
    if (result.rows.length > 0) {
      console.log('Email:', result.rows[0].email);
      console.log('Password hash exists:', !!result.rows[0].password);
    } else {
      console.log('No admin account found with email: vicymbrush@gmail.com');
    }
    
    await client.release();
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAdmin();
