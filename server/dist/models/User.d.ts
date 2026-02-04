import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    email: string;
    name: string;
    password?: string;
    profileImage?: string;
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
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map