const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Parse request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { email, password } = JSON.parse(body);

        // Check environment variables
        if (!process.env.DATABASE_URL) {
          res.status(500).json({
            error: 'Database configuration missing',
            details: 'DATABASE_URL not set'
          });
          return;
        }

        if (!process.env.JWT_SECRET) {
          res.status(500).json({
            error: 'JWT configuration missing',
            details: 'JWT_SECRET not set'
          });
          return;
        }

        // Get user from database
        const userResult = await pool.query(
          'SELECT id, name, email, password_hash, is_admin FROM counselors WHERE email = $1',
          [email]
        );

        if (userResult.rows.length === 0) {
          res.status(401).json({ error: 'Invalid credentials' });
          return;
        }

        const user = userResult.rows[0];

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
          res.status(401).json({ error: 'Invalid credentials' });
          return;
        }

        // Generate JWT token
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            is_admin: user.is_admin
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(200).json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            is_admin: user.is_admin
          }
        });

      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
          error: 'Internal server error',
          details: error.message
        });
      }
    });

  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};
