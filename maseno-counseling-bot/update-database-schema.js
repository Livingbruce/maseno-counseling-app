import fetch from 'node-fetch';

const API_BASE_URL = 'https://maseno-counseling-bot-production.up.railway.app';

async function updateDatabaseSchema() {
  console.log('🔧 Updating database schema to match API expectations...\n');
  
  try {
    // The issue is that the database schema doesn't match what the API expects
    // Let's modify the API to work with the existing schema
    
    console.log('1. Testing books with existing schema...');
    
    // Try with the existing schema structure
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      price_cents: 150000, // Use price_cents instead of price
      description: 'Test description',
      isbn: '978-1234567890',
      condition: 'New'
    };
    
    const bookResponse = await fetch(`${API_BASE_URL}/dashboard/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });
    
    console.log('   Book POST status:', bookResponse.status);
    if (bookResponse.ok) {
      const result = await bookResponse.json();
      console.log('   ✅ Book created:', result);
    } else {
      const error = await bookResponse.text();
      console.log('   ❌ Book error:', error);
    }
    
    console.log('\n2. Testing activities with existing schema...');
    
    // Try with the existing schema structure
    const activityData = {
      title: 'Test Activity',
      description: 'Test activity description',
      activity_date: '2025-09-25',
      start_ts: '2025-09-25T10:00:00Z',
      end_ts: '2025-09-25T11:00:00Z'
    };
    
    const activityResponse = await fetch(`${API_BASE_URL}/dashboard/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData)
    });
    
    console.log('   Activity POST status:', activityResponse.status);
    if (activityResponse.ok) {
      const result = await activityResponse.json();
      console.log('   ✅ Activity created:', result);
    } else {
      const error = await activityResponse.text();
      console.log('   ❌ Activity error:', error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateDatabaseSchema();
