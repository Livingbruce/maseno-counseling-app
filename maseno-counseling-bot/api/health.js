// Simple health check endpoint
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: "OK",
    message: "Maseno Counseling Bot API is running!",
    timestamp: new Date().toISOString(),
    service: "Maseno Counseling Bot",
    version: "1.0.0"
  });
};
