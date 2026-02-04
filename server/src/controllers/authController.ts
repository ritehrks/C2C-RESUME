// Auth Controller
// Google OAuth with NIT-only domain validation and JWT tokens

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'c2c-resume-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

// Initialize Google OAuth client
const googleClient = new OAuth2Client();

// ⭐ MNIT DOMAIN CONFIGURATION - Only MNIT emails allowed
const ALLOWED_DOMAIN = 'mnit.ac.in';

// Helper function to generate JWT token
const generateToken = (userId: string, email: string): string => {
    return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

// Helper function to validate MNIT email domain
const isValidMNITEmail = (email: string): boolean => {
    const emailDomain = email.toLowerCase().split('@')[1];
    return emailDomain === ALLOWED_DOMAIN;
};

// Development mode: Create/return a mock user without OAuth
const getDevUser = async () => {
    // Find or create a development user
    let user = await User.findOne({ email: 'dev@mnit.ac.in' });

    if (!user) {
        user = new User({
            email: 'dev@mnit.ac.in',
            name: 'Dev User',
            authProvider: 'google',
            isEmailVerified: true,
            isActive: true,
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
    /**
     * POST /api/auth/google
     * ⭐ MAIN GOOGLE AUTH ENDPOINT - Verifies Google ID token and validates NIT domain
     * 
     * This endpoint receives the Google ID token from the frontend (@react-oauth/google),
     * verifies it, checks if the email is from an NIT domain, and creates/updates the user.
     */
    googleAuthCallback: async (req: Request, res: Response) => {
        try {
            const { credential } = req.body;

            if (!credential) {
                return res.status(400).json({
                    success: false,
                    message: "Google credential token is required"
                });
            }

            // STEP 1: Verify the Google ID token
            let ticket;
            try {
                ticket = await googleClient.verifyIdToken({
                    idToken: credential,
                    audience: process.env.GOOGLE_CLIENT_ID
                });
            } catch (verifyError) {
                console.error('❌ Token verification failed:', verifyError);
                return res.status(401).json({
                    success: false,
                    message: "Invalid Google token. Please try again."
                });
            }

            // STEP 2: Get user info from the verified token
            const payload = ticket.getPayload();
            if (!payload) {
                return res.status(401).json({
                    success: false,
                    message: "Could not retrieve user information from Google token"
                });
            }

            const { email, name, picture, email_verified, sub: googleId } = payload;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: "Email not found in Google account"
                });
            }

            if (!email_verified) {
                return res.status(400).json({
                    success: false,
                    message: "Your Google account email is not verified. Please verify your email first."
                });
            }

            // ⭐ STEP 3: CRITICAL - Validate MNIT email domain
            const emailLower = email.toLowerCase();
            const emailDomain = emailLower.split('@')[1];

            if (!isValidMNITEmail(emailLower)) {
                console.log(`🚫 Login rejected for non-MNIT email: ${emailLower}`);
                return res.status(403).json({
                    success: false,
                    message: "Only MNIT email addresses (@mnit.ac.in) are allowed to login. Please use your official MNIT email.",
                    domain: emailDomain,
                    allowedDomain: ALLOWED_DOMAIN
                });
            }

            // STEP 4: Find or create user
            let user = await User.findOne({ email: emailLower });
            let isNewUser = false;

            if (!user) {
                // Create new user
                isNewUser = true;
                user = new User({
                    email: emailLower,
                    name: name || 'NIT User',
                    googleId: googleId,
                    profileImage: picture,
                    isEmailVerified: true,
                    isActive: true,
                    authProvider: 'google',
                    role: 'user',
                    masterProfile: {
                        personalInfo: {},
                        education: [],
                        skills: { languages: [], frameworks: [], tools: [], databases: [] },
                    },
                });
                await user.save();
                console.log(`✅ New NIT user registered: ${emailLower}`);
            } else {
                // Update existing user with Google info if needed
                let needsSave = false;

                if (!user.googleId && googleId) {
                    user.googleId = googleId;
                    needsSave = true;
                }
                if (!user.profileImage && picture) {
                    user.profileImage = picture;
                    needsSave = true;
                }
                if (!user.isEmailVerified) {
                    user.isEmailVerified = true;
                    needsSave = true;
                }
                if (name && user.name !== name) {
                    user.name = name;
                    needsSave = true;
                }

                if (needsSave) await user.save();
                console.log(`✅ NIT user logged in: ${emailLower}`);
            }

            // Check if user is active
            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    message: "Your account has been deactivated. Please contact support."
                });
            }

            // STEP 5: Generate JWT token
            const token = generateToken(user._id.toString(), user.email);

            // STEP 6: Return success response
            res.json({
                success: true,
                message: isNewUser ? "Account created successfully! Welcome to C2C Resume Platform." : "Login successful. Welcome back!",
                isNewUser,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    profileImage: user.profileImage,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                }
            });
        } catch (error: any) {
            console.error("❌ Google authentication error:", error);
            res.status(500).json({
                success: false,
                message: "Authentication failed. Please try again."
            });
        }
    },

    // GET /api/auth/google - Legacy redirect flow (for backward compatibility)
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
                // Production: redirect to Google OAuth (legacy flow)
                const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
                const REDIRECT_URI = `${process.env.API_URL}/api/auth/callback`;
                const scope = 'email profile';

                const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                    `client_id=${GOOGLE_CLIENT_ID}&` +
                    `redirect_uri=${REDIRECT_URI}&` +
                    `response_type=code&` +
                    `scope=${scope}&` +
                    `access_type=offline&` +
                    `prompt=consent&` +
                    `hd=mnit.ac.in`; // Hint for NIT domain

                res.redirect(authUrl);
            }
        } catch (error: any) {
            console.error('❌ Auth error:', error);
            res.status(500).json({ success: false, error: 'Authentication failed' });
        }
    },

    // GET /api/auth/callback - Google OAuth callback (legacy redirect flow)
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

            // ⭐ Validate MNIT domain for redirect flow too
            if (!isValidMNITEmail(googleUser.email)) {
                const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
                return res.redirect(`${CLIENT_URL}/login?error=Only @mnit.ac.in emails are allowed`);
            }

            // Find or create user in database
            let user = await User.findOne({ email: googleUser.email.toLowerCase() });

            if (!user) {
                user = new User({
                    email: googleUser.email.toLowerCase(),
                    name: googleUser.name,
                    profileImage: googleUser.picture,
                    authProvider: 'google',
                    isEmailVerified: true,
                    isActive: true,
                    masterProfile: {
                        personalInfo: {},
                        education: [],
                        skills: { languages: [], frameworks: [], tools: [], databases: [] },
                    },
                });
                await user.save();
                console.log(`✅ New NIT user registered: ${user.email}`);
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
                const user = await User.findById(decoded.userId).select('-__v -password');

                if (!user) {
                    return res.status(404).json({ success: false, error: 'User not found' });
                }

                if (!user.isActive) {
                    return res.status(403).json({ success: false, error: 'Account deactivated' });
                }

                res.json({
                    success: true,
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        profileImage: user.profileImage,
                        role: user.role,
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

    // POST /api/auth/login - Email/Password login (disabled for NIT-only system)
    login: async (req: Request, res: Response) => {
        // Only allow admin login via email/password
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

            // Check if user is admin (only admins can use password login)
            if (user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Please use Google Sign-In with your NIT email address'
                });
            }

            // Check if user has a password
            if (!user.password) {
                return res.status(401).json({ success: false, error: 'This account uses Google login only' });
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
                message: 'Admin login successful',
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

    // POST /api/auth/register - User registration (disabled for NIT-only system)
    register: async (req: Request, res: Response) => {
        // Registration is disabled - users must use Google Sign-In with NIT email
        return res.status(403).json({
            success: false,
            error: 'Registration is disabled. Please use Google Sign-In with your NIT email address.'
        });
    },
};

// Seed admin user on server start
export const seedAdminUser = async () => {
    try {
        const adminEmail = 'admin@c2c.internal';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            const adminUser = new User({
                email: adminEmail,
                name: 'C2C Admin',
                password: hashedPassword,
                authProvider: 'local',
                role: 'admin',
                isEmailVerified: true,
                isActive: true,
                masterProfile: {
                    personalInfo: {},
                    education: [],
                    skills: { languages: [], frameworks: [], tools: [], databases: [] },
                },
            });

            await adminUser.save();
            console.log('🔐 Admin user created');
        } else {
            console.log('🔐 Admin user already exists');
        }
    } catch (error) {
        console.error('❌ Failed to seed admin user:', error);
    }
};
