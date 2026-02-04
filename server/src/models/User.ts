// User Model
// TODO: Implement User schema with master profile

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    name: string;
    password?: string;
    profileImage?: string;
    googleId?: string;
    isEmailVerified: boolean;
    isActive: boolean;
    authProvider: 'google' | 'local';
    role: 'user' | 'admin';
    masterProfile: {
        personalInfo: {
            phone?: string;
            linkedin?: string;
            github?: string;
            portfolio?: string;
            codeforces?: string;
        };
        education: Array<{
            institution: string;
            branch: string;
            cgpa: number;
            startYear: number;
            endYear: number;
        }>;
        skills: {
            languages: string[];
            frameworks: string[];
            tools: string[];
            databases: string[];
        };
    };
    deepAnalysisCount: number;
    lastDeepAnalysisReset: Date;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true, lowercase: true },
        name: { type: String, required: true },
        password: { type: String },
        profileImage: String,
        googleId: { type: String, unique: true, sparse: true },
        isEmailVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        authProvider: { type: String, enum: ['google', 'local'], default: 'google' },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        masterProfile: {
            personalInfo: {
                phone: String,
                linkedin: String,
                github: String,
                portfolio: String,
                codeforces: String,
            },
            education: [{
                institution: String,
                branch: String,
                cgpa: Number,
                startYear: Number,
                endYear: Number,
            }],
            skills: {
                languages: [String],
                frameworks: [String],
                tools: [String],
                databases: [String],
            },
        },
        deepAnalysisCount: { type: Number, default: 0 },
        lastDeepAnalysisReset: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
