// Auth Middleware - JWT verification for protected routes

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'c2c-resume-secret-key-change-in-production';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: string;
            };
        }
    }
}

/**
 * Middleware to verify JWT token and attach user to request
 * Use this for routes that require authentication
 */
export const userAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
            const user = await User.findById(decoded.userId).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid token. User not found.'
                });
            }

            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    error: 'Account deactivated. Please contact support.'
                });
            }

            // Attach user to request
            req.user = {
                id: decoded.userId,
                email: user.email,
                name: user.name,
                role: user.role,
            };

            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token.'
            });
        }
    } catch (error) {
        console.error('User auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed.'
        });
    }
};

/**
 * Middleware to check if user is an admin
 * Use after userAuth middleware
 */
export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Not authenticated'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }

    next();
};

export default userAuth;
