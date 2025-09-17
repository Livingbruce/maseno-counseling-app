// Express app for Vercel
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Maseno Counseling Bot API is running!',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'test works',
    data: {
      service: 'Maseno Counseling Bot',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// Hello route
app.get('/api/hello', (req, res) => {
  res.json({ 
    message: 'Hello from Vercel!',
    timestamp: new Date().toISOString()
  });
});

// Main API route
app.get('/api/', (req, res) => {
  res.json({
    message: "Maseno Counseling Bot API",
    status: "OK",
    availableEndpoints: [
      "/api/health",
      "/api/test",
      "/api/hello"
    ],
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel
module.exports = app;
