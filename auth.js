import express from 'express';
import { authLimiter } from '../middleware/security.js';
import { login, register, getProfile, updateProfile } from '../controllers/authController.js';

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

// Auth routes
router.post('/login', login);
router.post('/register', register);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
