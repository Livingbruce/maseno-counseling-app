// Test local API
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
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
      process.env.JWT_SECRET || 'fallback-secret',
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Local API running on port ${PORT}`);
  console.log('🧪 Testing login endpoint...');
  
  // Test the login endpoint
  const testData = {
    email: 'admin@maseno.ac.ke',
    password: '123456'
  };
  
  const https = require('https');
  const postData = JSON.stringify(testData);
  
  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📊 Test Response:');
      try {
        const jsonData = JSON.parse(data);
        console.log(JSON.stringify(jsonData, null, 2));
        
        if (res.statusCode === 200) {
          console.log('\n✅ LOCAL API LOGIN SUCCESS!');
          console.log('🎯 The login endpoint is working correctly locally!');
        } else {
          console.log('\n❌ LOCAL API LOGIN FAILED!');
        }
      } catch (e) {
        console.log('❌ Invalid JSON response:');
        console.log(data);
      }
      
      process.exit(0);
    });
  });
  
  req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
    process.exit(1);
  });
  
  req.write(postData);
  req.end();
});
