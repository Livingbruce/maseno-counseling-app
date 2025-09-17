import pool from '../db/pool.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get basic statistics
    const stats = {
      totalAppointments: 0,
      totalStudents: 0,
      totalAnnouncements: 0,
      totalActivities: 0,
      recentAppointments: [],
      upcomingActivities: []
    };

    // Get appointment count
    const appointmentResult = await pool.query('SELECT COUNT(*) FROM appointments');
    stats.totalAppointments = parseInt(appointmentResult.rows[0].count);

    // Get student count
    const studentResult = await pool.query('SELECT COUNT(*) FROM students');
    stats.totalStudents = parseInt(studentResult.rows[0].count);

    // Get announcement count
    const announcementResult = await pool.query('SELECT COUNT(*) FROM announcements');
    stats.totalAnnouncements = parseInt(announcementResult.rows[0].count);

    // Get activity count
    const activityResult = await pool.query('SELECT COUNT(*) FROM activities');
    stats.totalActivities = parseInt(activityResult.rows[0].count);

    res.json({ stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, s.name as student_name, c.name as counselor_name
      FROM appointments a
      LEFT JOIN students s ON a.student_id = s.id
      LEFT JOIN counselors c ON a.counselor_id = c.id
      ORDER BY a.start_ts DESC
      LIMIT 50
    `);

    res.json({ appointments: result.rows });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, c.name as counselor_name
      FROM announcements a
      LEFT JOIN counselors c ON a.counselor_id = c.id
      ORDER BY a.created_at DESC
      LIMIT 20
    `);

    res.json({ announcements: result.rows });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getActivities = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, c.name as counselor_name
      FROM activities a
      LEFT JOIN counselors c ON a.counselor_id = c.id
      ORDER BY a.activity_date DESC
      LIMIT 20
    `);

    res.json({ activities: result.rows });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBooks = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM books
      ORDER BY created_at DESC
      LIMIT 20
    `);

    res.json({ books: result.rows });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
