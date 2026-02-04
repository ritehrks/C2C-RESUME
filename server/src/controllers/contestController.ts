import { Request, Response } from 'express';
import crypto from 'crypto';
import { Contest, IContest } from '../models/Contest.js';
import { ContestAttendance } from '../models/ContestAttendance.js';

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
    // Format: 2022UCP1234
    const match = studentId.match(/^(\d{4})([A-Z]{2,3})(\d+)$/i);
    if (match) {
        const admissionYear = parseInt(match[1]);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        // Academic year starts in July
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

export const contestController = {
    // ==================== ADMIN: CONTEST MANAGEMENT ====================

    // Create a new contest
    createContest: async (req: Request, res: Response) => {
        try {
            const { title, description, type, venue, date, startTime, endTime, maxParticipants, requiresGPS, venueLatitude, venueLongitude, gpsRadius } = req.body;

            if (!title || !venue || !date || !startTime || !endTime) {
                return res.status(400).json({
                    success: false,
                    error: 'Title, venue, date, start time and end time are required'
                });
            }

            const qrToken = generateQRToken();

            const contest = new Contest({
                title,
                description,
                type: type || 'other',
                venue,
                date: new Date(date),
                startTime,
                endTime,
                maxParticipants,
                qrToken,
                requiresGPS: requiresGPS || false,
                venueLatitude,
                venueLongitude,
                gpsRadius: gpsRadius || 100,
                createdBy: req.user?.id
            });

            await contest.save();

            console.log(`🎉 New contest created: ${title}`);

            res.status(201).json({
                success: true,
                message: 'Contest created successfully',
                contest: {
                    ...contest.toObject(),
                    attendanceUrl: `/attend/${qrToken}`
                }
            });
        } catch (error: any) {
            console.error('Create contest error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create contest'
            });
        }
    },

    // Get all contests (admin)
    getAllContests: async (req: Request, res: Response) => {
        try {
            const { status, type } = req.query;

            let query: any = {};

            if (status === 'active') {
                query.isActive = true;
            } else if (status === 'inactive') {
                query.isActive = false;
            }

            if (type && type !== 'all') {
                query.type = type;
            }

            const contests = await Contest.find(query)
                .sort({ date: -1 })
                .populate('createdBy', 'name email');

            // Get attendance count for each contest
            const contestsWithCounts = await Promise.all(
                contests.map(async (contest) => {
                    const attendanceCount = await ContestAttendance.countDocuments({ contestId: contest._id });
                    return {
                        ...contest.toObject(),
                        attendanceCount,
                        attendanceUrl: `/attend/${contest.qrToken}`
                    };
                })
            );

            res.json({
                success: true,
                contests: contestsWithCounts,
                total: contestsWithCounts.length
            });
        } catch (error: any) {
            console.error('Get contests error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch contests'
            });
        }
    },

    // Get single contest by ID (admin)
    getContestById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const contest = await Contest.findById(id).populate('createdBy', 'name email');

            if (!contest) {
                return res.status(404).json({
                    success: false,
                    error: 'Contest not found'
                });
            }

            const attendanceCount = await ContestAttendance.countDocuments({ contestId: contest._id });

            res.json({
                success: true,
                contest: {
                    ...contest.toObject(),
                    attendanceCount,
                    attendanceUrl: `/attend/${contest.qrToken}`
                }
            });
        } catch (error: any) {
            console.error('Get contest error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch contest'
            });
        }
    },

    // Update contest
    updateContest: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Don't allow updating qrToken
            delete updates.qrToken;
            delete updates.createdBy;

            const contest = await Contest.findByIdAndUpdate(
                id,
                { $set: updates },
                { new: true, runValidators: true }
            );

            if (!contest) {
                return res.status(404).json({
                    success: false,
                    error: 'Contest not found'
                });
            }

            res.json({
                success: true,
                message: 'Contest updated successfully',
                contest
            });
        } catch (error: any) {
            console.error('Update contest error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update contest'
            });
        }
    },

    // Delete contest
    deleteContest: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const contest = await Contest.findByIdAndDelete(id);

            if (!contest) {
                return res.status(404).json({
                    success: false,
                    error: 'Contest not found'
                });
            }

            // Also delete all attendance records for this contest
            await ContestAttendance.deleteMany({ contestId: id });

            res.json({
                success: true,
                message: 'Contest and all attendance records deleted'
            });
        } catch (error: any) {
            console.error('Delete contest error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete contest'
            });
        }
    },

    // Toggle contest active status
    toggleContestStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const contest = await Contest.findById(id);

            if (!contest) {
                return res.status(404).json({
                    success: false,
                    error: 'Contest not found'
                });
            }

            contest.isActive = !contest.isActive;
            await contest.save();

            res.json({
                success: true,
                message: `Contest ${contest.isActive ? 'activated' : 'deactivated'}`,
                isActive: contest.isActive
            });
        } catch (error: any) {
            console.error('Toggle contest status error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to toggle contest status'
            });
        }
    },

    // Regenerate QR token
    regenerateQRToken: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const contest = await Contest.findById(id);

            if (!contest) {
                return res.status(404).json({
                    success: false,
                    error: 'Contest not found'
                });
            }

            contest.qrToken = generateQRToken();
            await contest.save();

            res.json({
                success: true,
                message: 'QR token regenerated',
                qrToken: contest.qrToken,
                attendanceUrl: `/attend/${contest.qrToken}`
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

    // Get attendance list for a contest (admin)
    getContestAttendance: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { sort = 'markedAt', order = 'desc' } = req.query;

            const contest = await Contest.findById(id);
            if (!contest) {
                return res.status(404).json({
                    success: false,
                    error: 'Contest not found'
                });
            }

            const sortOrder = order === 'asc' ? 1 : -1;
            const attendance = await ContestAttendance.find({ contestId: id })
                .sort({ [sort as string]: sortOrder });

            res.json({
                success: true,
                contest: {
                    _id: contest._id,
                    title: contest.title,
                    date: contest.date,
                    venue: contest.venue
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

            const contest = await Contest.findById(id);
            if (!contest) {
                return res.status(404).json({
                    success: false,
                    error: 'Contest not found'
                });
            }

            const attendance = await ContestAttendance.find({ contestId: id })
                .sort({ markedAt: 1 });

            // Generate CSV
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
                `Contest: ${contest.title}`,
                `Date: ${new Date(contest.date).toLocaleDateString('en-IN')}`,
                `Venue: ${contest.venue}`,
                `Total Attendees: ${attendance.length}`,
                '',
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${contest.title.replace(/[^a-z0-9]/gi, '_')}_attendance.csv"`);
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

            const result = await ContestAttendance.findOneAndDelete({
                _id: attendanceId,
                contestId: id
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

    // Get contest info by QR token (public)
    getContestByToken: async (req: Request, res: Response) => {
        try {
            const { token } = req.params;

            const contest = await Contest.findOne({ qrToken: token });

            if (!contest) {
                return res.status(404).json({
                    success: false,
                    error: 'Invalid QR code or contest not found'
                });
            }

            if (!contest.isActive) {
                return res.status(400).json({
                    success: false,
                    error: 'This contest is no longer active'
                });
            }

            // Return public info only
            res.json({
                success: true,
                contest: {
                    _id: contest._id,
                    title: contest.title,
                    description: contest.description,
                    type: contest.type,
                    venue: contest.venue,
                    date: contest.date,
                    startTime: contest.startTime,
                    endTime: contest.endTime,
                    requiresGPS: contest.requiresGPS,
                    isActive: contest.isActive
                }
            });
        } catch (error: any) {
            console.error('Get contest by token error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch contest'
            });
        }
    },

    // Mark attendance (public)
    markAttendance: async (req: Request, res: Response) => {
        try {
            const { token } = req.params;
            const { name, email, studentId, branch, phone, latitude, longitude, locationAccuracy } = req.body;

            // Validate required fields
            if (!name || !email || !studentId || !branch) {
                return res.status(400).json({
                    success: false,
                    error: 'Name, email, student ID, and branch are required'
                });
            }

            // Validate MNIT email
            const emailLower = email.toLowerCase();
            if (!emailLower.endsWith('@mnit.ac.in')) {
                return res.status(403).json({
                    success: false,
                    error: 'Only MNIT email addresses (@mnit.ac.in) are allowed'
                });
            }

            // Find contest
            const contest = await Contest.findOne({ qrToken: token });

            if (!contest) {
                return res.status(404).json({
                    success: false,
                    error: 'Invalid QR code or contest not found'
                });
            }

            if (!contest.isActive) {
                return res.status(400).json({
                    success: false,
                    error: 'This contest is no longer accepting attendance'
                });
            }

            // Check if already marked
            const existingAttendance = await ContestAttendance.findOne({
                contestId: contest._id,
                $or: [
                    { email: emailLower },
                    { studentId: studentId.toUpperCase() }
                ]
            });

            if (existingAttendance) {
                return res.status(409).json({
                    success: false,
                    error: 'You have already marked attendance for this contest',
                    markedAt: existingAttendance.markedAt
                });
            }

            // GPS validation if required
            let distanceFromVenue: number | undefined;
            let status: 'present' | 'late' | 'invalid_location' = 'present';

            if (contest.requiresGPS) {
                if (!latitude || !longitude) {
                    return res.status(400).json({
                        success: false,
                        error: 'Location is required for this contest. Please enable GPS.'
                    });
                }

                if (contest.venueLatitude && contest.venueLongitude) {
                    distanceFromVenue = calculateDistance(
                        latitude,
                        longitude,
                        contest.venueLatitude,
                        contest.venueLongitude
                    );

                    // Apply adaptive radius based on accuracy
                    const effectiveRadius = contest.gpsRadius + (locationAccuracy || 0) * 1.5;

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
            const contestDate = new Date(contest.date);
            const [startHour, startMin] = contest.startTime.split(':').map(Number);
            const startDateTime = new Date(contestDate);
            startDateTime.setHours(startHour, startMin, 0);

            // 15 minutes late threshold
            const lateThreshold = new Date(startDateTime.getTime() + 15 * 60 * 1000);
            if (now > lateThreshold) {
                status = 'late';
            }

            // Parse student ID for additional info
            const parsedInfo = parseStudentId(studentId);

            // Create attendance record
            const attendance = new ContestAttendance({
                contestId: contest._id,
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

            console.log(`✅ Attendance marked: ${name} for ${contest.title}`);

            res.status(201).json({
                success: true,
                message: status === 'late' ? 'Attendance marked (Late)' : 'Attendance marked successfully!',
                attendance: {
                    name: attendance.name,
                    studentId: attendance.studentId,
                    status: attendance.status,
                    markedAt: attendance.markedAt,
                    contestTitle: contest.title
                }
            });
        } catch (error: any) {
            console.error('Mark attendance error:', error);

            // Handle duplicate key error
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    error: 'You have already marked attendance for this contest'
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

            const contest = await Contest.findOne({ qrToken: token });
            if (!contest) {
                return res.status(404).json({
                    success: false,
                    error: 'Contest not found'
                });
            }

            const query: any = { contestId: contest._id };
            if (email) query.email = (email as string).toLowerCase();
            if (studentId) query.studentId = (studentId as string).toUpperCase();

            const attendance = await ContestAttendance.findOne(query);

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
    }
};
