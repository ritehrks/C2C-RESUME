import mongoose, { Document } from 'mongoose';
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
export declare const Resume: mongoose.Model<IResume, {}, {}, {}, mongoose.Document<unknown, {}, IResume, {}, {}> & IResume & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Resume.d.ts.map