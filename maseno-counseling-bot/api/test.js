// Test endpoint serverless function
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.status(200).json({
    message: "API is working!",
    data: {
      service: "Maseno Counseling Bot",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString()
    }
  });
}
