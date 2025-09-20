import fetch from 'node-fetch';

const API_BASE_URL = 'https://maseno-counseling-bot-production.up.railway.app';

async function checkActualSchema() {
  console.log('🔍 Checking actual database schema...\n');
  
  try {
    // Get existing data to see the actual column structure
    console.log('1. Checking activities table structure...');
    const activitiesResponse = await fetch(`${API_BASE_URL}/dashboard/activities`);
    if (activitiesResponse.ok) {
      const activities = await activitiesResponse.json();
      console.log('   Activities table exists, sample structure:');
      if (activities.length > 0) {
        console.log('   Columns:', Object.keys(activities[0]));
        console.log('   Sample data:', activities[0]);
      } else {
        console.log('   No data in activities table');
      }
    }
    
    console.log('\n2. Checking absence table structure...');
    const absenceResponse = await fetch(`${API_BASE_URL}/dashboard/absence`);
    if (absenceResponse.ok) {
      const absence = await absenceResponse.json();
      console.log('   Absence table exists, sample structure:');
      if (absence.length > 0) {
        console.log('   Columns:', Object.keys(absence[0]));
        console.log('   Sample data:', absence[0]);
      } else {
        console.log('   No data in absence table');
      }
    }
    
    console.log('\n3. Checking books table structure (working reference)...');
    const booksResponse = await fetch(`${API_BASE_URL}/dashboard/books`);
    if (booksResponse.ok) {
      const books = await booksResponse.json();
      console.log('   Books table structure:');
      if (books.length > 0) {
        console.log('   Columns:', Object.keys(books[0]));
        console.log('   Sample data:', books[0]);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkActualSchema();
