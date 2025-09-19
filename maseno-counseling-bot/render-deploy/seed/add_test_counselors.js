import pool from "../src/db/pool.js";
import bcrypt from "bcrypt";

async function addTestCounselors() {
  try {
    console.log("🔐 Adding test counselors...");

    // Test counselors with proper password hashes
    const testCounselors = [
      {
        name: "Admin Counselor",
        email: "admin@maseno.ac.ke",
        password: "admin123",
        is_admin: true
      },
      {
        name: "Dr. Jane Smith",
        email: "jane.smith@maseno.ac.ke",
        password: "counselor123",
        is_admin: false
      },
      {
        name: "Dr. John Doe",
        email: "john.doe@maseno.ac.ke",
        password: "counselor123",
        is_admin: false
      },
      {
        name: "Dr. Mary Johnson",
        email: "mary.johnson@maseno.ac.ke",
        password: "counselor123",
        is_admin: false
      }
    ];

    for (const counselor of testCounselors) {
      // Hash the password
      const passwordHash = await bcrypt.hash(counselor.password, 10);
      
      // Insert or update counselor
      await pool.query(`
        INSERT INTO counselors (name, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          password_hash = EXCLUDED.password_hash,
          is_admin = EXCLUDED.is_admin
      `, [counselor.name, counselor.email, passwordHash, counselor.is_admin]);
      
      console.log(`✅ Added/Updated: ${counselor.name} (${counselor.email}) - Password: ${counselor.password}`);
    }

    console.log("\n🎉 Test counselors added successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("Admin: admin@maseno.ac.ke / admin123");
    console.log("Counselor 1: jane.smith@maseno.ac.ke / counselor123");
    console.log("Counselor 2: john.doe@maseno.ac.ke / counselor123");
    console.log("Counselor 3: mary.johnson@maseno.ac.ke / counselor123");
    
  } catch (err) {
    console.error("❌ Error adding test counselors:", err);
    throw err;
  } finally {
    await pool.end();
  }
}

addTestCounselors();
