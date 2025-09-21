// Simulate what the frontend is doing
const API_BASE_URL = 'https://maseno-counseling-bot-production.up.railway.app';

async function testFrontendAPI() {
  try {
    console.log('🧪 Testing frontend API call...');
    
    // Simulate the exact call the frontend makes
    const response = await fetch(`${API_BASE_URL}/dashboard/appointments`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Raw data from API:', JSON.stringify(data, null, 2));
    
    // Apply the same transformation the frontend does
    const transformedData = data.map(appointment => ({
      ...appointment,
      student_name: appointment.telegram_username ? 
        `@${appointment.telegram_username}` : 
        `Student #${appointment.student_id}`,
      notes: appointment.notes || 'No notes available'
    }));
    
    console.log('🔄 Transformed data:', JSON.stringify(transformedData, null, 2));
    console.log('📊 Total appointments:', transformedData.length);
    
    // Test if the data would display correctly
    transformedData.forEach((apt, i) => {
      console.log(`\n📅 Appointment ${i + 1}:`);
      console.log(`   Student: ${apt.student_name}`);
      console.log(`   Start: ${apt.start_ts}`);
      console.log(`   End: ${apt.end_ts}`);
      console.log(`   Status: ${apt.status}`);
      console.log(`   Telegram: @${apt.telegram_username}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFrontendAPI();
