import express from 'express';
import { dashboardLimiter } from '../middleware/security.js';
import { 
  getDashboardStats, 
  getAppointments, 
  getAnnouncements, 
  getActivities,
  getBooks 
} from '../controllers/dashboardController.js';

const router = express.Router();

// Apply rate limiting to dashboard routes
router.use(dashboardLimiter);

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/appointments', getAppointments);
router.get('/announcements', getAnnouncements);
router.get('/activities', getActivities);
router.get('/books', getBooks);

export default router;
