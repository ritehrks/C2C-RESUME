export interface DeepAnalysisResult {
    overallAssessment: string;
    strengthsAnalysis: string[];
    improvementAreas: string[];
    keywordOptimization: {
        strongMatches: string[];
        suggestedAdditions: string[];
        contextTips: string[];
    };
    contentSuggestions: {
        summary: string;
        experience: string;
        skills: string;
        achievements: string;
    };
    atsOptimization: string[];
    competitiveEdge: string;
    actionPlan: string[];
}
export declare function runDeepAnalysisWithGemini(resumeText: string, jobDescription: string): Promise<DeepAnalysisResult>;
export declare function getQuickFeedback(sectionType: 'summary' | 'experience' | 'skills' | 'achievements', content: string, targetRole: string): Promise<string>;
declare const _default: {
    runDeepAnalysisWithGemini: typeof runDeepAnalysisWithGemini;
    getQuickFeedback: typeof getQuickFeedback;
};
export default _default;
//# sourceMappingURL=geminiService.d.ts.map