import rateLimit from 'express-rate-limit';

// Rate limiting configurations
export const createRateLimit = (windowMs, max, message) => 
  rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ 
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });

// General API rate limiting
export const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again later'
);

// Auth endpoints rate limiting (stricter)
export const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 login attempts per window
  'Too many authentication attempts, please try again later'
);

// Bot message rate limiting
export const botLimiter = createRateLimit(
  60 * 1000, // 1 minute
  10, // 10 messages per minute
  'Too many bot messages, please slow down'
);

// Dashboard API rate limiting
export const dashboardLimiter = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  50, // 50 requests per window
  'Too many dashboard requests, please try again later'
);
