import fetch from 'node-fetch';

const API_BASE_URL = 'https://maseno-counseling-bot-production.up.railway.app';

async function testAPI() {
  console.log('🧪 Testing Railway API Connection...\n');
  
  try {
    // Test announcements endpoint
    console.log('1. Testing /dashboard/announcements...');
    const announcementsResponse = await fetch(`${API_BASE_URL}/dashboard/announcements`);
    console.log('   Status:', announcementsResponse.status);
    
    if (announcementsResponse.ok) {
      const announcements = await announcementsResponse.json();
      console.log('   ✅ Data:', announcements);
    } else {
      console.log('   ❌ Error:', await announcementsResponse.text());
    }
    
    console.log('\n2. Testing /dashboard/activities...');
    const activitiesResponse = await fetch(`${API_BASE_URL}/dashboard/activities`);
    console.log('   Status:', activitiesResponse.status);
    
    if (activitiesResponse.ok) {
      const activities = await activitiesResponse.json();
      console.log('   ✅ Data:', activities);
    } else {
      console.log('   ❌ Error:', await activitiesResponse.text());
    }
    
    console.log('\n3. Testing /dashboard/books...');
    const booksResponse = await fetch(`${API_BASE_URL}/dashboard/books`);
    console.log('   Status:', booksResponse.status);
    
    if (booksResponse.ok) {
      const books = await booksResponse.json();
      console.log('   ✅ Data:', books);
    } else {
      console.log('   ❌ Error:', await booksResponse.text());
    }
    
    console.log('\n4. Testing /dashboard/appointments...');
    const appointmentsResponse = await fetch(`${API_BASE_URL}/dashboard/appointments`);
    console.log('   Status:', appointmentsResponse.status);
    
    if (appointmentsResponse.ok) {
      const appointments = await appointmentsResponse.json();
      console.log('   ✅ Data:', appointments);
    } else {
      console.log('   ❌ Error:', await appointmentsResponse.text());
    }
    
    console.log('\n5. Testing POST /dashboard/announcements...');
    const postResponse = await fetch(`${API_BASE_URL}/dashboard/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test announcement from API test',
        is_force: false
      })
    });
    console.log('   Status:', postResponse.status);
    
    if (postResponse.ok) {
      const result = await postResponse.json();
      console.log('   ✅ Created:', result);
    } else {
      console.log('   ❌ Error:', await postResponse.text());
    }
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

testAPI();
