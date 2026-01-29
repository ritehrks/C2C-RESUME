// Resume Model
// TODO: Implement Resume schema with content sections

import mongoose, { Schema, Document } from 'mongoose';

export interface IResume extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    version: number;
    content: {
        personalInfo: {
            name: string;
            email: string;
            phone: string;
            linkedin?: string;
            github?: string;
            portfolio?: string;
        };
        education: Array<{
            institution: string;
            branch: string;
            cgpa: number;
            startYear: number;
            endYear: number;
        }>;
        experience: Array<{
            company: string;
            role: string;
            startDate: string;
            endDate: string;
            bullets: string[];
        }>;
        projects: Array<{
            title: string;
            techStack: string[];
            description: string;
            bullets: string[];
            link?: string;
        }>;
        skills: {
            languages: string[];
            frameworks: string[];
            tools: string[];
            databases: string[];
        };
        achievements: Array<{
            title: string;
            description: string;
            date?: string;
        }>;
        certifications: Array<{
            name: string;
            issuer: string;
            date: string;
            link?: string;
        }>;
        pors: Array<{
            position: string;
            organization: string;
            duration: string;
            description: string;
        }>;
    };
    pdfUrl?: string;
    templateId: string;
    createdAt: Date;
    updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        version: { type: Number, default: 1 },
        content: {
            personalInfo: {
                name: String,
                email: String,
                phone: String,
                linkedin: String,
                github: String,
                portfolio: String,
            },
            education: [{
                institution: String,
                branch: String,
                cgpa: Number,
                startYear: Number,
                endYear: Number,
            }],
            experience: [{
                company: String,
                role: String,
                startDate: String,
                endDate: String,
                bullets: [String],
            }],
            projects: [{
                title: String,
                techStack: [String],
                description: String,
                bullets: [String],
                link: String,
            }],
            skills: {
                languages: [String],
                frameworks: [String],
                tools: [String],
                databases: [String],
            },
            achievements: [{
                title: String,
                description: String,
                date: String,
            }],
            certifications: [{
                name: String,
                issuer: String,
                date: String,
                link: String,
            }],
            pors: [{
                position: String,
                organization: String,
                duration: String,
                description: String,
            }],
        },
        pdfUrl: String,
        templateId: { type: String, default: 'default' },
    },
    { timestamps: true }
);

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);
