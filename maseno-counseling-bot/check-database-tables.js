import fetch from 'node-fetch';

const API_BASE_URL = 'https://maseno-counseling-bot-production.up.railway.app';

async function checkDatabaseTables() {
  console.log('🔍 Checking database tables and structure...\n');
  
  try {
    // Check all available endpoints
    const endpoints = [
      '/dashboard/announcements',
      '/dashboard/appointments', 
      '/dashboard/books',
      '/dashboard/activities',
      '/dashboard/absence'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`Checking ${endpoint}...`);
      
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ Data count: ${data.length}`);
          if (data.length > 0) {
            console.log(`   Sample data:`, JSON.stringify(data[0], null, 2));
          }
        } else {
          const error = await response.text();
          console.log(`   ❌ Error: ${error}`);
        }
      } catch (err) {
        console.log(`   ❌ Request failed: ${err.message}`);
      }
      
      console.log('');
    }
    
    // Test POST operations
    console.log('Testing POST operations...\n');
    
    // Test activities POST
    console.log('Testing activities POST...');
    const activityData = {
      title: 'Test Activity',
      description: 'Test description',
      activity_date: '2025-09-25',
      activity_time: '10:00',
      location: 'Test Location'
    };
    
    const activityResponse = await fetch(`${API_BASE_URL}/dashboard/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData)
    });
    
    console.log(`   Status: ${activityResponse.status}`);
    if (!activityResponse.ok) {
      const error = await activityResponse.text();
      console.log(`   Error: ${error}`);
    } else {
      const result = await activityResponse.json();
      console.log(`   ✅ Success:`, result);
    }
    
    // Test absence POST
    console.log('\nTesting absence POST...');
    const absenceData = {
      date: '2025-09-25',
      reason: 'Test absence'
    };
    
    const absenceResponse = await fetch(`${API_BASE_URL}/dashboard/absence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(absenceData)
    });
    
    console.log(`   Status: ${absenceResponse.status}`);
    if (!absenceResponse.ok) {
      const error = await absenceResponse.text();
      console.log(`   Error: ${error}`);
    } else {
      const result = await absenceResponse.json();
      console.log(`   ✅ Success:`, result);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDatabaseTables();
