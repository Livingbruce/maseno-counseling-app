// Express app wrapped with serverless-http for Vercel
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health route (with and without /api prefix)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Maseno Counseling Bot API is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Maseno Counseling Bot API is running!',
    timestamp: new Date().toISOString()
  });
});

// Test route (with and without /api prefix)
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

app.get('/test', (req, res) => {
  res.json({ 
    message: 'test works',
    data: {
      service: 'Maseno Counseling Bot',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// Hello route (with and without /api prefix)
app.get('/api/hello', (req, res) => {
  res.json({ 
    message: 'Hello from Vercel!',
    timestamp: new Date().toISOString()
  });
});

app.get('/hello', (req, res) => {
  res.json({ 
    message: 'Hello from Vercel!',
    timestamp: new Date().toISOString()
  });
});

// Main API route (with and without /api prefix)
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

app.get('/', (req, res) => {
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

// Wrap Express app with serverless-http for Vercel
module.exports = serverless(app);
