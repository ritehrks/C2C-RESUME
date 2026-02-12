import express from 'express';
import { courseController } from '../controllers/courseController.js';
import { userAuth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Browse published courses (no auth needed)
router.get('/public', courseController.getAllPublishedCourses);

// Get single course (optionally with auth to check enrollment)
router.get('/public/:id', courseController.getCourseById);

// ==================== STUDENT ROUTES (Requires auth) ====================

// Get my enrolled courses
router.get('/my-enrollments', userAuth, courseController.getMyEnrollments);

// Enroll in a course
router.post('/:id/enroll', userAuth, courseController.enrollInCourse);

// Unenroll from a course
router.delete('/:id/enroll', userAuth, courseController.unenrollFromCourse);

// ==================== ADMIN ROUTES (Requires auth + admin) ====================

// Get all courses (including unpublished)
router.get('/', userAuth, adminAuth, courseController.getAllCourses);

// Create course
router.post('/', userAuth, adminAuth, courseController.createCourse);

// Update course
router.put('/:id', userAuth, adminAuth, courseController.updateCourse);

// Delete course
router.delete('/:id', userAuth, adminAuth, courseController.deleteCourse);

// Toggle publish status
router.patch('/:id/toggle', userAuth, adminAuth, courseController.togglePublish);

export default router;
