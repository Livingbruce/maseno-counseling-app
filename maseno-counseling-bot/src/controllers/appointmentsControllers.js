import pool from "../db/pool.js";

export async function getAllAppointments(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM appointments ORDER BY start_ts DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
}

export async function createAppointment(req, res) {
  try {
    const { student_id, counselor_id, start_ts, end_ts } = req.body;

    const result = await pool.query(
      `INSERT INTO appointments (student_id, counselor_id, start_ts, end_ts) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [student_id, counselor_id, start_ts, end_ts]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating appointment:", err);
    res.status(500).json({ error: "Failed to create appointment" });
  }
}

export async function getAppointmentsByCounselor(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM appointments WHERE counselor_id=$1 ORDER BY start_ts",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
}

export async function updateAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      "UPDATE appointments SET status=$1 WHERE id=$2 RETURNING *",
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update appointment status" });
  }
}

export async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM appointments WHERE id=$1", [id]);
    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
}