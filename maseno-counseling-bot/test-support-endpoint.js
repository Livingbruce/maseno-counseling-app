import fetch from 'node-fetch';

async function testSupportEndpoint() {
  try {
    console.log('🧪 Testing support tickets endpoint...');
    
    const response = await fetch('https://maseno-counseling-bot-production.up.railway.app/dashboard/support/tickets');
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ Support tickets data:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('❌ Error response:', text.substring(0, 500));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSupportEndpoint();
