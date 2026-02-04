// Stats Routes - Admin Dashboard API
import { Router } from 'express';
import { statsController } from '../controllers/index.js';

const router = Router();

// All routes require admin authentication (verified in controller)
router.get('/overview', statsController.getOverview);
router.get('/resumes', statsController.getResumeStats);
router.get('/analysis', statsController.getAnalysisStats);
router.get('/activity', statsController.getRecentActivity);
router.get('/users', statsController.getUserList);

export default router;
