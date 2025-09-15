import pool from "./src/db/pool.js";

async function testPostpone() {
  try {
    console.log("🧪 Testing postpone functionality...");
    
    // First, let's see what appointments exist
    const appointments = await pool.query("SELECT * FROM appointments ORDER BY id");
    console.log("Current appointments:", appointments.rows);
    
    if (appointments.rows.length === 0) {
      console.log("❌ No appointments found to test with");
      return;
    }
    
    const appointmentId = appointments.rows[0].id;
    console.log(`\n📅 Testing with appointment ID: ${appointmentId}`);
    
    // Test the postpone query
    const newDate = "2025-10-15 14:00";
    const cleanDate = newDate.replace(/[()]/g, '').trim();
    const appointmentDate = new Date(cleanDate);
    const formattedDate = appointmentDate.toISOString();
    const endDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000).toISOString();
    
    console.log("New date details:", {
      original: newDate,
      cleaned: cleanDate,
      parsed: appointmentDate,
      formatted: formattedDate,
      endDate: endDate
    });
    
    // Update the appointment
    const result = await pool.query(
      "UPDATE appointments SET start_ts = $1, end_ts = $2, status = 'pending', updated_at = NOW() WHERE id = $3 RETURNING *",
      [formattedDate, endDate, appointmentId]
    );
    
    console.log("\n📊 Update result:");
    console.log("Rows affected:", result.rowCount);
    console.log("Updated appointment:", result.rows[0]);
    
    // Check the appointment again
    const updatedAppointment = await pool.query("SELECT * FROM appointments WHERE id = $1", [appointmentId]);
    console.log("\n✅ Final appointment data:", updatedAppointment.rows[0]);
    
  } catch (err) {
    console.error("❌ Test failed:", err);
  } finally {
    await pool.end();
  }
}

testPostpone();
