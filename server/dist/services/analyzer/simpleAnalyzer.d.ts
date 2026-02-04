/**
 * Initialize the local embedding model
 * Called once when server starts
 */
export declare function initializeEmbedder(): Promise<void>;
/**
 * Run simple analysis on resume text
 * 100% free, unlimited usage, runs entirely on our server
 */
export declare function runSimpleAnalysis(resumeText: string, selectedRole: string): Promise<SimpleAnalysisResult>;
export interface SimpleAnalysisResult {
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
    analysisType: 'simple' | 'deep';
}
//# sourceMappingURL=simpleAnalyzer.d.ts.map