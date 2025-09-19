import pool from "../src/db/pool.js";

async function init() {
  try {
    console.log("🚀 Initializing database...");

    // Counselors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS counselors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT now()
      );
    `);

    // Students table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        admission_no TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        year_of_study INT NOT NULL,
        created_at TIMESTAMP DEFAULT now()
      );
    `);

    // Appointments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES students(id) ON DELETE CASCADE,
        counselor_id INT NOT NULL REFERENCES counselors(id) ON DELETE CASCADE,
        start_ts TIMESTAMP NOT NULL,
        end_ts TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);

    // Books table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT,
        price_cents INTEGER NOT NULL,
        pickup_station TEXT,
        counselor_id INT REFERENCES counselors(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT now()
      );
    `);

    // Announcements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        counselor_id INT REFERENCES counselors(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT now()
      );
    `);

    // Activities table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        activity_date TIMESTAMP NOT NULL,
        counselor_id INT REFERENCES counselors(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT now()
      );
    `);

    // Absence days table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS absence_days (
        id SERIAL PRIMARY KEY,
        counselor_id INT REFERENCES counselors(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT now()
      );
    `);

    // Create triggers for updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
         NEW.updated_at = now();
         RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Add trigger for appointments
    await pool.query(`
      DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
      CREATE TRIGGER update_appointments_updated_at
      BEFORE UPDATE ON appointments
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
    `);

    // Create a default admin counselor
    await pool.query(`
      INSERT INTO counselors (name, email, password_hash, is_admin)
      VALUES ('Admin Counselor', 'admin@maseno.ac.ke', '$2b$10$example_hash_here', true)
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log("✅ Database initialized successfully!");
    console.log("📋 Tables created: counselors, students, appointments, books, announcements, activities, absence_days");
    console.log("👤 Default admin created: admin@maseno.ac.ke");
    
  } catch (err) {
    console.error("❌ Error initializing database:", err);
    throw err;
  } finally {
    await pool.end();
  }
}

init();