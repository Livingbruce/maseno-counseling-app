// Test the actual login API endpoint
const https = require('https');

async function testLoginEndpoint() {
  console.log('🧪 TESTING LOGIN API ENDPOINT...\n');
  
  const baseUrl = 'https://maseno-counseling-bot.vercel.app';
  const loginData = {
    email: 'admin@maseno.ac.ke',
    password: '123456'
  };
  
  console.log('🔍 Testing login endpoint...');
  console.log(`📡 URL: ${baseUrl}/api/auth/login`);
  console.log(`📧 Email: ${loginData.email}`);
  console.log(`🔑 Password: ${loginData.password}`);
  console.log('');
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Status Text: ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`📊 Response: ${responseText}`);
    
    if (response.ok) {
      console.log('✅ LOGIN API IS WORKING!');
    } else {
      console.log('❌ LOGIN API IS NOT WORKING');
      console.log('💡 This explains why you can\'t login on the frontend');
    }
    
  } catch (error) {
    console.log('❌ Error testing login endpoint:', error.message);
    console.log('💡 This might be a network issue or the API is down');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. If the API test fails, we need to fix the backend');
  console.log('2. If the API test passes, the issue is in the frontend');
  console.log('3. Try logging in with the credentials I provided');
}

testLoginEndpoint();
