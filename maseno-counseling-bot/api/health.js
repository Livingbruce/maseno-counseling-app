// Individual health endpoint
module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Maseno Counseling Bot API is running!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};
