// Auth Controller
// Google OAuth and Email/Password authentication with JWT tokens

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'c2c-resume-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

// Helper function to generate JWT token
const generateToken = (userId: string, email: string): string => {
    return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

// Development mode: Create/return a mock user without OAuth
const getDevUser = async () => {
    // Find or create a development user
    let user = await User.findOne({ email: 'dev@c2c.mnit.ac.in' });

    if (!user) {
        user = new User({
            email: 'dev@c2c.mnit.ac.in',
            name: 'Dev User',
            authProvider: 'google',
            masterProfile: {
                personalInfo: {
                    phone: '+91 9876543210',
                    linkedin: 'linkedin.com/in/devuser',
                    github: 'github.com/devuser',
                },
                education: [{
                    institution: 'MNIT Jaipur',
                    branch: 'Computer Science',
                    cgpa: 8.5,
                    startYear: 2021,
                    endYear: 2025,
                }],
                skills: {
                    languages: ['JavaScript', 'Python', 'C++'],
                    frameworks: ['React', 'Node.js', 'Express'],
                    tools: ['Git', 'Docker', 'VS Code'],
                    databases: ['MongoDB', 'PostgreSQL'],
                },
            },
        });
        await user.save();
        console.log('📦 Created development user');
    }

    return user;
};

export const authController = {
    // GET /api/auth/google - Initiate Google OAuth (Dev mode: skip OAuth)
    googleAuth: async (req: Request, res: Response) => {
        try {
            // In development, we'll create/use a mock user
            if (process.env.NODE_ENV !== 'production') {
                const user = await getDevUser();
                const token = generateToken(user._id.toString(), user.email);

                // For dev mode, return the token directly
                res.json({
                    success: true,
                    message: 'Development mode login',
                    token,
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        profileImage: user.profileImage,
                    },
                });
            } else {
                // Production: redirect to Google OAuth
                const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
                const REDIRECT_URI = `${process.env.API_URL}/api/auth/callback`;
                const scope = 'email profile';

                const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                    `client_id=${GOOGLE_CLIENT_ID}&` +
                    `redirect_uri=${REDIRECT_URI}&` +
                    `response_type=code&` +
                    `scope=${scope}&` +
                    `access_type=offline&` +
                    `prompt=consent`;

                res.redirect(authUrl);
            }
        } catch (error: any) {
            console.error('❌ Auth error:', error);
            res.status(500).json({ success: false, error: 'Authentication failed' });
        }
    },

    // GET /api/auth/callback - Google OAuth callback
    googleCallback: async (req: Request, res: Response) => {
        try {
            const { code } = req.query;

            if (!code) {
                return res.status(400).json({ success: false, error: 'No authorization code' });
            }

            // Exchange code for tokens
            const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
            const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
            const REDIRECT_URI = `${process.env.API_URL}/api/auth/callback`;

            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code: code as string,
                    client_id: GOOGLE_CLIENT_ID || '',
                    client_secret: GOOGLE_CLIENT_SECRET || '',
                    redirect_uri: REDIRECT_URI,
                    grant_type: 'authorization_code',
                }),
            });

            const tokenData = await tokenResponse.json() as { access_token?: string };

            if (!tokenData.access_token) {
                return res.status(400).json({ success: false, error: 'Failed to get access token' });
            }

            // Get user info from Google
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });

            const googleUser = await userInfoResponse.json() as { email: string; name: string; picture?: string };

            // Find or create user in database
            let user = await User.findOne({ email: googleUser.email });

            if (!user) {
                user = new User({
                    email: googleUser.email,
                    name: googleUser.name,
                    profileImage: googleUser.picture,
                    authProvider: 'google',
                    masterProfile: {
                        personalInfo: {},
                        education: [],
                        skills: { languages: [], frameworks: [], tools: [], databases: [] },
                    },
                });
                await user.save();
                console.log(`✅ New user registered: ${user.email}`);
            }

            // Generate JWT token
            const token = generateToken(user._id.toString(), user.email);

            // Redirect to frontend with token
            const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
            res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
        } catch (error: any) {
            console.error('❌ OAuth callback error:', error);
            res.status(500).json({ success: false, error: 'Authentication failed' });
        }
    },

    // POST /api/auth/logout - Logout user
    logout: async (req: Request, res: Response) => {
        // JWT tokens are stateless, client should just remove the token
        res.json({ success: true, message: 'Logged out successfully' });
    },

    // GET /api/auth/me - Get current user
    getMe: async (req: Request, res: Response) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                // In dev mode, return the dev user
                if (process.env.NODE_ENV !== 'production') {
                    const user = await getDevUser();
                    return res.json({
                        success: true,
                        user: {
                            id: user._id,
                            email: user.email,
                            name: user.name,
                            profileImage: user.profileImage,
                            masterProfile: user.masterProfile,
                        },
                    });
                }
                return res.status(401).json({ success: false, error: 'Not authenticated' });
            }

            const token = authHeader.split(' ')[1];

            try {
                const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
                const user = await User.findById(decoded.userId).select('-__v');

                if (!user) {
                    return res.status(404).json({ success: false, error: 'User not found' });
                }

                res.json({
                    success: true,
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        profileImage: user.profileImage,
                        masterProfile: user.masterProfile,
                    },
                });
            } catch (jwtError) {
                return res.status(401).json({ success: false, error: 'Invalid token' });
            }
        } catch (error: any) {
            console.error('❌ Get me error:', error);
            res.status(500).json({ success: false, error: 'Failed to get user' });
        }
    },

    // PUT /api/auth/profile - Update user's master profile
    updateProfile: async (req: Request, res: Response) => {
        try {
            const authHeader = req.headers.authorization;
            let userId: string;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                // In dev mode, use the dev user
                if (process.env.NODE_ENV !== 'production') {
                    const devUser = await getDevUser();
                    userId = devUser._id.toString();
                } else {
                    return res.status(401).json({ success: false, error: 'Not authenticated' });
                }
            } else {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
                userId = decoded.userId;
            }

            const { masterProfile } = req.body;

            const user = await User.findByIdAndUpdate(
                userId,
                { masterProfile },
                { new: true, runValidators: true }
            );

            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    masterProfile: user.masterProfile,
                },
            });
        } catch (error: any) {
            console.error('❌ Update profile error:', error);
            res.status(500).json({ success: false, error: 'Failed to update profile' });
        }
    },

    // POST /api/auth/login - Email/Password login
    login: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, error: 'Email and password are required' });
            }

            // Find user by email
            const user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                return res.status(401).json({ success: false, error: 'Invalid email or password' });
            }

            // Check if user has a password (local auth)
            if (!user.password) {
                return res.status(401).json({ success: false, error: 'This account uses Google login' });
            }

            // Verify password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, error: 'Invalid email or password' });
            }

            // Generate token
            const token = generateToken(user._id.toString(), user.email);

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    profileImage: user.profileImage,
                },
            });
        } catch (error: any) {
            console.error('❌ Login error:', error);
            res.status(500).json({ success: false, error: 'Login failed' });
        }
    },

    // POST /api/auth/register - User registration
    register: async (req: Request, res: Response) => {
        try {
            const { email, password, name } = req.body;

            if (!email || !password || !name) {
                return res.status(400).json({ success: false, error: 'Email, password, and name are required' });
            }

            if (password.length < 6) {
                return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
            }

            // Check if user exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(409).json({ success: false, error: 'User already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            const user = new User({
                email: email.toLowerCase(),
                name,
                password: hashedPassword,
                authProvider: 'local',
                role: 'user',
                masterProfile: {
                    personalInfo: {},
                    education: [],
                    skills: { languages: [], frameworks: [], tools: [], databases: [] },
                },
            });

            await user.save();
            console.log(`✅ New user registered: ${user.email}`);

            // Generate token
            const token = generateToken(user._id.toString(), user.email);

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            });
        } catch (error: any) {
            console.error('❌ Register error:', error);
            res.status(500).json({ success: false, error: 'Registration failed' });
        }
    },
};

// Seed admin user on server start
export const seedAdminUser = async () => {
    try {
        const adminEmail = 'ritesh@123';
        const adminPassword = '12345678';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            const adminUser = new User({
                email: adminEmail,
                name: 'Ritesh Admin',
                password: hashedPassword,
                authProvider: 'local',
                role: 'admin',
                masterProfile: {
                    personalInfo: {},
                    education: [],
                    skills: { languages: [], frameworks: [], tools: [], databases: [] },
                },
            });

            await adminUser.save();
            console.log('🔐 Admin user created: ritesh@123 / 12345678');
        } else {
            console.log('🔐 Admin user already exists');
        }
    } catch (error) {
        console.error('❌ Failed to seed admin user:', error);
    }
};
