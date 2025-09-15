import pool from './backend/src/db/pool.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Maseno Counseling Bot Database...');
    
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    
    // Read and execute schema.sql
    console.log('📋 Creating main schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'backend/seed/schema.sql'), 'utf8');
    await pool.query(schemaSQL);
    console.log('✅ Main schema created!');
    
    // Try to add bot tables (ignore errors if they already exist)
    console.log('📋 Adding bot tables...');
    try {
      const additionsSQL = fs.readFileSync(path.join(__dirname, 'backend/seed/schema_additions.sql'), 'utf8');
      await pool.query(additionsSQL);
      console.log('✅ Bot tables added!');
    } catch (error) {
      if (error.code === '42501' || error.message.includes('must be owner')) {
        console.log('⚠️  Bot tables already exist or permission denied - continuing...');
      } else {
        throw error;
      }
    }
    
    // Try to add profile columns
    console.log('📋 Adding profile columns...');
    try {
      const profileSQL = fs.readFileSync(path.join(__dirname, 'backend/seed/add_profile_columns.sql'), 'utf8');
      await pool.query(profileSQL);
      console.log('✅ Profile columns added!');
    } catch (error) {
      if (error.code === '42501' || error.message.includes('must be owner') || error.message.includes('already exists')) {
        console.log('⚠️  Profile columns already exist or permission denied - continuing...');
      } else {
        throw error;
      }
    }
    
    // Try to add announcement columns
    console.log('📋 Adding announcement columns...');
    try {
      const announcementSQL = fs.readFileSync(path.join(__dirname, 'backend/seed/add_announcement_columns.sql'), 'utf8');
      await pool.query(announcementSQL);
      console.log('✅ Announcement columns added!');
    } catch (error) {
      if (error.code === '42501' || error.message.includes('must be owner') || error.message.includes('already exists')) {
        console.log('⚠️  Announcement columns already exist or permission denied - continuing...');
      } else {
        throw error;
      }
    }
    
    // Check if tables exist
    console.log('🔍 Checking database structure...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Found tables:', tablesResult.rows.map(row => row.table_name));
    
    // Try to create admin user
    console.log('👤 Creating admin user...');
    try {
      const { createAdmin } = await import('./backend/seed/create_admin.js');
      await createAdmin();
      console.log('✅ Admin user created!');
    } catch (error) {
      console.log('⚠️  Admin user creation failed:', error.message);
      console.log('💡 You can create an admin user manually later');
    }
    
    console.log('🎉 Database setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Test the connection: npm run dev');
    console.log('2. Deploy to Vercel: vercel --prod');
    console.log('3. Create admin user manually if needed');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDatabase();
