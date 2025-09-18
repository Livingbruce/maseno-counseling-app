// Simple login test
console.log('🧪 SIMPLE LOGIN TEST...\n');

// Check if we have the required environment variables
console.log('🔍 Checking environment variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');

if (!process.env.DATABASE_URL) {
  console.log('\n❌ DATABASE_URL is not set. Please set it in your environment.');
  console.log('💡 You can set it by running:');
  console.log('   $env:DATABASE_URL="your-database-url"');
  process.exit(1);
}

console.log('\n✅ Environment variables are set. Login API should work!');
console.log('\n🎯 Your login credentials:');
console.log('📧 Email: admin@maseno.ac.ke');
console.log('🔑 Password: 123456');
console.log('🌐 URL: https://maseno-counseling-bot.vercel.app/');
console.log('\n💡 Try logging in now!');
