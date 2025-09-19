import pool from './src/db/pool.js';

async function checkStudents() {
  try {
    console.log('🔍 Checking students table structure and data...\n');
    
    // First, check the table structure
    console.log('📋 STUDENTS TABLE STRUCTURE:');
    console.log('=' .repeat(50));
    const structureResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      ORDER BY ordinal_position
    `);
    
    structureResult.rows.forEach((column, index) => {
      console.log(`${index + 1}. ${column.column_name} (${column.data_type}) - ${column.is_nullable === 'YES' ? 'Nullable' : 'Not Null'}`);
    });
    
    console.log('\n🎓 STUDENTS DATA:');
    console.log('=' .repeat(50));
    
    // Get all students
    const studentsResult = await pool.query('SELECT * FROM students ORDER BY created_at DESC LIMIT 10');
    
    if (studentsResult.rows.length === 0) {
      console.log('❌ No student accounts found');
    } else {
      console.log(`📊 Total students: ${studentsResult.rows.length} (showing first 10)`);
      studentsResult.rows.forEach((student, index) => {
        console.log(`${index + 1}. Student ID: ${student.id}`);
        console.log(`   👤 Name: ${student.name || 'Unknown'}`);
        console.log(`   📧 Email: ${student.email || 'N/A'}`);
        console.log(`   📅 Created: ${new Date(student.created_at).toLocaleString()}`);
        console.log(`   📊 All data:`, JSON.stringify(student, null, 2));
        console.log('');
      });
    }
    
    // Check total count
    const countResult = await pool.query('SELECT COUNT(*) as total FROM students');
    console.log(`📊 Total students in database: ${countResult.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Error checking students:', error.message);
  } finally {
    await pool.end();
  }
}

checkStudents();
