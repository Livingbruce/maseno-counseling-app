import fetch from 'node-fetch';

const API_BASE_URL = 'https://maseno-counseling-bot-production.up.railway.app';

async function testMinimalInsert() {
  console.log('🧪 Testing minimal database inserts...\n');
  
  try {
    // Test books with only required fields
    console.log('1. Testing books with minimal data...');
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      price: 1500
    };
    
    const bookResponse = await fetch(`${API_BASE_URL}/dashboard/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });
    
    console.log('   Status:', bookResponse.status);
    if (!bookResponse.ok) {
      const error = await bookResponse.text();
      console.log('   Error:', error);
    } else {
      const result = await bookResponse.json();
      console.log('   ✅ Success:', result);
    }
    
    // Test activities with only required fields
    console.log('\n2. Testing activities with minimal data...');
    const activityData = {
      title: 'Test Activity',
      activity_date: '2025-09-25',
      activity_time: '10:00'
    };
    
    const activityResponse = await fetch(`${API_BASE_URL}/dashboard/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData)
    });
    
    console.log('   Status:', activityResponse.status);
    if (!activityResponse.ok) {
      const error = await activityResponse.text();
      console.log('   Error:', error);
    } else {
      const result = await activityResponse.json();
      console.log('   ✅ Success:', result);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testMinimalInsert();
