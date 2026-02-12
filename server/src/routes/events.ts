import express from 'express';
import { eventController } from '../controllers/eventController.js';
import { userAuth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES (No auth required) ====================

// Browse published events
router.get('/public', eventController.getAllPublishedEvents);

// QR attendance: Get event info by QR token (MUST be before /public/:id)
router.get('/public/token/:token', eventController.getEventByToken);

// QR attendance: Mark attendance
router.post('/public/token/:token/mark', eventController.markAttendance);

// QR attendance: Check if already marked
router.get('/public/token/:token/check', eventController.checkAttendance);

// Get single event (public, optionally with auth to check enrollment)
router.get('/public/:id', eventController.getPublicEventById);

// ==================== STUDENT ROUTES (Requires auth only) ====================

// Get my attendance history
router.get('/my-attendance', userAuth, eventController.getMyAttendance);

// Get my enrolled events
router.get('/my-enrollments', userAuth, eventController.getMyEnrollments);

// Enroll in an event
router.post('/:id/enroll', userAuth, eventController.enrollInEvent);

// Unenroll from an event
router.delete('/:id/enroll', userAuth, eventController.unenrollFromEvent);

// ==================== ADMIN ROUTES (Requires auth + admin role) ====================

// Get all events
router.get('/', userAuth, adminAuth, eventController.getAllEvents);

// Create new event
router.post('/', userAuth, adminAuth, eventController.createEvent);

// Get single event
router.get('/:id', userAuth, adminAuth, eventController.getEventById);

// Update event
router.put('/:id', userAuth, adminAuth, eventController.updateEvent);

// Delete event
router.delete('/:id', userAuth, adminAuth, eventController.deleteEvent);

// Toggle event active status
router.patch('/:id/toggle', userAuth, adminAuth, eventController.toggleEventStatus);

// Toggle publish status
router.patch('/:id/publish', userAuth, adminAuth, eventController.togglePublish);

// Regenerate QR token
router.post('/:id/regenerate-qr', userAuth, adminAuth, eventController.regenerateQRToken);

// Get attendance for an event
router.get('/:id/attendance', userAuth, adminAuth, eventController.getEventAttendance);

// Export attendance as CSV
router.get('/:id/attendance/export', userAuth, adminAuth, eventController.exportAttendanceCSV);

// Delete attendance record
router.delete('/:id/attendance/:attendanceId', userAuth, adminAuth, eventController.deleteAttendanceRecord);

export default router;
