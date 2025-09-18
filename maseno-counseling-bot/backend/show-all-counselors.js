import pool from './src/db/pool.js';

async function showAllCounselors() {
  try {
    console.log('👥 ALL COUNSELOR ACCOUNTS IN DATABASE');
    console.log('=' .repeat(80));
    
    // Get all counselors with full details
    const counselorsResult = await pool.query(`
      SELECT 
        id, 
        name, 
        email, 
        is_admin, 
        phone, 
        specialization, 
        bio, 
        office_location, 
        office_hours,
        created_at, 
        updated_at
      FROM counselors 
      ORDER BY created_at ASC
    `);
    
    if (counselorsResult.rows.length === 0) {
      console.log('❌ No counselor accounts found in the database');
      return;
    }
    
    console.log(`📊 Total Counselors: ${counselorsResult.rows.length}\n`);
    
    counselorsResult.rows.forEach((counselor, index) => {
      console.log(`${index + 1}. 👤 ${counselor.name}`);
      console.log(`   🆔 ID: ${counselor.id}`);
      console.log(`   📧 Email: ${counselor.email}`);
      console.log(`   👑 Admin: ${counselor.is_admin ? '✅ YES' : '❌ NO'}`);
      console.log(`   📱 Phone: ${counselor.phone || 'Not provided'}`);
      console.log(`   🎯 Specialization: ${counselor.specialization || 'Not specified'}`);
      console.log(`   📝 Bio: ${counselor.bio || 'Not provided'}`);
      console.log(`   🏢 Office: ${counselor.office_location || 'Not specified'}`);
      console.log(`   ⏰ Hours: ${counselor.office_hours || 'Not specified'}`);
      console.log(`   📅 Created: ${new Date(counselor.created_at).toLocaleString()}`);
      console.log(`   🔄 Updated: ${counselor.updated_at ? new Date(counselor.updated_at).toLocaleString() : 'Never'}`);
      console.log('');
    });
    
    // Summary by admin status
    console.log('📊 SUMMARY BY ADMIN STATUS:');
    console.log('=' .repeat(50));
    
    const adminCount = counselorsResult.rows.filter(c => c.is_admin).length;
    const regularCount = counselorsResult.rows.filter(c => !c.is_admin).length;
    
    console.log(`👑 Admin Counselors: ${adminCount}`);
    console.log(`👤 Regular Counselors: ${regularCount}`);
    console.log(`📊 Total: ${counselorsResult.rows.length}`);
    
    // Show admin accounts specifically
    if (adminCount > 0) {
      console.log('\n👑 ADMIN ACCOUNTS:');
      console.log('=' .repeat(50));
      counselorsResult.rows
        .filter(c => c.is_admin)
        .forEach((admin, index) => {
          console.log(`${index + 1}. ${admin.name} (${admin.email})`);
        });
    }
    
    // Show regular counselor accounts
    if (regularCount > 0) {
      console.log('\n👤 REGULAR COUNSELOR ACCOUNTS:');
      console.log('=' .repeat(50));
      counselorsResult.rows
        .filter(c => !c.is_admin)
        .forEach((counselor, index) => {
          console.log(`${index + 1}. ${counselor.name} (${counselor.email})`);
        });
    }
    
    console.log('\n✅ Counselor accounts check completed!');
    
  } catch (error) {
    console.error('❌ Error checking counselor accounts:', error.message);
  } finally {
    await pool.end();
  }
}

showAllCounselors();
