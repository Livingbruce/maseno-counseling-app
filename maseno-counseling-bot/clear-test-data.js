import fetch from 'node-fetch';

const API_BASE_URL = 'https://maseno-counseling-bot-production.up.railway.app';

async function clearTestData() {
  console.log('🧹 Clearing all test data from Railway database...\n');
  
  try {
    // Get all announcements
    console.log('1. Getting all announcements...');
    const announcementsResponse = await fetch(`${API_BASE_URL}/dashboard/announcements`);
    const announcements = await announcementsResponse.json();
    console.log(`   Found ${announcements.length} announcements`);
    
    // Delete all announcements
    for (const announcement of announcements) {
      console.log(`   Deleting announcement ${announcement.id}: ${announcement.message.substring(0, 30)}...`);
      const deleteResponse = await fetch(`${API_BASE_URL}/dashboard/announcements/${announcement.id}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log(`   ✅ Deleted announcement ${announcement.id}`);
      } else {
        console.log(`   ❌ Failed to delete announcement ${announcement.id}`);
      }
    }
    
    // Get all appointments
    console.log('\n2. Getting all appointments...');
    const appointmentsResponse = await fetch(`${API_BASE_URL}/dashboard/appointments`);
    const appointments = await appointmentsResponse.json();
    console.log(`   Found ${appointments.length} appointments`);
    
    // Delete all appointments
    for (const appointment of appointments) {
      console.log(`   Deleting appointment ${appointment.id}...`);
      const deleteResponse = await fetch(`${API_BASE_URL}/dashboard/appointments/${appointment.id}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log(`   ✅ Deleted appointment ${appointment.id}`);
      } else {
        console.log(`   ❌ Failed to delete appointment ${appointment.id}`);
      }
    }
    
    // Get all books
    console.log('\n3. Getting all books...');
    const booksResponse = await fetch(`${API_BASE_URL}/dashboard/books`);
    const books = await booksResponse.json();
    console.log(`   Found ${books.length} books`);
    
    // Delete all books
    for (const book of books) {
      console.log(`   Deleting book ${book.id}: ${book.title}...`);
      const deleteResponse = await fetch(`${API_BASE_URL}/dashboard/books/${book.id}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log(`   ✅ Deleted book ${book.id}`);
      } else {
        console.log(`   ❌ Failed to delete book ${book.id}`);
      }
    }
    
    // Get all activities
    console.log('\n4. Getting all activities...');
    const activitiesResponse = await fetch(`${API_BASE_URL}/dashboard/activities`);
    const activities = await activitiesResponse.json();
    console.log(`   Found ${activities.length} activities`);
    
    // Delete all activities
    for (const activity of activities) {
      console.log(`   Deleting activity ${activity.id}: ${activity.title}...`);
      const deleteResponse = await fetch(`${API_BASE_URL}/dashboard/activities/${activity.id}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log(`   ✅ Deleted activity ${activity.id}`);
      } else {
        console.log(`   ❌ Failed to delete activity ${activity.id}`);
      }
    }
    
    console.log('\n🎉 All test data cleared from Railway database!');
    console.log('Your dashboard should now be empty and ready for real data.');
    
  } catch (error) {
    console.error('❌ Error clearing test data:', error);
  }
}

clearTestData();
