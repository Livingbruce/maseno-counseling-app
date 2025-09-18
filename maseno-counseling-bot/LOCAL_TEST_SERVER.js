// Local Test Server - Complete Authentication Solution
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/maseno_counseling',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Maseno Counseling Bot - Local Test</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status { background: #e8f5e8; color: #2d5a2d; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .btn { background: #667eea; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px; text-decoration: none; display: inline-block; }
        .btn:hover { background: #5a6fd8; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎓 Maseno Counseling Bot - Local Test</h1>
        <div class="status">
          ✅ <strong>Local Server Running</strong><br>
          Authentication system is ready for testing!
        </div>
        <div>
          <a href="/api" class="btn">🔧 API Status</a>
          <a href="/api/test" class="btn">🧪 Test Endpoint</a>
          <button onclick="testLogin()" class="btn">🔑 Test Login</button>
        </div>
        <div style="margin-top: 30px;">
          <h3>🔑 Test Credentials</h3>
          <p><strong>Email:</strong> admin@maseno.ac.ke</p>
          <p><strong>Password:</strong> 123456</p>
        </div>
        <div style="margin-top: 20px; font-size: 14px; color: #666;">
          <p>Server: http://localhost:${PORT}</p>
          <p>API: http://localhost:${PORT}/api</p>
        </div>
      </div>
      
      <script>
        async function testLogin() {
          try {
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: 'admin@maseno.ac.ke',
                password: '123456'
              })
            });
            
            const data = await response.json();
            
            if (response.ok) {
              alert('🎉 LOGIN SUCCESS!\\nUser: ' + data.user.name + '\\nEmail: ' + data.user.email);
            } else {
              alert('❌ LOGIN FAILED: ' + data.error);
            }
          } catch (error) {
            alert('❌ ERROR: ' + error.message);
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/api', (req, res) => {
  res.json({
    message: "Maseno Counseling Bot API - LOCAL TEST",
    status: "ONLINE",
    version: "4.5.0",
    timestamp: new Date().toISOString(),
    authentication: "READY",
    database: process.env.DATABASE_URL ? "CONNECTED" : "NOT_CONFIGURED",
    jwt: process.env.JWT_SECRET ? "CONFIGURED" : "NOT_CONFIGURED"
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString(),
    version: '4.5.0'
  });
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

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

// Start server
app.listen(PORT, () => {
  console.log('🎯 LOCAL TEST SERVER STARTED');
  console.log('=' .repeat(50));
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`🔑 Login: POST http://localhost:${PORT}/api/login`);
  console.log('');
  console.log('🔑 TEST CREDENTIALS:');
  console.log('📧 Email: admin@maseno.ac.ke');
  console.log('🔑 Password: 123456');
  console.log('');
  console.log('✅ Authentication system is ready for testing!');
  console.log('=' .repeat(50));
});
