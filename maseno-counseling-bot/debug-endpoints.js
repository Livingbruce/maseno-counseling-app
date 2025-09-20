import fetch from 'node-fetch';

const API_BASE_URL = 'https://maseno-counseling-bot-production.up.railway.app';

async function debugEndpoints() {
  console.log('🔍 Debugging endpoint issues...\n');
  
  try {
    // Test activities with minimal data
    console.log('1. Testing activities with minimal data...');
    const activityData = {
      title: 'Test Activity',
      activity_date: '2025-09-25',
      activity_time: '10:00'
    };
    
    console.log('   Sending data:', JSON.stringify(activityData, null, 2));
    
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
    
    // Test absence with minimal data
    console.log('\n2. Testing absence with minimal data...');
    const absenceData = {
      date: '2025-09-25',
      reason: 'Test absence'
    };
    
    console.log('   Sending data:', JSON.stringify(absenceData, null, 2));
    
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
    
    // Test if we can create the absence table manually
    console.log('\n3. Testing absence table creation...');
    const createTableResponse = await fetch(`${API_BASE_URL}/dashboard/absence`, {
      method: 'GET'
    });
    
    console.log(`   GET Status: ${createTableResponse.status}`);
    if (createTableResponse.ok) {
      const data = await createTableResponse.json();
      console.log(`   ✅ Table exists, data count: ${data.length}`);
    } else {
      const error = await createTableResponse.text();
      console.log(`   ❌ Error: ${error}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugEndpoints();
