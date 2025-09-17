// Individual health endpoint
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'Maseno Counseling Bot API is running!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}
