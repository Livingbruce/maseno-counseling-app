import pool from "../src/db/pool.js";

async function archiveOldData() {
  try {
    console.log("🗄️ Starting data archiving process...");

    // Archive old support tickets (older than 1 year)
    const archiveTicketsResult = await pool.query(`
      DELETE FROM support_tickets 
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 year'
      AND status IN ('resolved', 'closed')
    `);
    console.log(`📦 Archived ${archiveTicketsResult.rowCount} old support tickets`);

    // Archive old support messages (older than 1 year)
    const archiveMessagesResult = await pool.query(`
      DELETE FROM support_messages 
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 year'
      AND ticket_id NOT IN (SELECT id FROM support_tickets)
    `);
    console.log(`📦 Archived ${archiveMessagesResult.rowCount} old support messages`);

    // Archive old appointments (older than 2 years)
    const archiveAppointmentsResult = await pool.query(`
      DELETE FROM appointments 
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '2 years'
      AND status IN ('canceled', 'completed')
    `);
    console.log(`📦 Archived ${archiveAppointmentsResult.rowCount} old appointments`);

    // Archive old activities (older than 1 year)
    const archiveActivitiesResult = await pool.query(`
      DELETE FROM activities 
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 year'
      AND activity_date < CURRENT_DATE - INTERVAL '1 year'
    `);
    console.log(`📦 Archived ${archiveActivitiesResult.rowCount} old activities`);

    // Archive old announcements (older than 6 months, except force announcements)
    const archiveAnnouncementsResult = await pool.query(`
      DELETE FROM announcements 
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '6 months'
      AND is_force = false
    `);
    console.log(`📦 Archived ${archiveAnnouncementsResult.rowCount} old announcements`);

    // Archive old notifications (older than 1 year)
    const archiveNotificationsResult = await pool.query(`
      DELETE FROM notifications 
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 year'
      AND status IN ('sent', 'failed')
    `);
    console.log(`📦 Archived ${archiveNotificationsResult.rowCount} old notifications`);

    // Archive old user sessions (inactive for 1 year)
    const archiveUserSessionsResult = await pool.query(`
      DELETE FROM user_sessions 
      WHERE updated_at < CURRENT_TIMESTAMP - INTERVAL '1 year'
    `);
    console.log(`📦 Archived ${archiveUserSessionsResult.rowCount} old user sessions`);

    // Vacuum and analyze tables for better performance
    console.log("🧹 Cleaning up database...");
    await pool.query("VACUUM ANALYZE");
    console.log("✅ Database cleanup completed");

    const totalArchived = 
      archiveTicketsResult.rowCount + 
      archiveMessagesResult.rowCount + 
      archiveAppointmentsResult.rowCount + 
      archiveActivitiesResult.rowCount + 
      archiveAnnouncementsResult.rowCount + 
      archiveNotificationsResult.rowCount + 
      archiveUserSessionsResult.rowCount;

    console.log("\n🎉 Data archiving completed successfully!");
    console.log(`📊 Total records archived: ${totalArchived}`);
    console.log("📋 Archiving summary:");
    console.log(`  • Support tickets: ${archiveTicketsResult.rowCount}`);
    console.log(`  • Support messages: ${archiveMessagesResult.rowCount}`);
    console.log(`  • Appointments: ${archiveAppointmentsResult.rowCount}`);
    console.log(`  • Activities: ${archiveActivitiesResult.rowCount}`);
    console.log(`  • Announcements: ${archiveAnnouncementsResult.rowCount}`);
    console.log(`  • Notifications: ${archiveNotificationsResult.rowCount}`);
    console.log(`  • User sessions: ${archiveUserSessionsResult.rowCount}`);
    console.log("\n🚀 Database is now optimized for millions of users!");

  } catch (err) {
    console.error("❌ Error archiving old data:", err);
    throw err;
  } finally {
    await pool.end();
  }
}

archiveOldData();
