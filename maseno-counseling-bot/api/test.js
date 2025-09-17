// Individual test endpoint
export default function handler(req, res) {
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
}
