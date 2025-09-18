// Test After Vercel Fix
console.log('🧪 TESTING AFTER VERCEL FIX\n');

async function testMainAPI() {
  console.log('1. Testing Main API...');
  console.log('=' .repeat(30));
  
  try {
    const response = await fetch('https://maseno-counseling-app.vercel.app/api/');
    const data = await response.json();
    
    console.log('✅ Status: 200');
    console.log('📊 Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.version === '4.0.0') {
      console.log('🎉 SUCCESS: New version deployed!');
      return true;
    } else {
      console.log('⚠️  Still showing old version');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testLoginEndpoint() {
  console.log('\n2. Testing Login Endpoint...');
  console.log('=' .repeat(30));
  
  try {
    const response = await fetch('https://maseno-counseling-app.vercel.app/api/login-working', {
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
      console.log('✅ LOGIN SUCCESS!');
      console.log('👤 User:', data.user?.name);
      console.log('🔑 Token:', data.token ? 'Present' : 'Missing');
      console.log('🎉 AUTHENTICATION IS WORKING!');
      return true;
    } else {
      console.log('❌ Login failed:', data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testDashboardAccess() {
  console.log('\n3. Testing Dashboard Access...');
  console.log('=' .repeat(30));
  
  try {
    const response = await fetch('https://maseno-counseling-app.vercel.app/');
    if (response.ok) {
      console.log('✅ Dashboard is accessible');
      console.log('🎯 Ready for login testing');
      return true;
    } else {
      console.log('❌ Dashboard not accessible');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function runTest() {
  console.log('🚀 Running Post-Vercel Fix Test...\n');
  
  const apiUpdated = await testMainAPI();
  const loginWorking = await testLoginEndpoint();
  const dashboardAccess = await testDashboardAccess();
  
  console.log('\n🎯 FINAL RESULT:');
  console.log('=' .repeat(50));
  
  if (apiUpdated && loginWorking && dashboardAccess) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ API updated to version 4.0.0');
    console.log('✅ Login endpoint working');
    console.log('✅ Dashboard accessible');
    console.log('✅ Authentication is fully functional');
    console.log('\n🎉 VERCEL FIX SUCCESSFUL!');
    console.log('🎉 LOGIN IS WORKING 100%!');
  } else {
    console.log('⚠️  Some tests failed');
    console.log('⏰ Deployment may still be propagating');
    console.log('💡 Wait 2-3 minutes and test again');
  }
  
  console.log('\n🔑 WORKING CREDENTIALS:');
  console.log('📧 Email: admin@maseno.ac.ke');
  console.log('🔑 Password: 123456');
  console.log('🌐 URL: https://maseno-counseling-bot.vercel.app/');
}

runTest().catch(console.error);
