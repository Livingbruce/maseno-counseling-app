// Simple Vercel serverless function handler
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
      
    case '/api/':
    case '/':
      res.status(200).json({
        message: "Maseno Counseling Bot API",
        status: "OK",
        availableEndpoints: [
          "/api/health",
          "/api/test",
          "/api/hello"
        ],
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
