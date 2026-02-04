// Stats Controller
// Aggregation queries for admin dashboard statistics

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { AnalysisReport } from '../models/AnalysisReport.js';

const JWT_SECRET = process.env.JWT_SECRET || 'c2c-resume-secret-key-change-in-production';

// Middleware to verify admin access
const verifyAdmin = async (req: Request): Promise<{ success: boolean; userId?: string; error?: string }> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { success: false, error: 'Authentication required' };
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = await User.findById(decoded.userId);

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        if (user.role !== 'admin') {
            return { success: false, error: 'Admin access required' };
        }

        return { success: true, userId: decoded.userId };
    } catch (error) {
        return { success: false, error: 'Invalid token' };
    }
};

export const statsController = {
    // GET /api/stats/overview - Get overall platform statistics
    getOverview: async (req: Request, res: Response) => {
        try {
            const adminCheck = await verifyAdmin(req);
            if (!adminCheck.success) {
                return res.status(401).json({ success: false, error: adminCheck.error });
            }

            const [totalUsers, totalResumes, totalAnalyses] = await Promise.all([
                User.countDocuments(),
                Resume.countDocuments(),
                AnalysisReport.countDocuments(),
            ]);

            // Users registered today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const usersToday = await User.countDocuments({ createdAt: { $gte: today } });

            // Resumes created this week
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const resumesThisWeek = await Resume.countDocuments({ createdAt: { $gte: weekAgo } });

            // Deep analyses used today
            const deepAnalysesToday = await AnalysisReport.countDocuments({
                analysisType: 'deep',
                createdAt: { $gte: today },
            });

            res.json({
                success: true,
                stats: {
                    totalUsers,
                    totalResumes,
                    totalAnalyses,
                    usersToday,
                    resumesThisWeek,
                    deepAnalysesToday,
                },
            });
        } catch (error: any) {
            console.error('❌ Stats overview error:', error);
            res.status(500).json({ success: false, error: 'Failed to get statistics' });
        }
    },

    // GET /api/stats/resumes - Resume breakdown by template
    getResumeStats: async (req: Request, res: Response) => {
        try {
            const adminCheck = await verifyAdmin(req);
            if (!adminCheck.success) {
                return res.status(401).json({ success: false, error: adminCheck.error });
            }

            // Aggregate by template type
            const templateStats = await Resume.aggregate([
                {
                    $group: {
                        _id: '$templateId',
                        count: { $sum: 1 },
                    },
                },
            ]);

            // Format the result
            const templateBreakdown = {
                mnit_resume: 0,
                generic_ats_resume: 0,
            };

            templateStats.forEach((item: { _id: string; count: number }) => {
                if (item._id === 'mnit_resume' || item._id === 'generic_ats_resume') {
                    templateBreakdown[item._id] = item.count;
                }
            });

            // Recent resumes
            const recentResumes = await Resume.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('userId', 'name email')
                .select('name templateId createdAt');

            res.json({
                success: true,
                stats: {
                    templateBreakdown,
                    recentResumes,
                },
            });
        } catch (error: any) {
            console.error('❌ Resume stats error:', error);
            res.status(500).json({ success: false, error: 'Failed to get resume statistics' });
        }
    },

    // GET /api/stats/analysis - Analysis and role targeting breakdown
    getAnalysisStats: async (req: Request, res: Response) => {
        try {
            const adminCheck = await verifyAdmin(req);
            if (!adminCheck.success) {
                return res.status(401).json({ success: false, error: adminCheck.error });
            }

            // Aggregate by role (target roles people are selecting)
            const roleStats = await AnalysisReport.aggregate([
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 },
                        avgScore: { $avg: '$results.overallScore' },
                    },
                },
                { $sort: { count: -1 } },
            ]);

            // Aggregate by analysis type
            const analysisTypeStats = await AnalysisReport.aggregate([
                {
                    $group: {
                        _id: '$analysisType',
                        count: { $sum: 1 },
                    },
                },
            ]);

            const analysisBreakdown = {
                simple: 0,
                deep: 0,
            };

            analysisTypeStats.forEach((item: { _id: string; count: number }) => {
                if (item._id === 'simple' || item._id === 'deep') {
                    analysisBreakdown[item._id] = item.count;
                }
            });

            // Token usage (deep analysis count)
            const totalTokensUsed = analysisBreakdown.deep;

            res.json({
                success: true,
                stats: {
                    roleBreakdown: roleStats,
                    analysisBreakdown,
                    totalTokensUsed,
                },
            });
        } catch (error: any) {
            console.error('❌ Analysis stats error:', error);
            res.status(500).json({ success: false, error: 'Failed to get analysis statistics' });
        }
    },

    // GET /api/stats/activity - Recent activity feed
    getRecentActivity: async (req: Request, res: Response) => {
        try {
            const adminCheck = await verifyAdmin(req);
            if (!adminCheck.success) {
                return res.status(401).json({ success: false, error: adminCheck.error });
            }

            // Get recent users
            const recentUsers = await User.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name email createdAt role');

            // Get recent analyses
            const recentAnalyses = await AnalysisReport.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('userId', 'name email')
                .select('role analysisType results.overallScore createdAt');

            // Get all users for the table
            const allUsers = await User.find()
                .sort({ createdAt: -1 })
                .limit(50)
                .select('name email role authProvider createdAt deepAnalysisCount');

            res.json({
                success: true,
                activity: {
                    recentUsers,
                    recentAnalyses,
                    allUsers,
                },
            });
        } catch (error: any) {
            console.error('❌ Activity stats error:', error);
            res.status(500).json({ success: false, error: 'Failed to get activity' });
        }
    },

    // GET /api/stats/users - Get all users for admin management
    async getUserList(req: Request, res: Response) {
        try {
            const auth = await verifyAdmin(req);
            if (!auth.success) {
                return res.status(401).json({ success: false, error: auth.error });
            }

            // Get all users with their analysis counts
            const users = await User.find({}, {
                password: 0, // Exclude password field
            }).sort({ createdAt: -1 }).lean();

            // Get analysis counts for each user
            const usersWithCounts = await Promise.all(users.map(async (user) => {
                const analysisCount = await AnalysisReport.countDocuments({ userId: user._id });
                return {
                    ...user,
                    analysisCount,
                    authProvider: user.authProvider || 'local',
                };
            }));

            res.json({
                success: true,
                users: usersWithCounts,
                total: users.length,
            });
        } catch (error: any) {
            console.error('❌ Get users error:', error);
            res.status(500).json({ success: false, error: 'Failed to get users' });
        }
    },
};
