"use strict";
// Embedding Service - Local ML embeddings using @xenova/transformers
// Uses MiniLM-L6-v2 model (~30MB) for semantic similarity
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeEmbedder = initializeEmbedder;
exports.isEmbedderReady = isEmbedderReady;
exports.isEmbedderInitializing = isEmbedderInitializing;
exports.getEmbedding = getEmbedding;
exports.cosineSimilarity = cosineSimilarity;
exports.getSemanticSimilarity = getSemanticSimilarity;
exports.getRoleEmbedding = getRoleEmbedding;
exports.calculateSemanticMatch = calculateSemanticMatch;
const transformers_1 = require("@xenova/transformers");
let embedder = null;
let isInitializing = false;
let initPromise = null;
/**
 * Initialize the embedding model on first use (lazy loading)
 * Model: all-MiniLM-L6-v2 (~30MB, downloads on first run)
 */
async function initializeEmbedder() {
    if (embedder)
        return;
    if (initPromise)
        return initPromise;
    isInitializing = true;
    console.log('🧠 Loading embedding model (MiniLM-L6-v2)...');
    console.log('   First run will download ~30MB model, please wait...');
    initPromise = (async () => {
        try {
            embedder = await (0, transformers_1.pipeline)('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
                // Use quantized model for smaller size
                quantized: true,
            });
            console.log('✅ Embedding model loaded and ready!');
        }
        catch (error) {
            console.error('❌ Failed to load embedding model:', error);
            throw error;
        }
        finally {
            isInitializing = false;
        }
    })();
    return initPromise;
}
/**
 * Check if embedder is ready
 */
function isEmbedderReady() {
    return embedder !== null;
}
/**
 * Check if embedder is currently initializing
 */
function isEmbedderInitializing() {
    return isInitializing;
}
/**
 * Generate embedding for text using local ML model
 * Returns a 384-dimensional vector
 */
async function getEmbedding(text) {
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
    return Array.from(output.data);
}
/**
 * Calculate cosine similarity between two embedding vectors
 * Returns value between -1 and 1 (higher = more similar)
 */
function cosineSimilarity(vecA, vecB) {
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
    if (normA === 0 || normB === 0)
        return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
/**
 * Calculate semantic similarity between two texts
 * Returns percentage (0-100)
 */
async function getSemanticSimilarity(text1, text2) {
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
const roleEmbeddingsCache = new Map();
/**
 * Get embedding for a role profile (cached for performance)
 */
async function getRoleEmbedding(roleId, roleDescription) {
    if (roleEmbeddingsCache.has(roleId)) {
        return roleEmbeddingsCache.get(roleId);
    }
    const embedding = await getEmbedding(roleDescription);
    roleEmbeddingsCache.set(roleId, embedding);
    return embedding;
}
/**
 * Calculate how well a resume matches a job description semantically
 */
async function calculateSemanticMatch(resumeText, jobDescription) {
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
//# sourceMappingURL=embeddingService.js.map