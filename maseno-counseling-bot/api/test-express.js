// Simple Express app test
const express = require('express');
const serverless = require('serverless-http');

const app = express();

app.get('/api/test-express', (req, res) => {
  res.json({
    message: 'Express app is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
});

module.exports = serverless(app);
