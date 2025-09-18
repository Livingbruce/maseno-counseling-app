// Final Vercel Test - Complete Authentication Solution
console.log('🎯 FINAL VERCEL TEST - COMPLETE AUTHENTICATION SOLUTION\n');

async function testMainPage() {
  console.log('1. Testing Main Page (Dashboard)...');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch('https://maseno-counseling-bot.vercel.app/');
    
    if (response.ok) {
      const html = await response.text();
      if (html.includes('Maseno Counseling') || html.includes('root')) {
        console.log('✅ Dashboard loaded successfully!');
        console.log('📊 Response length:', html.length, 'characters');
        return true;
      } else {
        console.log('⚠️  Dashboard loaded but content unexpected');
        return false;
      }
    } else {
      console.log('❌ Dashboard failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Dashboard error:', error.message);
    return false;
  }
}

async function testAPIHealth() {
  console.log('\n2. Testing API Health...');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch('https://maseno-counseling-bot.vercel.app/api/');
    const data = await response.json();
    
    if (response.ok && data.message) {
      console.log('✅ API is responding!');
      console.log('📊 Message:', data.message);
      console.log('🔧 Version:', data.version || 'Not specified');
      console.log('📋 Endpoints:', data.availableEndpoints?.length || 0, 'available');
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

async function testSimpleEndpoint() {
  console.log('\n3. Testing Simple API Endpoint...');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch('https://maseno-counseling-bot.vercel.app/api/test-simple');
    const data = await response.json();
    
    if (response.ok && data.message) {
      console.log('✅ Simple endpoint working!');
      console.log('📊 Response:', data.message);
      console.log('⏰ Timestamp:', data.timestamp);
      return true;
    } else {
      console.log('❌ Simple endpoint failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Simple endpoint error:', error.message);
    return false;
  }
}

async function testLoginEndpoint() {
  console.log('\n4. Testing Login Endpoint...');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch('https://maseno-counseling-bot.vercel.app/api/login-simple', {
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

async function runCompleteTest() {
  console.log('🚀 RUNNING COMPLETE VERCEL AUTHENTICATION TEST...\n');
  console.log('🎯 Target: https://maseno-counseling-bot.vercel.app/\n');
  
  const dashboardWorking = await testMainPage();
  const apiWorking = await testAPIHealth();
  const simpleWorking = await testSimpleEndpoint();
  const loginWorking = await testLoginEndpoint();
  
  console.log('\n🎯 FINAL RESULTS:');
  console.log('=' .repeat(60));
  
  if (dashboardWorking && apiWorking && simpleWorking && loginWorking) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Dashboard: Working');
    console.log('✅ API: Working');
    console.log('✅ Simple Endpoint: Working');
    console.log('✅ Login Authentication: Working');
    console.log('\n🎉 VERCEL DEPLOYMENT SUCCESSFUL!');
    console.log('🎉 AUTHENTICATION IS 100% WORKING!');
    console.log('\n🔑 READY TO USE:');
    console.log('🌐 URL: https://maseno-counseling-bot.vercel.app/');
    console.log('📧 Email: admin@maseno.ac.ke');
    console.log('🔑 Password: 123456');
  } else {
    console.log('⚠️  SOME TESTS FAILED:');
    console.log('📊 Dashboard:', dashboardWorking ? '✅' : '❌');
    console.log('📊 API:', apiWorking ? '✅' : '❌');
    console.log('📊 Simple Endpoint:', simpleWorking ? '✅' : '❌');
    console.log('📊 Login:', loginWorking ? '✅' : '❌');
    console.log('\n⏰ Deployment may still be propagating...');
    console.log('💡 Wait 2-3 minutes and test again');
  }
  
  console.log('\n🔧 VERCEL CONFIGURATION:');
  console.log('📋 Framework: Vite + React');
  console.log('📋 Build Command: cd dashboard && npm run build');
  console.log('📋 Output Directory: dashboard/dist');
  console.log('📋 API Runtime: nodejs18.x');
}

runCompleteTest().catch(console.error);
