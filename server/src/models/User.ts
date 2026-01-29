// User Model
// TODO: Implement User schema with master profile

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    name: string;
    profileImage?: string;
    authProvider: 'google';
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
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        profileImage: String,
        authProvider: { type: String, default: 'google' },
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
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
