// Vercel API handler - Simple approach
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the path
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  
  // Route handling
  if (pathname === '/api/health') {
    res.status(200).json({
      status: "OK",
      message: "Maseno Counseling Bot API is running!",
      timestamp: new Date().toISOString()
    });
  } else if (pathname === '/api/test') {
    res.status(200).json({
      message: "API is working!",
      data: {
        service: "Maseno Counseling Bot",
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development"
      }
    });
  } else if (pathname.startsWith('/api/')) {
    res.status(404).json({
      error: "API endpoint not found",
      availableEndpoints: [
        "/api/health",
        "/api/test"
      ],
      path: pathname
    });
  } else {
    res.status(404).json({
      error: "Route not found",
      message: "This is the Maseno Counseling Bot API",
      availableEndpoints: [
        "/api/health",
        "/api/test"
      ]
    });
  }
};
