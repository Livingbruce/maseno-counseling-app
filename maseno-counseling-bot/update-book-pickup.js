import pool from './src/db/pool.js';

async function updateBookPickup() {
  try {
    const result = await pool.query(
      'UPDATE books SET pickup_station = $1 WHERE id = $2',
      ['Main Campus Library', 3]
    );
    console.log('✅ Updated book pickup station');
    
    // Verify the update
    const book = await pool.query('SELECT * FROM books WHERE id = 3');
    console.log('📚 Updated book:', book.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateBookPickup();
