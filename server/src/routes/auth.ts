// Auth Routes
import { Router } from 'express';
import { authController } from '../controllers/index.js';

const router = Router();

router.get('/google', authController.googleAuth);
router.get('/callback', authController.googleCallback);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.put('/profile', authController.updateProfile);

export default router;
