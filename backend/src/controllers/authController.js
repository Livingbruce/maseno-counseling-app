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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const register = async (req, res) => {
  const { name, email, password, phone, specialization } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM counselors WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO counselors (name, email, password_hash, phone, specialization, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, name, email, phone, specialization`,
      [name, email, hashedPassword, phone || null, specialization || null]
    );

    const newCounselor = result.rows[0];

    res.status(201).json({
      message: 'User created successfully',
      counselor: newCounselor
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { counselorId } = req.user;

    const result = await pool.query(
      "SELECT id, name, email, phone, specialization, bio, office_location, office_hours, is_admin FROM counselors WHERE id = $1",
      [counselorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ counselor: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { counselorId } = req.user;
    const { name, phone, specialization, bio, office_location, office_hours } = req.body;

    const result = await pool.query(
      `UPDATE counselors 
       SET name = $1, phone = $2, specialization = $3, bio = $4, 
           office_location = $5, office_hours = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING id, name, email, phone, specialization, bio, office_location, office_hours`,
      [name, phone, specialization, bio, office_location, office_hours, counselorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      counselor: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
