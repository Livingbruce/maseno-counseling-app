// Simple test endpoint to verify Vercel serverless functions work
export default function handler(req, res) {
  res.status(200).json({
    message: 'Simple test endpoint working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}
