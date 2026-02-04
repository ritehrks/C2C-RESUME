// Auth Routes
// Google OAuth and authentication routes

import { Router } from 'express';
import { authController } from '../controllers/index.js';

const router = Router();

// Google OAuth routes
router.post('/google', authController.googleAuthCallback);  // New: Token-based auth (recommended)
router.get('/google', authController.googleAuth);           // Legacy: Redirect-based auth
router.get('/callback', authController.googleCallback);     // Legacy: OAuth callback

// User routes
router.get('/me', authController.getMe);
router.put('/profile', authController.updateProfile);
router.post('/logout', authController.logout);

// Admin-only routes (password login)
router.post('/login', authController.login);
router.post('/register', authController.register);

export default router;
