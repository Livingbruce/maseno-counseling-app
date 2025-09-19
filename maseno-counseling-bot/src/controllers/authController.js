import pool from '../db/pool.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_EXPIRES_IN = '7d';

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM counselors WHERE email = $1 LIMIT 1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const counselor = result.rows[0];
    const match = await bcrypt.compare(password, counselor.password_hash);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { counselorId: counselor.id, email: counselor.email },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ 
      token, 
      counselor: { 
        id: counselor.id, 
        name: counselor.name, 
        email: counselor.email, 
        phone: counselor.phone,
        specialization: counselor.specialization,
        bio: counselor.bio,
        office_location: counselor.office_location,
        office_hours: counselor.office_hours,
        is_admin: counselor.is_admin 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const me = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, specialization, bio, office_location, office_hours, is_admin, created_at, updated_at FROM counselors WHERE id = $1",
      [req.user.counselorId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export async function registerHandler(req, res) {
  const { name, email, password, specialization } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'name,email,password required' });

  const hashed = await bcrypt.hash(password, 10);
  try {
    const ins = await pool.query(
      `INSERT INTO counselors (name, email, password_hash, specialization) VALUES ($1, $2, $3, $4) RETURNING id, name, email`,
      [name, email, hashed, specialization || null]
    );
    const user = ins.rows[0];
    return res.status(201).json({ counselor: user });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const counselorId = req.user.counselorId;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  try {
    // Get current password hash
    const result = await pool.query(
      "SELECT password_hash FROM counselors WHERE id = $1",
      [counselorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Counselor not found' });
    }

    const counselor = result.rows[0];
    
    // Verify current password
    const match = await bcrypt.compare(currentPassword, counselor.password_hash);
    if (!match) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      "UPDATE counselors SET password_hash = $1 WHERE id = $2",
      [hashedNewPassword, counselorId]
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  const { name, email, phone, specialization, bio, office_location, office_hours } = req.body;
  const counselorId = req.user.counselorId;

  console.log('Profile update request:', { name, email, phone, specialization, bio, office_location, office_hours, counselorId });

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    // Check if email is already taken by another counselor
    const emailCheck = await pool.query(
      "SELECT id FROM counselors WHERE email = $1 AND id != $2",
      [email, counselorId]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already taken by another counselor' });
    }

    // Update profile
    const result = await pool.query(
      `UPDATE counselors 
       SET name = $1, email = $2, phone = $3, specialization = $4, 
           bio = $5, office_location = $6, office_hours = $7
       WHERE id = $8
       RETURNING id, name, email, phone, specialization, bio, office_location, office_hours`,
      [name, email, phone || null, specialization || null, bio || null, 
       office_location || null, office_hours || null, counselorId]
    );

    console.log('Profile update result:', result.rows[0]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Counselor not found' });
    }

    res.json({ success: true, counselor: result.rows[0] });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};