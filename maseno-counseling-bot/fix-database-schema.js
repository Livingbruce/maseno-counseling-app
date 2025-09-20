import fetch from 'node-fetch';

const API_BASE_URL = 'https://maseno-counseling-bot-production.up.railway.app';

async function fixDatabaseSchema() {
  console.log('🔧 Fixing database schema...\n');
  
  try {
    // First, let's check what tables exist and their structure
    console.log('1. Testing current endpoints...');
    
    // Test books endpoint
    const booksResponse = await fetch(`${API_BASE_URL}/dashboard/books`);
    console.log('   Books GET status:', booksResponse.status);
    
    // Test activities endpoint  
    const activitiesResponse = await fetch(`${API_BASE_URL}/dashboard/activities`);
    console.log('   Activities GET status:', activitiesResponse.status);
    
    // Test absence endpoint
    const absenceResponse = await fetch(`${API_BASE_URL}/dashboard/absence`);
    console.log('   Absence GET status:', absenceResponse.status);
    
    // The issue is likely that the database tables don't exist or have wrong structure
    // Let's try to create a simple test to see what's happening
    console.log('\n2. Testing with minimal data...');
    
    // Test books with minimal data
    const minimalBook = {
      title: 'Test Book',
      author: 'Test Author',
      price: 1500
    };
    
    const bookResponse = await fetch(`${API_BASE_URL}/dashboard/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minimalBook)
    });
    
    console.log('   Book POST status:', bookResponse.status);
    if (!bookResponse.ok) {
      const error = await bookResponse.text();
      console.log('   Book error:', error);
    }
    
    // Test activities with minimal data
    const minimalActivity = {
      title: 'Test Activity',
      activity_date: '2025-09-25',
      activity_time: '10:00'
    };
    
    const activityResponse = await fetch(`${API_BASE_URL}/dashboard/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minimalActivity)
    });
    
    console.log('   Activity POST status:', activityResponse.status);
    if (!activityResponse.ok) {
      const error = await activityResponse.text();
      console.log('   Activity error:', error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixDatabaseSchema();
