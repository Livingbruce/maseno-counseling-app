import fetch from 'node-fetch';

const API_BASE_URL = 'https://maseno-counseling-bot-production.up.railway.app';

async function testDirectInsert() {
  console.log('🧪 Testing direct database insert...\n');
  
  try {
    // Test activities with exact database schema
    console.log('1. Testing activities with exact schema...');
    const activityData = {
      title: 'Test Activity Direct',
      description: 'Test description',
      activity_date: '2025-09-25T10:00:00Z', // Use timestamp format
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
    
    // Test absence with exact schema
    console.log('\n2. Testing absence with exact schema...');
    const absenceData = {
      date: '2025-09-25',
      reason: 'Test absence direct'
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
    
    // Test with even simpler data
    console.log('\n3. Testing with absolute minimal data...');
    const minimalActivity = {
      title: 'Minimal Activity'
    };
    
    const minimalResponse = await fetch(`${API_BASE_URL}/dashboard/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minimalActivity)
    });
    
    console.log(`   Status: ${minimalResponse.status}`);
    if (!minimalResponse.ok) {
      const error = await minimalResponse.text();
      console.log(`   Error: ${error}`);
    } else {
      const result = await minimalResponse.json();
      console.log(`   ✅ Success:`, result);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDirectInsert();
