// Simple test endpoint
module.exports = (req, res) => {
  res.json({
    message: "Hello from Vercel!",
    timestamp: new Date().toISOString(),
    path: req.url
  });
};
