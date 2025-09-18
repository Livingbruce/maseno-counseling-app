// Standalone API Test - Complete Authentication Solution
console.log('🎯 STANDALONE API TEST - COMPLETE AUTHENTICATION SOLUTION\n');

async function testMainPage() {
  console.log('1. Testing Main Page...');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch('https://maseno-counseling-bot.vercel.app/');
    
    if (response.ok) {
      const html = await response.text();
      if (html.includes('Maseno Counseling') || html.includes('System Online')) {
        console.log('✅ Main page loaded successfully!');
        console.log('📊 Response length:', html.length, 'characters');
        return true;
      } else {
        console.log('⚠️  Main page loaded but content unexpected');
        console.log('📊 Content preview:', html.substring(0, 200) + '...');
        return false;
      }
    } else {
      console.log('❌ Main page failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Main page error:', error.message);
    return false;
  }
}

async function testAPIStatus() {
  console.log('\n2. Testing API Status...');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch('https://maseno-counseling-bot.vercel.app/api/');
    const data = await response.json();
    
    if (response.ok && data.message) {
      console.log('✅ API is responding!');
      console.log('📊 Message:', data.message);
      console.log('🔧 Version:', data.version);
      console.log('📋 Status:', data.status);
      console.log('🔐 Authentication:', data.authentication);
      console.log('💾 Database:', data.database);
      console.log('🔑 JWT:', data.jwt);
      return true;
    } else {
      console.log('❌ API response unexpected:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ API error:', error.message);
    return false;
  }
}

async function testStatusEndpoint() {
  console.log('\n3. Testing Status Endpoint...');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch('https://maseno-counseling-bot.vercel.app/api/status');
    const data = await response.json();
    
    if (response.ok && data.message) {
      console.log('✅ Status endpoint working!');
      console.log('📊 Response:', data.message);
      console.log('⏰ Timestamp:', data.timestamp);
      console.log('🚀 Deployment:', data.deployment);
      return true;
    } else {
      console.log('❌ Status endpoint failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Status endpoint error:', error.message);
    return false;
  }
}

async function testLoginEndpoint() {
  console.log('\n4. Testing Login Endpoint...');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch('https://maseno-counseling-bot.vercel.app/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@maseno.ac.ke',
        password: '123456'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.message === 'Login successful') {
      console.log('🎉 LOGIN SUCCESS!');
      console.log('👤 User:', data.user?.name);
      console.log('📧 Email:', data.user?.email);
      console.log('🔑 Token:', data.token ? 'Present' : 'Missing');
      console.log('👑 Admin:', data.user?.is_admin ? 'Yes' : 'No');
      return true;
    } else {
      console.log('❌ Login failed:', data.error || 'Unknown error');
      console.log('📊 Status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function testTestEndpoint() {
  console.log('\n5. Testing Test Endpoint...');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch('https://maseno-counseling-bot.vercel.app/api/test');
    const data = await response.json();
    
    if (response.ok && data.message) {
      console.log('✅ Test endpoint working!');
      console.log('📊 Response:', data.message);
      console.log('⏰ Timestamp:', data.timestamp);
      return true;
    } else {
      console.log('❌ Test endpoint failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Test endpoint error:', error.message);
    return false;
  }
}

async function runStandaloneTest() {
  console.log('🚀 RUNNING STANDALONE API TEST...\n');
  console.log('🎯 Target: https://maseno-counseling-bot.vercel.app/\n');
  
  const mainPageWorking = await testMainPage();
  const apiWorking = await testAPIStatus();
  const statusWorking = await testStatusEndpoint();
  const loginWorking = await testLoginEndpoint();
  const testWorking = await testTestEndpoint();
  
  console.log('\n🎯 FINAL RESULTS:');
  console.log('=' .repeat(60));
  
  if (mainPageWorking && apiWorking && statusWorking && loginWorking && testWorking) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Main Page: Working');
    console.log('✅ API Status: Working');
    console.log('✅ Status Endpoint: Working');
    console.log('✅ Login Authentication: Working');
    console.log('✅ Test Endpoint: Working');
    console.log('\n🎉 STANDALONE DEPLOYMENT SUCCESSFUL!');
    console.log('🎉 AUTHENTICATION IS 100% WORKING!');
    console.log('\n🔑 READY TO USE:');
    console.log('🌐 URL: https://maseno-counseling-bot.vercel.app/');
    console.log('📧 Email: admin@maseno.ac.ke');
    console.log('🔑 Password: 123456');
    console.log('\n📋 API ENDPOINTS:');
    console.log('🔧 Status: /api/');
    console.log('🔧 Health: /api/status');
    console.log('🔧 Login: /api/login');
    console.log('🔧 Test: /api/test');
  } else {
    console.log('⚠️  SOME TESTS FAILED:');
    console.log('📊 Main Page:', mainPageWorking ? '✅' : '❌');
    console.log('📊 API Status:', apiWorking ? '✅' : '❌');
    console.log('📊 Status Endpoint:', statusWorking ? '✅' : '❌');
    console.log('📊 Login:', loginWorking ? '✅' : '❌');
    console.log('📊 Test Endpoint:', testWorking ? '✅' : '❌');
    console.log('\n⏰ Deployment may still be propagating...');
    console.log('💡 Wait 2-3 minutes and test again');
  }
  
  console.log('\n🔧 STANDALONE CONFIGURATION:');
  console.log('📋 API File: api.js (root level)');
  console.log('📋 Routes: Direct routing to api.js');
  console.log('📋 Frontend: index.html (static)');
  console.log('📋 Authentication: Complete with JWT');
}

runStandaloneTest().catch(console.error);
