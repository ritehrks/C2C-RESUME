/**
 * Initialize the embedding model on first use (lazy loading)
 * Model: all-MiniLM-L6-v2 (~30MB, downloads on first run)
 */
export declare function initializeEmbedder(): Promise<void>;
/**
 * Check if embedder is ready
 */
export declare function isEmbedderReady(): boolean;
/**
 * Check if embedder is currently initializing
 */
export declare function isEmbedderInitializing(): boolean;
/**
 * Generate embedding for text using local ML model
 * Returns a 384-dimensional vector
 */
export declare function getEmbedding(text: string): Promise<number[]>;
/**
 * Calculate cosine similarity between two embedding vectors
 * Returns value between -1 and 1 (higher = more similar)
 */
export declare function cosineSimilarity(vecA: number[], vecB: number[]): number;
/**
 * Calculate semantic similarity between two texts
 * Returns percentage (0-100)
 */
export declare function getSemanticSimilarity(text1: string, text2: string): Promise<number>;
/**
 * Get embedding for a role profile (cached for performance)
 */
export declare function getRoleEmbedding(roleId: string, roleDescription: string): Promise<number[]>;
/**
 * Calculate how well a resume matches a job description semantically
 */
export declare function calculateSemanticMatch(resumeText: string, jobDescription: string): Promise<{
    overallSimilarity: number;
    resumeEmbedding: number[];
    jobEmbedding: number[];
}>;
//# sourceMappingURL=embeddingService.d.ts.map