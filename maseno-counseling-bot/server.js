const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// API Routes
app.get('/api/', (req, res) => {
  res.json({
    message: "Maseno Counseling Bot API",
    status: "ONLINE",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    authentication: "READY",
    database: process.env.DATABASE_URL ? "CONNECTED" : "NOT_CONFIGURED",
    jwt: process.env.JWT_SECRET ? "CONFIGURED" : "NOT_CONFIGURED"
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check environment variables
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: 'Database configuration missing',
        details: 'DATABASE_URL not set'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        error: 'JWT configuration missing',
        details: 'JWT_SECRET not set'
      });
    }

    // For demo purposes, use mock authentication
    if (email === 'admin@maseno.ac.ke' && password === '123456') {
      const mockUser = {
        id: 1,
        name: 'Admin User',
        email: 'admin@maseno.ac.ke',
        is_admin: true
      };

      const token = jwt.sign(
        { id: mockUser.id, email: mockUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: mockUser
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get user profile endpoint
app.get('/api/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // For demo purposes, return mock user data
      const mockUser = {
        id: 1,
        name: 'Admin User',
        email: 'admin@maseno.ac.ke',
        is_admin: true
      };

      res.json({
        message: 'User profile retrieved',
        user: mockUser
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});
