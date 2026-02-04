import express from 'express';
import { contestController } from '../controllers/contestController.js';
import { userAuth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES (No auth required) ====================
// These are for students scanning QR codes

// Get contest info by QR token
router.get('/public/:token', contestController.getContestByToken);

// Mark attendance (public - just needs MNIT email validation)
router.post('/public/:token/mark', contestController.markAttendance);

// Check if already marked attendance
router.get('/public/:token/check', contestController.checkAttendance);


// ==================== ADMIN ROUTES (Requires auth + admin role) ====================

// Get all contests
router.get('/', userAuth, adminAuth, contestController.getAllContests);

// Create new contest
router.post('/', userAuth, adminAuth, contestController.createContest);

// Get single contest
router.get('/:id', userAuth, adminAuth, contestController.getContestById);

// Update contest
router.put('/:id', userAuth, adminAuth, contestController.updateContest);

// Delete contest
router.delete('/:id', userAuth, adminAuth, contestController.deleteContest);

// Toggle contest active status
router.patch('/:id/toggle', userAuth, adminAuth, contestController.toggleContestStatus);

// Regenerate QR token
router.post('/:id/regenerate-qr', userAuth, adminAuth, contestController.regenerateQRToken);

// Get attendance for a contest
router.get('/:id/attendance', userAuth, adminAuth, contestController.getContestAttendance);

// Export attendance as CSV
router.get('/:id/attendance/export', userAuth, adminAuth, contestController.exportAttendanceCSV);

// Delete attendance record
router.delete('/:id/attendance/:attendanceId', userAuth, adminAuth, contestController.deleteAttendanceRecord);

export default router;
