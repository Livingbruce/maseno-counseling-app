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
    
    // Read and execute schema_additions.sql
    console.log('📋 Adding bot tables...');
    const additionsSQL = fs.readFileSync(path.join(__dirname, 'backend/seed/schema_additions.sql'), 'utf8');
    await pool.query(additionsSQL);
    console.log('✅ Bot tables added!');
    
    // Read and execute add_profile_columns.sql
    console.log('📋 Adding profile columns...');
    const profileSQL = fs.readFileSync(path.join(__dirname, 'backend/seed/add_profile_columns.sql'), 'utf8');
    await pool.query(profileSQL);
    console.log('✅ Profile columns added!');
    
    // Read and execute add_announcement_columns.sql
    console.log('📋 Adding announcement columns...');
    const announcementSQL = fs.readFileSync(path.join(__dirname, 'backend/seed/add_announcement_columns.sql'), 'utf8');
    await pool.query(announcementSQL);
    console.log('✅ Announcement columns added!');
    
    // Create admin user
    console.log('👤 Creating admin user...');
    const { createAdmin } = await import('./backend/seed/create_admin.js');
    await createAdmin();
    console.log('✅ Admin user created!');
    
    // Optimize database
    console.log('⚡ Optimizing database...');
    const { optimizeDatabase } = await import('./backend/seed/optimize_database.js');
    await optimizeDatabase();
    console.log('✅ Database optimized!');
    
    console.log('🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env file with the correct DATABASE_URL');
    console.log('2. Test the connection: npm run dev');
    console.log('3. Deploy to Vercel: vercel --prod');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDatabase();
