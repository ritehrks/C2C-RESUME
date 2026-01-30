// Simple Analyzer Service
// Runs locally using @xenova/transformers - NO external API calls

import { pipeline } from '@xenova/transformers';
// import ROLE_PROFILES from './roleProfiles.json'; // TODO: Import role profiles

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let embedder: any = null;

/**
 * Initialize the local embedding model
 * Called once when server starts
 */
export async function initializeEmbedder(): Promise<void> {
    console.log('🧠 Loading embedding model (MiniLM-L6-v2)...');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✅ Embedding model loaded and ready!');
}

/**
 * Generate embedding for text using local ML model
 */
async function getLocalEmbedding(text: string): Promise<number[]> {
    if (!embedder) throw new Error('Embedder not initialized. Call initializeEmbedder() first.');

    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data as Float32Array);
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Run simple analysis on resume text
 * 100% free, unlimited usage, runs entirely on our server
 */
export async function runSimpleAnalysis(
    resumeText: string,
    selectedRole: string
): Promise<SimpleAnalysisResult> {
    // TODO: Get role profile from JSON
    const roleProfile = {
        name: selectedRole,
        keywords: ['algorithms', 'data structures', 'API', 'Git'],
        embedding: [] as number[], // Pre-computed
    };

    const resumeLower = resumeText.toLowerCase();

    // 1. EMBEDDING SIMILARITY (Local ML)
    const resumeEmbedding = await getLocalEmbedding(resumeText);
    // const similarityScore = cosineSimilarity(resumeEmbedding, roleProfile.embedding) * 100;
    const similarityScore = 75; // TODO: Use actual pre-computed embedding

    // 2. KEYWORD MATCHING
    const matchedKeywords = roleProfile.keywords.filter(k =>
        resumeLower.includes(k.toLowerCase())
    );
    const missingKeywords = roleProfile.keywords.filter(k =>
        !resumeLower.includes(k.toLowerCase())
    );
    const keywordScore = (matchedKeywords.length / roleProfile.keywords.length) * 100;

    // 3. SECTION DETECTION
    const sections = {
        hasEducation: /education|academic|university|college/i.test(resumeText),
        hasExperience: /experience|work|internship|job/i.test(resumeText),
        hasProjects: /projects|portfolio/i.test(resumeText),
        hasSkills: /skills|technologies|proficient/i.test(resumeText),
    };

    // 4. ACTION VERB ANALYSIS
    const weakVerbs = ['made', 'did', 'worked', 'helped', 'was', 'used'];
    const strongVerbs = ['built', 'designed', 'developed', 'implemented', 'architected', 'optimized', 'led', 'created'];
    const foundWeak = weakVerbs.filter(v => resumeLower.includes(v));
    const foundStrong = strongVerbs.filter(v => resumeLower.includes(v));

    // 5. QUANTIFICATION CHECK
    const hasQuantification = /\d+%|\d+\+|\$\d+|\d+ users|\d+x/gi.test(resumeText);

    // FINAL SCORE
    const overallScore = (similarityScore * 0.4) + (keywordScore * 0.4) +
        (foundStrong.length > foundWeak.length ? 20 : 10);

    return {
        overallScore: Math.min(100, Math.round(overallScore)),
        similarityScore: Math.round(similarityScore),
        keywordScore: Math.round(keywordScore),
        matchedKeywords,
        missingKeywords,
        sections,
        actionVerbs: { strong: foundStrong, weak: foundWeak },
        hasQuantification,
        analysisType: 'simple' as const,
    };
}

// Types
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
