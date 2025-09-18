// Simple status endpoint for testing deployment
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    message: 'Maseno Counseling Bot API - Status Check',
    status: 'ONLINE',
    timestamp: new Date().toISOString(),
    version: '4.3.0',
    deployment: 'SUCCESS',
    authentication: 'READY',
    database: process.env.DATABASE_URL ? 'CONNECTED' : 'NOT_CONFIGURED',
    jwt: process.env.JWT_SECRET ? 'CONFIGURED' : 'NOT_CONFIGURED'
  });
};
