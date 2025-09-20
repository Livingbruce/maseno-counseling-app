import fetch from 'node-fetch';

const API_BASE_URL = 'https://maseno-counseling-bot-production.up.railway.app';

async function testActivitiesFix() {
  console.log('🧪 Testing activities with different date formats...\n');
  
  try {
    // Test with different date formats
    const testCases = [
      {
        name: 'ISO Date Format',
        data: {
          title: 'Test Activity 1',
          activity_date: '2025-09-25',
          activity_time: '10:00'
        }
      },
      {
        name: 'Simple Date Format',
        data: {
          title: 'Test Activity 2',
          activity_date: '2025-09-26',
          activity_time: '14:00'
        }
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`Testing ${testCase.name}...`);
      
      const response = await fetch(`${API_BASE_URL}/dashboard/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.data)
      });
      
      console.log(`   Status: ${response.status}`);
      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ Success:`, result);
        break; // Stop on first success
      } else {
        const error = await response.text();
        console.log(`   ❌ Error:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testActivitiesFix();
