import fetch from 'node-fetch';

const API_BASE_URL = 'https://maseno-counseling-bot-production.up.railway.app';

async function addAbsenceTable() {
  console.log('🔧 Adding absence_days table to Railway database...\n');
  
  try {
    // Create the absence_days table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS absence_days (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT now()
      );
    `;
    
    // We'll need to execute this SQL directly in the database
    // For now, let's test if the endpoints work
    console.log('Testing absence endpoints...');
    
    // Test POST /dashboard/absence
    const absenceData = {
      date: '2025-09-25',
      reason: 'Test absence reason'
    };
    
    const response = await fetch(`${API_BASE_URL}/dashboard/absence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(absenceData)
    });
    
    console.log('Status:', response.status);
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Absence created:', result);
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addAbsenceTable();
