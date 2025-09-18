// Direct API Test
const https = require('https');

const testData = {
  email: 'admin@maseno.ac.ke',
  password: '123456'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'maseno-counseling-bot.vercel.app',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing API directly...');
console.log('📧 Email:', testData.email);
console.log('🔑 Password:', testData.password);
console.log('🌐 URL: https://maseno-counseling-bot.vercel.app/api/auth/login');
console.log('');

const req = https.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ LOGIN SUCCESS!');
        console.log('🎯 The API is working correctly!');
      } else {
        console.log('\n❌ LOGIN FAILED!');
        console.log('🔧 Check the error message above.');
      }
    } catch (e) {
      console.log('❌ Invalid JSON response:');
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.write(postData);
req.end();
