const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/', (req, res) => {
  res.json({
    message: "Maseno Counseling Bot API",
    status: "ONLINE",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Demo authentication
    if (email === 'admin@maseno.ac.ke' && password === '123456') {
      const mockUser = {
        id: 1,
        name: 'Admin User',
        email: 'admin@maseno.ac.ke',
        is_admin: true
      };

      const token = jwt.sign(
        { id: mockUser.id, email: mockUser.email },
        'maseno-counseling-super-secret-jwt-key-2025',
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
      const decoded = jwt.verify(token, 'maseno-counseling-super-secret-jwt-key-2025');
      
      // Demo user data
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

app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});
