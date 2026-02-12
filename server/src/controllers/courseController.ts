import { Request, Response } from 'express';
import { Course } from '../models/Course.js';

export const courseController = {

    // ==================== PUBLIC: Browse Courses ====================

    // Get all published courses (public)
    getAllPublishedCourses: async (req: Request, res: Response) => {
        try {
            const { category, search } = req.query;

            let query: any = { isPublished: true };

            if (category && category !== 'all') {
                query.category = category;
            }

            let courses = await Course.find(query)
                .select('-enrolledStudents')
                .sort({ startDate: -1 });

            // Search filter
            if (search) {
                const searchStr = (search as string).toLowerCase();
                courses = courses.filter(c =>
                    c.title.toLowerCase().includes(searchStr) ||
                    c.instructor.toLowerCase().includes(searchStr) ||
                    c.description.toLowerCase().includes(searchStr)
                );
            }

            // Add enrollment count
            const coursesWithCount = await Promise.all(
                courses.map(async (course) => {
                    const enrolledCount = await Course.findById(course._id).select('enrolledStudents');
                    return {
                        ...course.toObject(),
                        enrolledCount: enrolledCount?.enrolledStudents?.length || 0,
                    };
                })
            );

            res.json({
                success: true,
                courses: coursesWithCount,
                total: coursesWithCount.length,
            });
        } catch (error) {
            console.error('Get published courses error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch courses' });
        }
    },

    // Get single course by ID (public)
    getCourseById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const course = await Course.findById(id).populate('createdBy', 'name email');

            if (!course) {
                return res.status(404).json({ success: false, error: 'Course not found' });
            }

            // Check if the requesting user is enrolled
            const userEmail = req.user?.email?.toLowerCase();
            const isEnrolled = userEmail ? course.enrolledStudents.includes(userEmail) : false;

            res.json({
                success: true,
                course: {
                    ...course.toObject(),
                    enrolledCount: course.enrolledStudents.length,
                    enrolledStudents: undefined, // hide the list
                    isEnrolled,
                },
            });
        } catch (error) {
            console.error('Get course error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch course' });
        }
    },

    // ==================== STUDENT: Enrollment ====================

    // Enroll in a course
    enrollInCourse: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userEmail = req.user?.email?.toLowerCase();

            if (!userEmail) {
                return res.status(401).json({ success: false, error: 'Not authenticated' });
            }

            const course = await Course.findById(id);
            if (!course) {
                return res.status(404).json({ success: false, error: 'Course not found' });
            }

            if (!course.isPublished) {
                return res.status(400).json({ success: false, error: 'Course is not available for enrollment' });
            }

            if (course.enrolledStudents.includes(userEmail)) {
                return res.status(409).json({ success: false, error: 'Already enrolled in this course' });
            }

            if (course.enrolledStudents.length >= course.maxStudents) {
                return res.status(400).json({ success: false, error: 'Course is full' });
            }

            course.enrolledStudents.push(userEmail);
            await course.save();

            console.log(`✅ ${userEmail} enrolled in ${course.title}`);

            res.json({
                success: true,
                message: 'Successfully enrolled!',
                enrolledCount: course.enrolledStudents.length,
            });
        } catch (error) {
            console.error('Enroll error:', error);
            res.status(500).json({ success: false, error: 'Failed to enroll' });
        }
    },

    // Unenroll from a course
    unenrollFromCourse: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userEmail = req.user?.email?.toLowerCase();

            if (!userEmail) {
                return res.status(401).json({ success: false, error: 'Not authenticated' });
            }

            const course = await Course.findById(id);
            if (!course) {
                return res.status(404).json({ success: false, error: 'Course not found' });
            }

            const idx = course.enrolledStudents.indexOf(userEmail);
            if (idx === -1) {
                return res.status(400).json({ success: false, error: 'Not enrolled in this course' });
            }

            course.enrolledStudents.splice(idx, 1);
            await course.save();

            res.json({
                success: true,
                message: 'Successfully unenrolled',
                enrolledCount: course.enrolledStudents.length,
            });
        } catch (error) {
            console.error('Unenroll error:', error);
            res.status(500).json({ success: false, error: 'Failed to unenroll' });
        }
    },

    // Get my enrolled courses
    getMyEnrollments: async (req: Request, res: Response) => {
        try {
            const userEmail = req.user?.email?.toLowerCase();

            if (!userEmail) {
                return res.status(401).json({ success: false, error: 'Not authenticated' });
            }

            const courses = await Course.find({
                enrolledStudents: userEmail,
                isPublished: true,
            }).sort({ startDate: -1 });

            const formatted = courses.map(c => ({
                _id: c._id,
                title: c.title,
                instructor: c.instructor,
                category: c.category,
                thumbnail: c.thumbnail,
                schedule: c.schedule,
                startDate: c.startDate,
                endDate: c.endDate,
                enrolledCount: c.enrolledStudents.length,
            }));

            res.json({
                success: true,
                courses: formatted,
                total: formatted.length,
            });
        } catch (error) {
            console.error('Get my enrollments error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch enrollments' });
        }
    },

    // ==================== ADMIN: Course Management ====================

    // Create course (admin)
    createCourse: async (req: Request, res: Response) => {
        try {
            const { title, description, instructor, category, thumbnail, schedule, startDate, endDate, maxStudents } = req.body;

            if (!title || !description || !instructor || !startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    error: 'Title, description, instructor, start date, and end date are required'
                });
            }

            const course = new Course({
                title,
                description,
                instructor,
                category: category || 'other',
                thumbnail,
                schedule: schedule || [],
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                maxStudents: maxStudents || 50,
                createdBy: req.user?.id,
            });

            await course.save();

            console.log(`📚 New course created: ${title}`);

            res.status(201).json({
                success: true,
                message: 'Course created successfully',
                course,
            });
        } catch (error) {
            console.error('Create course error:', error);
            res.status(500).json({ success: false, error: 'Failed to create course' });
        }
    },

    // Get all courses (admin - includes unpublished)
    getAllCourses: async (req: Request, res: Response) => {
        try {
            const courses = await Course.find()
                .populate('createdBy', 'name email')
                .sort({ createdAt: -1 });

            const coursesWithCount = courses.map(c => ({
                ...c.toObject(),
                enrolledCount: c.enrolledStudents.length,
            }));

            res.json({
                success: true,
                courses: coursesWithCount,
                total: coursesWithCount.length,
            });
        } catch (error) {
            console.error('Get all courses error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch courses' });
        }
    },

    // Update course (admin)
    updateCourse: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            delete updates.createdBy;
            delete updates.enrolledStudents;

            const course = await Course.findByIdAndUpdate(
                id,
                { $set: updates },
                { new: true, runValidators: true }
            );

            if (!course) {
                return res.status(404).json({ success: false, error: 'Course not found' });
            }

            res.json({
                success: true,
                message: 'Course updated successfully',
                course,
            });
        } catch (error) {
            console.error('Update course error:', error);
            res.status(500).json({ success: false, error: 'Failed to update course' });
        }
    },

    // Delete course (admin)
    deleteCourse: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const course = await Course.findByIdAndDelete(id);

            if (!course) {
                return res.status(404).json({ success: false, error: 'Course not found' });
            }

            res.json({
                success: true,
                message: 'Course deleted successfully',
            });
        } catch (error) {
            console.error('Delete course error:', error);
            res.status(500).json({ success: false, error: 'Failed to delete course' });
        }
    },

    // Toggle publish status (admin)
    togglePublish: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const course = await Course.findById(id);

            if (!course) {
                return res.status(404).json({ success: false, error: 'Course not found' });
            }

            course.isPublished = !course.isPublished;
            await course.save();

            res.json({
                success: true,
                message: `Course ${course.isPublished ? 'published' : 'unpublished'}`,
                isPublished: course.isPublished,
            });
        } catch (error) {
            console.error('Toggle publish error:', error);
            res.status(500).json({ success: false, error: 'Failed to toggle publish status' });
        }
    },
};
