import fetch from 'node-fetch';

const API_BASE_URL = 'https://maseno-counseling-bot-production.up.railway.app';

async function testPostEndpoints() {
  console.log('🧪 Testing POST endpoints...\n');
  
  try {
    // Test POST /dashboard/books
    console.log('1. Testing POST /dashboard/books...');
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      price: 1500,
      description: 'Test description',
      isbn: '978-1234567890',
      condition: 'New'
    };
    
    const bookResponse = await fetch(`${API_BASE_URL}/dashboard/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData)
    });
    
    console.log('   Status:', bookResponse.status);
    if (bookResponse.ok) {
      const result = await bookResponse.json();
      console.log('   ✅ Book created:', result);
    } else {
      const error = await bookResponse.text();
      console.log('   ❌ Error:', error);
    }
    
    // Test POST /dashboard/activities
    console.log('\n2. Testing POST /dashboard/activities...');
    const activityData = {
      title: 'Test Activity',
      description: 'Test activity description',
      activity_date: '2025-09-25',
      activity_time: '10:00',
      location: 'Test Location'
    };
    
    const activityResponse = await fetch(`${API_BASE_URL}/dashboard/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData)
    });
    
    console.log('   Status:', activityResponse.status);
    if (activityResponse.ok) {
      const result = await activityResponse.json();
      console.log('   ✅ Activity created:', result);
    } else {
      const error = await activityResponse.text();
      console.log('   ❌ Error:', error);
    }
    
    // Test POST /dashboard/absence
    console.log('\n3. Testing POST /dashboard/absence...');
    const absenceData = {
      date: '2025-09-25',
      reason: 'Test absence reason'
    };
    
    const absenceResponse = await fetch(`${API_BASE_URL}/dashboard/absence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(absenceData)
    });
    
    console.log('   Status:', absenceResponse.status);
    if (absenceResponse.ok) {
      const result = await absenceResponse.json();
      console.log('   ✅ Absence created:', result);
    } else {
      const error = await absenceResponse.text();
      console.log('   ❌ Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPostEndpoints();
