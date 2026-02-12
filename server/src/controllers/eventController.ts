import { Request, Response } from 'express';
import crypto from 'crypto';
import { Event, IEvent } from '../models/Event.js';
import { EventAttendance } from '../models/EventAttendance.js';

// Generate unique QR token
const generateQRToken = (): string => {
    return crypto.randomBytes(16).toString('hex');
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

// Parse student ID to extract info
const parseStudentId = (studentId: string): { year?: number; branch?: string; roll?: string } => {
    const match = studentId.match(/^(\d{4})([A-Z]{2,3})(\d+)$/i);
    if (match) {
        const admissionYear = parseInt(match[1]);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const academicYear = currentMonth >= 6 ? currentYear : currentYear - 1;
        const year = academicYear - admissionYear + 1;

        return {
            year: Math.min(Math.max(year, 1), 5),
            branch: match[2].toUpperCase(),
            roll: match[3]
        };
    }
    return {};
};

export const eventController = {

    // ==================== ADMIN: EVENT MANAGEMENT ====================

    // Create a new event
    createEvent: async (req: Request, res: Response) => {
        try {
            const {
                title, description, category, venue, date, startTime, endTime,
                maxParticipants, requiresGPS, venueLatitude, venueLongitude, gpsRadius,
                instructor, thumbnail, link, schedule, startDate, endDate, maxStudents,
                isPublished
            } = req.body;

            if (!title) {
                return res.status(400).json({
                    success: false,
                    error: 'Title is required'
                });
            }

            const qrToken = generateQRToken();

            const event = new Event({
                title,
                description,
                category: category || 'other',
                type: category || 'other',
                venue,
                date: date ? new Date(date) : undefined,
                startTime,
                endTime,
                maxParticipants,
                qrToken,
                requiresGPS: requiresGPS || false,
                venueLatitude,
                venueLongitude,
                gpsRadius: gpsRadius || 100,
                instructor,
                thumbnail,
                link,
                schedule: schedule || [],
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                maxStudents: maxStudents || 50,
                isPublished: isPublished !== undefined ? isPublished : true,
                createdBy: req.user?.id
            });

            await event.save();

            console.log(`🎉 New event created: ${title}`);

            res.status(201).json({
                success: true,
                message: 'Event created successfully',
                event: {
                    ...event.toObject(),
                    attendanceUrl: `/attend/${qrToken}`
                }
            });
        } catch (error: any) {
            console.error('Create event error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create event'
            });
        }
    },

    // Get all events (admin)
    getAllEvents: async (req: Request, res: Response) => {
        try {
            const { status, type } = req.query;

            let query: any = {};

            if (status === 'active') {
                query.isActive = true;
            } else if (status === 'inactive') {
                query.isActive = false;
            }

            if (type && type !== 'all') {
                query.category = type;
            }

            const events = await Event.find(query)
                .sort({ createdAt: -1 })
                .populate('createdBy', 'name email');

            // Get attendance + enrollment counts
            const eventsWithCounts = await Promise.all(
                events.map(async (event) => {
                    const attendanceCount = await EventAttendance.countDocuments({ eventId: event._id });
                    return {
                        ...event.toObject(),
                        attendanceCount,
                        enrolledCount: event.enrolledStudents?.length || 0,
                        attendanceUrl: `/attend/${event.qrToken}`
                    };
                })
            );

            res.json({
                success: true,
                events: eventsWithCounts,
                total: eventsWithCounts.length
            });
        } catch (error: any) {
            console.error('Get events error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch events'
            });
        }
    },

    // Get single event by ID (admin)
    getEventById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const event = await Event.findById(id).populate('createdBy', 'name email');

            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: 'Event not found'
                });
            }

            const attendanceCount = await EventAttendance.countDocuments({ eventId: event._id });

            res.json({
                success: true,
                event: {
                    ...event.toObject(),
                    attendanceCount,
                    enrolledCount: event.enrolledStudents?.length || 0,
                    attendanceUrl: `/attend/${event.qrToken}`
                }
            });
        } catch (error: any) {
            console.error('Get event error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch event'
            });
        }
    },

    // Update event
    updateEvent: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Don't allow updating protected fields
            delete updates.qrToken;
            delete updates.createdBy;
            delete updates.enrolledStudents;

            // Sync type with category
            if (updates.category) {
                updates.type = updates.category;
            }

            const event = await Event.findByIdAndUpdate(
                id,
                { $set: updates },
                { new: true, runValidators: true }
            );

            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: 'Event not found'
                });
            }

            res.json({
                success: true,
                message: 'Event updated successfully',
                event: event
            });
        } catch (error: any) {
            console.error('Update event error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update event'
            });
        }
    },

    // Delete event
    deleteEvent: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const event = await Event.findByIdAndDelete(id);

            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: 'Event not found'
                });
            }

            // Also delete all attendance records
            await EventAttendance.deleteMany({ eventId: id });

            res.json({
                success: true,
                message: 'Event and all attendance records deleted'
            });
        } catch (error: any) {
            console.error('Delete event error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete event'
            });
        }
    },

    // Toggle event active status
    toggleEventStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const event = await Event.findById(id);

            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: 'Event not found'
                });
            }

            event.isActive = !event.isActive;
            await event.save();

            res.json({
                success: true,
                message: `Event ${event.isActive ? 'activated' : 'deactivated'}`,
                isActive: event.isActive
            });
        } catch (error: any) {
            console.error('Toggle event status error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to toggle event status'
            });
        }
    },

    // Toggle publish status
    togglePublish: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const event = await Event.findById(id);

            if (!event) {
                return res.status(404).json({ success: false, error: 'Event not found' });
            }

            event.isPublished = !event.isPublished;
            await event.save();

            res.json({
                success: true,
                message: `Event ${event.isPublished ? 'published' : 'unpublished'}`,
                isPublished: event.isPublished,
            });
        } catch (error) {
            console.error('Toggle publish error:', error);
            res.status(500).json({ success: false, error: 'Failed to toggle publish status' });
        }
    },

    // Regenerate QR token
    regenerateQRToken: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const event = await Event.findById(id);

            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: 'Event not found'
                });
            }

            event.qrToken = generateQRToken();
            await event.save();

            res.json({
                success: true,
                message: 'QR token regenerated',
                qrToken: event.qrToken,
                attendanceUrl: `/attend/${event.qrToken}`
            });
        } catch (error: any) {
            console.error('Regenerate QR error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to regenerate QR token'
            });
        }
    },

    // ==================== ATTENDANCE MANAGEMENT ====================

    // Get attendance list for an event (admin)
    getEventAttendance: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { sort = 'markedAt', order = 'desc' } = req.query;

            const event = await Event.findById(id);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: 'Event not found'
                });
            }

            const sortOrder = order === 'asc' ? 1 : -1;
            const attendance = await EventAttendance.find({ eventId: id })
                .sort({ [sort as string]: sortOrder });

            res.json({
                success: true,
                event: {
                    _id: event._id,
                    title: event.title,
                    date: event.date,
                    venue: event.venue
                },
                attendance,
                total: attendance.length
            });
        } catch (error: any) {
            console.error('Get attendance error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch attendance'
            });
        }
    },

    // Export attendance to CSV
    exportAttendanceCSV: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const event = await Event.findById(id);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: 'Event not found'
                });
            }

            const attendance = await EventAttendance.find({ eventId: id })
                .sort({ markedAt: 1 });

            const headers = ['S.No', 'Name', 'Student ID', 'Branch', 'Year', 'Email', 'Phone', 'Status', 'Marked At'];
            const rows = attendance.map((a, index) => [
                index + 1,
                a.name,
                a.studentId,
                a.branch,
                a.year || '-',
                a.email,
                a.phone || '-',
                a.status.toUpperCase(),
                new Date(a.markedAt).toLocaleString('en-IN')
            ]);

            const csv = [
                `Event: ${event.title}`,
                `Date: ${event.date ? new Date(event.date).toLocaleDateString('en-IN') : 'N/A'}`,
                `Venue: ${event.venue || 'N/A'}`,
                `Total Attendees: ${attendance.length}`,
                '',
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${event.title.replace(/[^a-z0-9]/gi, '_')}_attendance.csv"`);
            res.send(csv);
        } catch (error: any) {
            console.error('Export CSV error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to export attendance'
            });
        }
    },

    // Delete attendance record
    deleteAttendanceRecord: async (req: Request, res: Response) => {
        try {
            const { id, attendanceId } = req.params;

            const result = await EventAttendance.findOneAndDelete({
                _id: attendanceId,
                eventId: id
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: 'Attendance record not found'
                });
            }

            res.json({
                success: true,
                message: 'Attendance record deleted'
            });
        } catch (error: any) {
            console.error('Delete attendance error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete attendance record'
            });
        }
    },

    // ==================== PUBLIC: MARK ATTENDANCE ====================

    // Get event info by QR token (public)
    getEventByToken: async (req: Request, res: Response) => {
        try {
            const { token } = req.params;

            const event = await Event.findOne({ qrToken: token });

            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: 'Invalid QR code or event not found'
                });
            }

            if (!event.isActive) {
                return res.status(400).json({
                    success: false,
                    error: 'This event is no longer active'
                });
            }

            res.json({
                success: true,
                event: {
                    _id: event._id,
                    title: event.title,
                    description: event.description,
                    type: event.category,
                    venue: event.venue,
                    date: event.date,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    requiresGPS: event.requiresGPS,
                    isActive: event.isActive
                }
            });
        } catch (error: any) {
            console.error('Get event by token error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch event'
            });
        }
    },

    // Mark attendance (public)
    markAttendance: async (req: Request, res: Response) => {
        try {
            const { token } = req.params;
            const { name, email, studentId, branch, phone, latitude, longitude, locationAccuracy } = req.body;

            if (!name || !email || !studentId || !branch) {
                return res.status(400).json({
                    success: false,
                    error: 'Name, email, student ID, and branch are required'
                });
            }

            const emailLower = email.toLowerCase();
            if (!emailLower.endsWith('@mnit.ac.in')) {
                return res.status(403).json({
                    success: false,
                    error: 'Only MNIT email addresses (@mnit.ac.in) are allowed'
                });
            }

            const event = await Event.findOne({ qrToken: token });

            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: 'Invalid QR code or event not found'
                });
            }

            if (!event.isActive) {
                return res.status(400).json({
                    success: false,
                    error: 'This event is no longer accepting attendance'
                });
            }

            // Check if already marked
            const existingAttendance = await EventAttendance.findOne({
                eventId: event._id,
                $or: [
                    { email: emailLower },
                    { studentId: studentId.toUpperCase() }
                ]
            });

            if (existingAttendance) {
                return res.status(409).json({
                    success: false,
                    error: 'You have already marked attendance for this event',
                    markedAt: existingAttendance.markedAt
                });
            }

            // GPS validation if required
            let distanceFromVenue: number | undefined;
            let status: 'present' | 'late' | 'invalid_location' = 'present';

            if (event.requiresGPS) {
                if (!latitude || !longitude) {
                    return res.status(400).json({
                        success: false,
                        error: 'Location is required for this event. Please enable GPS.'
                    });
                }

                if (event.venueLatitude && event.venueLongitude) {
                    distanceFromVenue = calculateDistance(
                        latitude,
                        longitude,
                        event.venueLatitude,
                        event.venueLongitude
                    );

                    const effectiveRadius = event.gpsRadius + (locationAccuracy || 0) * 1.5;

                    if (distanceFromVenue > effectiveRadius) {
                        status = 'invalid_location';
                        return res.status(400).json({
                            success: false,
                            error: `You are too far from the venue. Distance: ${Math.round(distanceFromVenue)}m (max: ${Math.round(effectiveRadius)}m)`
                        });
                    }
                }
            }

            // Check if late
            const now = new Date();
            if (event.date && event.startTime) {
                const eventDate = new Date(event.date);
                const [startHour, startMin] = event.startTime.split(':').map(Number);
                const startDateTime = new Date(eventDate);
                startDateTime.setHours(startHour, startMin, 0);

                const lateThreshold = new Date(startDateTime.getTime() + 15 * 60 * 1000);
                if (now > lateThreshold) {
                    status = 'late';
                }
            }

            const parsedInfo = parseStudentId(studentId);

            const attendance = new EventAttendance({
                eventId: event._id,
                name: name.trim(),
                email: emailLower,
                studentId: studentId.toUpperCase().trim(),
                branch: branch.toUpperCase().trim(),
                year: parsedInfo.year,
                phone: phone?.trim(),
                latitude,
                longitude,
                locationAccuracy,
                distanceFromVenue,
                status,
                deviceInfo: req.headers['user-agent'],
                ipAddress: req.ip || req.connection.remoteAddress
            });

            await attendance.save();

            console.log(`✅ Attendance marked: ${name} for ${event.title}`);

            res.status(201).json({
                success: true,
                message: status === 'late' ? 'Attendance marked (Late)' : 'Attendance marked successfully!',
                attendance: {
                    name: attendance.name,
                    studentId: attendance.studentId,
                    status: attendance.status,
                    markedAt: attendance.markedAt,
                    eventTitle: event.title
                }
            });
        } catch (error: any) {
            console.error('Mark attendance error:', error);

            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    error: 'You have already marked attendance for this event'
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to mark attendance'
            });
        }
    },

    // Check if user already marked attendance (public)
    checkAttendance: async (req: Request, res: Response) => {
        try {
            const { token } = req.params;
            const { email, studentId } = req.query;

            if (!email && !studentId) {
                return res.status(400).json({
                    success: false,
                    error: 'Email or student ID required'
                });
            }

            const event = await Event.findOne({ qrToken: token });
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: 'Event not found'
                });
            }

            const query: any = { eventId: event._id };
            if (email) query.email = (email as string).toLowerCase();
            if (studentId) query.studentId = (studentId as string).toUpperCase();

            const attendance = await EventAttendance.findOne(query);

            res.json({
                success: true,
                alreadyMarked: !!attendance,
                attendance: attendance ? {
                    name: attendance.name,
                    markedAt: attendance.markedAt,
                    status: attendance.status
                } : null
            });
        } catch (error: any) {
            console.error('Check attendance error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to check attendance'
            });
        }
    },

    // ==================== STUDENT: My Attendance History ====================

    async getMyAttendance(req: Request, res: Response) {
        try {
            const userEmail = req.user?.email;

            if (!userEmail) {
                return res.status(401).json({ success: false, error: 'Not authenticated' });
            }

            const records = await EventAttendance.find({ email: userEmail.toLowerCase() })
                .populate({
                    path: 'eventId',
                    select: 'title category venue date startTime endTime isActive description',
                })
                .sort({ markedAt: -1 });

            const attendance = records
                .filter(record => record.eventId)
                .map(record => {
                    const event = record.eventId as any;
                    return {
                        _id: record._id,
                        eventTitle: event.title,
                        eventType: event.category,
                        eventDescription: event.description,
                        venue: event.venue,
                        eventDate: event.date,
                        startTime: event.startTime,
                        endTime: event.endTime,
                        status: record.status,
                        markedAt: record.markedAt,
                        distanceFromVenue: record.distanceFromVenue,
                    };
                });

            const stats = {
                total: attendance.length,
                present: attendance.filter(a => a.status === 'present').length,
                late: attendance.filter(a => a.status === 'late').length,
                locationIssue: attendance.filter(a => a.status === 'invalid_location').length,
            };

            return res.json({
                success: true,
                attendance,
                stats,
            });
        } catch (error) {
            console.error('Get my attendance error:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch attendance history' });
        }
    },

    // ==================== PUBLIC: Browse Events (Student) ====================

    // Get all published events (public)
    getAllPublishedEvents: async (req: Request, res: Response) => {
        try {
            const { category, search } = req.query;

            let query: any = { isPublished: true };

            if (category && category !== 'all') {
                query.category = category;
            }

            let events = await Event.find(query)
                .select('-enrolledStudents')
                .sort({ startDate: -1, createdAt: -1 });

            // Search filter
            if (search) {
                const searchStr = (search as string).toLowerCase();
                events = events.filter(e =>
                    e.title.toLowerCase().includes(searchStr) ||
                    (e.instructor && e.instructor.toLowerCase().includes(searchStr)) ||
                    (e.description && e.description.toLowerCase().includes(searchStr))
                );
            }

            // Add enrollment count
            const eventsWithCount = await Promise.all(
                events.map(async (event) => {
                    const fullEvent = await Event.findById(event._id).select('enrolledStudents');
                    return {
                        ...event.toObject(),
                        enrolledCount: fullEvent?.enrolledStudents?.length || 0,
                    };
                })
            );

            res.json({
                success: true,
                events: eventsWithCount,
                total: eventsWithCount.length,
            });
        } catch (error) {
            console.error('Get published events error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch events' });
        }
    },

    // Get single event by ID (public)
    getPublicEventById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const event = await Event.findById(id).populate('createdBy', 'name email');

            if (!event) {
                return res.status(404).json({ success: false, error: 'Event not found' });
            }

            const userEmail = req.user?.email?.toLowerCase();
            const isEnrolled = userEmail ? event.enrolledStudents.includes(userEmail) : false;

            res.json({
                success: true,
                event: {
                    ...event.toObject(),
                    enrolledCount: event.enrolledStudents.length,
                    isEnrolled,
                },
            });
        } catch (error) {
            console.error('Get event error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch event' });
        }
    },

    // ==================== STUDENT: Enrollment ====================

    enrollInEvent: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userEmail = req.user?.email?.toLowerCase();

            if (!userEmail) {
                return res.status(401).json({ success: false, error: 'Not authenticated' });
            }

            const event = await Event.findById(id);
            if (!event) {
                return res.status(404).json({ success: false, error: 'Event not found' });
            }

            if (!event.isPublished) {
                return res.status(400).json({ success: false, error: 'Event is not available for enrollment' });
            }

            if (event.enrolledStudents.includes(userEmail)) {
                return res.status(409).json({ success: false, error: 'Already enrolled in this event' });
            }

            if (event.enrolledStudents.length >= event.maxStudents) {
                return res.status(400).json({ success: false, error: 'Event is full' });
            }

            event.enrolledStudents.push(userEmail);
            await event.save();

            console.log(`✅ ${userEmail} enrolled in ${event.title}`);

            res.json({
                success: true,
                message: 'Successfully enrolled!',
                enrolledCount: event.enrolledStudents.length,
            });
        } catch (error) {
            console.error('Enroll error:', error);
            res.status(500).json({ success: false, error: 'Failed to enroll' });
        }
    },

    unenrollFromEvent: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userEmail = req.user?.email?.toLowerCase();

            if (!userEmail) {
                return res.status(401).json({ success: false, error: 'Not authenticated' });
            }

            const event = await Event.findById(id);
            if (!event) {
                return res.status(404).json({ success: false, error: 'Event not found' });
            }

            const idx = event.enrolledStudents.indexOf(userEmail);
            if (idx === -1) {
                return res.status(400).json({ success: false, error: 'Not enrolled in this event' });
            }

            event.enrolledStudents.splice(idx, 1);
            await event.save();

            res.json({
                success: true,
                message: 'Successfully unenrolled',
                enrolledCount: event.enrolledStudents.length,
            });
        } catch (error) {
            console.error('Unenroll error:', error);
            res.status(500).json({ success: false, error: 'Failed to unenroll' });
        }
    },

    getMyEnrollments: async (req: Request, res: Response) => {
        try {
            const userEmail = req.user?.email?.toLowerCase();

            if (!userEmail) {
                return res.status(401).json({ success: false, error: 'Not authenticated' });
            }

            const events = await Event.find({
                enrolledStudents: userEmail,
                isPublished: true,
            }).sort({ startDate: -1 });

            const formatted = events.map(e => ({
                _id: e._id,
                title: e.title,
                instructor: e.instructor,
                category: e.category,
                thumbnail: e.thumbnail,
                schedule: e.schedule,
                startDate: e.startDate,
                endDate: e.endDate,
                enrolledCount: e.enrolledStudents.length,
            }));

            res.json({
                success: true,
                events: formatted,
                total: formatted.length,
            });
        } catch (error) {
            console.error('Get my enrollments error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch enrollments' });
        }
    },
};
