// Embedding Service - Local ML embeddings using @xenova/transformers
// Uses MiniLM-L6-v2 model (~30MB) for semantic similarity

import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers';

let embedder: FeatureExtractionPipeline | null = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

/**
 * Initialize the embedding model on first use (lazy loading)
 * Model: all-MiniLM-L6-v2 (~30MB, downloads on first run)
 */
export async function initializeEmbedder(): Promise<void> {
    if (embedder) return;
    if (initPromise) return initPromise;

    isInitializing = true;
    console.log('🧠 Loading embedding model (MiniLM-L6-v2)...');
    console.log('   First run will download ~30MB model, please wait...');

    initPromise = (async () => {
        try {
            embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
                // Use quantized model for smaller size
                quantized: true,
            });
            console.log('✅ Embedding model loaded and ready!');
        } catch (error) {
            console.error('❌ Failed to load embedding model:', error);
            throw error;
        } finally {
            isInitializing = false;
        }
    })();

    return initPromise;
}

/**
 * Check if embedder is ready
 */
export function isEmbedderReady(): boolean {
    return embedder !== null;
}

/**
 * Check if embedder is currently initializing
 */
export function isEmbedderInitializing(): boolean {
    return isInitializing;
}

/**
 * Generate embedding for text using local ML model
 * Returns a 384-dimensional vector
 */
export async function getEmbedding(text: string): Promise<number[]> {
    if (!embedder) {
        await initializeEmbedder();
    }
    if (!embedder) {
        throw new Error('Embedder initialization failed');
    }

    // Truncate text if too long (model max is 512 tokens, ~2000 chars)
    const truncatedText = text.slice(0, 2000);

    const output = await embedder(truncatedText, {
        pooling: 'mean',
        normalize: true
    });

    // Convert to regular array
    return Array.from(output.data as Float32Array);
}

/**
 * Calculate cosine similarity between two embedding vectors
 * Returns value between -1 and 1 (higher = more similar)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculate semantic similarity between two texts
 * Returns percentage (0-100)
 */
export async function getSemanticSimilarity(text1: string, text2: string): Promise<number> {
    const [emb1, emb2] = await Promise.all([
        getEmbedding(text1),
        getEmbedding(text2),
    ]);

    const similarity = cosineSimilarity(emb1, emb2);

    // Convert from [-1, 1] to [0, 100] percentage
    // Most text similarities are positive, so we scale accordingly
    return Math.round(Math.max(0, similarity) * 100);
}

// Pre-computed role profile embeddings (computed once, cached)
const roleEmbeddingsCache: Map<string, number[]> = new Map();

/**
 * Get embedding for a role profile (cached for performance)
 */
export async function getRoleEmbedding(roleId: string, roleDescription: string): Promise<number[]> {
    if (roleEmbeddingsCache.has(roleId)) {
        return roleEmbeddingsCache.get(roleId)!;
    }

    const embedding = await getEmbedding(roleDescription);
    roleEmbeddingsCache.set(roleId, embedding);
    return embedding;
}

/**
 * Calculate how well a resume matches a job description semantically
 */
export async function calculateSemanticMatch(
    resumeText: string,
    jobDescription: string
): Promise<{
    overallSimilarity: number;
    resumeEmbedding: number[];
    jobEmbedding: number[];
}> {
    const [resumeEmbedding, jobEmbedding] = await Promise.all([
        getEmbedding(resumeText),
        getEmbedding(jobDescription),
    ]);

    const similarity = cosineSimilarity(resumeEmbedding, jobEmbedding);
    const overallSimilarity = Math.round(Math.max(0, similarity) * 100);

    return {
        overallSimilarity,
        resumeEmbedding,
        jobEmbedding,
    };
}
