import { type SimpleAnalysisResult } from './simpleAnalyzer.js';
/**
 * Check if user has remaining deep analyses for today
 */
export declare function checkDeepAnalysisLimit(userId: string): Promise<{
    allowed: boolean;
    remaining: number;
}>;
/**
 * Run deep analysis using Gemini API
 * Includes all simple analysis features + AI-powered insights
 */
export declare function runDeepAnalysis(resumeText: string, selectedRole: string, userId: string): Promise<DeepAnalysisResult | {
    error: string;
}>;
export interface DeepAnalysisResult extends SimpleAnalysisResult {
    overallAssessment?: string;
    strengths?: string[];
    improvements?: string[];
    atsIssues?: string[];
    competitiveEdge?: string;
    aiSuggestions: string[];
    aiRewrites: Array<{
        original: string;
        improved: string;
    }>;
    grammarIssues: string[];
    missingElements: string[];
    analysisType: 'deep';
    remainingDeepAnalyses: number;
}
//# sourceMappingURL=deepAnalyzer.d.ts.map