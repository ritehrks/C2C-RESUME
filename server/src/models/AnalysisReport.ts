// Analysis Report Model
// TODO: Implement analysis report schema

import mongoose, { Schema, Document } from 'mongoose';

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
        // Deep analysis fields
        aiSuggestions?: string[];
        aiRewrites?: Array<{ original: string; improved: string }>;
        grammarIssues?: string[];
        missingElements?: string[];
    };
    createdAt: Date;
}

const analysisReportSchema = new Schema<IAnalysisReport>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        resumeId: { type: Schema.Types.ObjectId, ref: 'Resume' },
        role: { type: String, required: true },
        analysisType: { type: String, enum: ['simple', 'deep'], required: true },
        results: {
            overallScore: Number,
            similarityScore: Number,
            keywordScore: Number,
            matchedKeywords: [String],
            missingKeywords: [String],
            sections: {
                hasEducation: Boolean,
                hasExperience: Boolean,
                hasProjects: Boolean,
                hasSkills: Boolean,
            },
            actionVerbs: {
                strong: [String],
                weak: [String],
            },
            hasQuantification: Boolean,
            aiSuggestions: [String],
            aiRewrites: [{
                original: String,
                improved: String,
            }],
            grammarIssues: [String],
            missingElements: [String],
        },
    },
    { timestamps: true }
);

export const AnalysisReport = mongoose.model<IAnalysisReport>('AnalysisReport', analysisReportSchema);
