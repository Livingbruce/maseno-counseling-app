// Vercel serverless function handler with authentication
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Parse request body for POST requests
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        req.body = JSON.parse(body);
        await handleRequest(req, res);
      } catch (error) {
        res.status(400).json({ error: 'Invalid JSON' });
      }
    });
    return;
  }

  await handleRequest(req, res);
};

async function handleRequest(req, res) {

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  
  // Route handling
  switch (pathname) {
    case '/api/health':
    case '/health':
      res.status(200).json({
        status: 'ok',
        message: 'Maseno Counseling Bot API is running!',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
      });
      break;
      
    case '/api/test':
    case '/test':
      // Handle login via test endpoint
      if (req.method === 'POST' && req.body && req.body.email && req.body.password) {
        try {
          const { email, password } = req.body;
          
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
          return;
        } catch (error) {
          console.error('Login error:', error);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
      }
      
      res.status(200).json({
        message: 'test works',
        data: {
          service: 'Maseno Counseling Bot',
          version: '1.0.0',
          timestamp: new Date().toISOString()
        },
        method: req.method,
        url: req.url
      });
      break;
      
    case '/api/hello':
    case '/hello':
      res.status(200).json({
        message: 'Hello from Vercel!',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
      });
      break;
      
    case '/api/test-auth':
      res.status(200).json({
        message: 'Auth test endpoint working!',
        timestamp: new Date().toISOString(),
        authEndpoints: ['/api/auth/login', '/api/auth/me']
      });
      break;
      
    case '/api/auth/login':
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      
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
      break;
      
    case '/api/auth/me':
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          res.status(401).json({ error: 'No token provided' });
          return;
        }
        
        const token = authHeader.substring(7);
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        
        res.status(200).json({
          id: decoded.id,
          email: decoded.email,
          is_admin: decoded.is_admin
        });
        
      } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Invalid token' });
      }
      break;
      
    case '/api/':
    case '/':
      res.status(200).json({
        message: "Maseno Counseling Bot API",
        status: "OK",
        availableEndpoints: [
          "/api/health",
          "/api/test",
          "/api/hello",
          "/api/auth/login",
          "/api/auth/me"
        ],
        version: "2.0.0",
        lastUpdated: "2025-09-18T10:40:00Z",
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
      });
      break;
      
    default:
      res.status(404).json({
        error: 'Route not found',
        path: pathname,
        method: req.method,
        url: req.url
      });
  }
}