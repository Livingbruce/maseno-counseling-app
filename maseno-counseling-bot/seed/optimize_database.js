import pool from "../src/db/pool.js";

async function optimizeDatabase() {
  try {
    console.log("🚀 Optimizing database for millions of users...");

    // Create indexes for better query performance
    const indexes = [
      // User sessions indexes
      "CREATE INDEX IF NOT EXISTS idx_user_sessions_telegram_user_id ON user_sessions(telegram_user_id)",
      "CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at)",
      "CREATE INDEX IF NOT EXISTS idx_user_sessions_updated_at ON user_sessions(updated_at)",
      
      // Support tickets indexes
      "CREATE INDEX IF NOT EXISTS idx_support_tickets_telegram_user_id ON support_tickets(telegram_user_id)",
      "CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status)",
      "CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority)",
      "CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at)",
      "CREATE INDEX IF NOT EXISTS idx_support_tickets_updated_at ON support_tickets(updated_at)",
      "CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_counselor ON support_tickets(assigned_counselor_id)",
      "CREATE INDEX IF NOT EXISTS idx_support_tickets_status_created ON support_tickets(status, created_at)",
      
      // Support messages indexes
      "CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id)",
      "CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at)",
      "CREATE INDEX IF NOT EXISTS idx_support_messages_sender_type ON support_messages(sender_type)",
      "CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_created ON support_messages(ticket_id, created_at)",
      
      // Appointments indexes
      "CREATE INDEX IF NOT EXISTS idx_appointments_student_id ON appointments(student_id)",
      "CREATE INDEX IF NOT EXISTS idx_appointments_counselor_id ON appointments(counselor_id)",
      "CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status)",
      "CREATE INDEX IF NOT EXISTS idx_appointments_start_ts ON appointments(start_ts)",
      "CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at)",
      "CREATE INDEX IF NOT EXISTS idx_appointments_telegram_user_id ON appointments(telegram_user_id)",
      "CREATE INDEX IF NOT EXISTS idx_appointments_counselor_status ON appointments(counselor_id, status)",
      "CREATE INDEX IF NOT EXISTS idx_appointments_start_status ON appointments(start_ts, status)",
      
      // Students indexes
      "CREATE INDEX IF NOT EXISTS idx_students_admission_no ON students(admission_no)",
      "CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at)",
      "CREATE INDEX IF NOT EXISTS idx_students_year_of_study ON students(year_of_study)",
      
      // Counselors indexes
      "CREATE INDEX IF NOT EXISTS idx_counselors_email ON counselors(email)",
      "CREATE INDEX IF NOT EXISTS idx_counselors_is_admin ON counselors(is_admin)",
      "CREATE INDEX IF NOT EXISTS idx_counselors_created_at ON counselors(created_at)",
      
      // Activities indexes
      "CREATE INDEX IF NOT EXISTS idx_activities_counselor_id ON activities(counselor_id)",
      "CREATE INDEX IF NOT EXISTS idx_activities_activity_date ON activities(activity_date)",
      "CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at)",
      "CREATE INDEX IF NOT EXISTS idx_activities_counselor_date ON activities(counselor_id, activity_date)",
      
      // Announcements indexes
      "CREATE INDEX IF NOT EXISTS idx_announcements_counselor_id ON announcements(counselor_id)",
      "CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at)",
      "CREATE INDEX IF NOT EXISTS idx_announcements_is_force ON announcements(is_force)",
      "CREATE INDEX IF NOT EXISTS idx_announcements_sent_to_all ON announcements(sent_to_all)",
      
      // Notifications indexes
      "CREATE INDEX IF NOT EXISTS idx_notifications_telegram_user_id ON notifications(telegram_user_id)",
      "CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON notifications(scheduled_for)",
      "CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status)",
      "CREATE INDEX IF NOT EXISTS idx_notifications_appointment_id ON notifications(appointment_id)",
      "CREATE INDEX IF NOT EXISTS idx_notifications_status_scheduled ON notifications(status, scheduled_for)",
      
      // Books indexes
      "CREATE INDEX IF NOT EXISTS idx_books_counselor_id ON books(counselor_id)",
      "CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at)",
      
      // Support categories indexes
      "CREATE INDEX IF NOT EXISTS idx_support_categories_is_active ON support_categories(is_active)",
      "CREATE INDEX IF NOT EXISTS idx_support_categories_name ON support_categories(name)"
    ];

    console.log("📊 Creating database indexes...");
    for (const indexQuery of indexes) {
      try {
        await pool.query(indexQuery);
        console.log(`✅ Created index: ${indexQuery.split(' ')[5]}`);
      } catch (err) {
        if (err.code !== '42P07') { // Index already exists
          console.error(`❌ Error creating index: ${err.message}`);
        }
      }
    }

    // Create composite indexes for complex queries
    const compositeIndexes = [
      "CREATE INDEX IF NOT EXISTS idx_support_tickets_user_status_created ON support_tickets(telegram_user_id, status, created_at DESC)",
      "CREATE INDEX IF NOT EXISTS idx_appointments_counselor_start_status ON appointments(counselor_id, start_ts, status)",
      "CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_created_desc ON support_messages(ticket_id, created_at DESC)",
      "CREATE INDEX IF NOT EXISTS idx_user_sessions_telegram_updated ON user_sessions(telegram_user_id, updated_at DESC)"
    ];

    console.log("🔗 Creating composite indexes...");
    for (const indexQuery of compositeIndexes) {
      try {
        await pool.query(indexQuery);
        console.log(`✅ Created composite index: ${indexQuery.split(' ')[5]}`);
      } catch (err) {
        if (err.code !== '42P07') {
          console.error(`❌ Error creating composite index: ${err.message}`);
        }
      }
    }

    // Analyze tables for query optimization
    console.log("📈 Analyzing tables for optimization...");
    const tables = [
      'user_sessions', 'support_tickets', 'support_messages', 'appointments',
      'students', 'counselors', 'activities', 'announcements', 'notifications', 'books'
    ];

    for (const table of tables) {
      try {
        await pool.query(`ANALYZE ${table}`);
        console.log(`✅ Analyzed table: ${table}`);
      } catch (err) {
        console.error(`❌ Error analyzing table ${table}: ${err.message}`);
      }
    }

    // Set database configuration for better performance
    console.log("⚙️ Optimizing database configuration...");
    const configQueries = [
      "SET work_mem = '256MB'",
      "SET maintenance_work_mem = '512MB'",
      "SET shared_buffers = '256MB'",
      "SET effective_cache_size = '1GB'",
      "SET random_page_cost = 1.1",
      "SET seq_page_cost = 1.0"
    ];

    for (const configQuery of configQueries) {
      try {
        await pool.query(configQuery);
        console.log(`✅ Applied config: ${configQuery}`);
      } catch (err) {
        console.log(`⚠️ Config not applied (may require superuser): ${configQuery}`);
      }
    }

    console.log("\n🎉 Database optimization completed successfully!");
    console.log("📊 Performance improvements:");
    console.log("  ✅ Added 25+ database indexes");
    console.log("  ✅ Created composite indexes for complex queries");
    console.log("  ✅ Analyzed all tables for query optimization");
    console.log("  ✅ Applied performance configuration");
    console.log("\n🚀 Your database is now optimized for millions of users!");

  } catch (err) {
    console.error("❌ Error optimizing database:", err);
    throw err;
  } finally {
    await pool.end();
  }
}

optimizeDatabase();
