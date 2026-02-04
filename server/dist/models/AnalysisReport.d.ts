import mongoose, { Document } from 'mongoose';
export interface IAnalysisReport extends Document {
    userId: mongoose.Types.ObjectId;
    resumeId?: mongoose.Types.ObjectId;
    role: string;
    analysisType: 'simple' | 'deep';
    results: {
        overallScore: number;
        similarityScore: number;
        keywordScore: number;
        matchedKeywords: string[];
        missingKeywords: string[];
        sections: {
            hasEducation: boolean;
            hasExperience: boolean;
            hasProjects: boolean;
            hasSkills: boolean;
        };
        actionVerbs: {
            strong: string[];
            weak: string[];
        };
        hasQuantification: boolean;
        aiSuggestions?: string[];
        aiRewrites?: Array<{
            original: string;
            improved: string;
        }>;
        grammarIssues?: string[];
        missingElements?: string[];
    };
    createdAt: Date;
}
export declare const AnalysisReport: mongoose.Model<IAnalysisReport, {}, {}, {}, mongoose.Document<unknown, {}, IAnalysisReport, {}, {}> & IAnalysisReport & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AnalysisReport.d.ts.map