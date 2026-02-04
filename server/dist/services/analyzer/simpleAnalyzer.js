"use strict";
// Simple Analyzer Service
// Runs locally using @xenova/transformers - NO external API calls
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeEmbedder = initializeEmbedder;
exports.runSimpleAnalysis = runSimpleAnalysis;
const transformers_1 = require("@xenova/transformers");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let embedder = null;
// Pre-computed role embeddings (will be populated at startup)
const roleEmbeddings = {};
// Role-specific keyword profiles with weights
const ROLE_PROFILES = {
    'Software Development Engineer (SDE)': {
        keywords: [
            // Languages (high importance)
            'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'sql',
            // Frameworks
            'react', 'node.js', 'express', 'next.js', 'django', 'spring', 'angular', 'vue',
            // Core skills
            'data structures', 'algorithms', 'dsa', 'leetcode', 'codeforces',
            'api', 'rest', 'restful', 'graphql', 'git', 'github', 'version control',
            // Databases
            'mongodb', 'postgresql', 'mysql', 'redis', 'database', 'sql', 'nosql',
            // DevOps & Cloud
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'jenkins', 'vercel',
            // Concepts
            'system design', 'microservices', 'oop', 'agile', 'scrum', 'testing', 'unit test', 'jest',
            // Soft skills
            'problem solving', 'debugging', 'optimization', 'scalable', 'performance'
        ],
        suggestedKeywords: ['RESTful APIs', 'System Design', 'Microservices', 'Unit Testing', 'CI/CD', 'Cloud Computing', 'Agile', 'Code Review'],
        description: 'Software Development Engineer building scalable applications with modern tech stacks'
    },
    'Data Scientist': {
        keywords: [
            'python', 'r', 'sql', 'machine learning', 'deep learning', 'tensorflow', 'pytorch',
            'keras', 'pandas', 'numpy', 'scikit-learn', 'statistics', 'data analysis', 'visualization',
            'jupyter', 'big data', 'spark', 'hadoop', 'nlp', 'computer vision', 'neural network',
            'regression', 'classification', 'clustering', 'feature engineering', 'model', 'training',
            'tableau', 'power bi', 'matplotlib', 'seaborn', 'data pipeline', 'etl'
        ],
        suggestedKeywords: ['A/B Testing', 'Feature Engineering', 'Model Deployment', 'MLOps', 'Statistical Analysis', 'Hypothesis Testing'],
        description: 'Data Scientist with expertise in machine learning and statistical analysis'
    },
    'Frontend Developer': {
        keywords: [
            'javascript', 'typescript', 'html', 'css', 'react', 'vue', 'angular', 'next.js', 'nuxt',
            'tailwind', 'sass', 'scss', 'webpack', 'vite', 'responsive', 'accessibility', 'wcag',
            'ui', 'ux', 'figma', 'design', 'animation', 'css-in-js', 'styled-components',
            'rest api', 'graphql', 'testing', 'jest', 'cypress', 'playwright',
            'redux', 'zustand', 'state management', 'hooks', 'components', 'seo', 'performance',
            'pwa', 'npm', 'yarn', 'git'
        ],
        suggestedKeywords: ['Web Performance', 'SEO Optimization', 'Progressive Web Apps', 'State Management', 'Design Systems', 'Cross-browser Compatibility'],
        description: 'Frontend Developer creating responsive and accessible user interfaces'
    },
    'Backend Developer': {
        keywords: [
            'node.js', 'python', 'java', 'go', 'rust', 'express', 'fastify', 'django', 'flask', 'spring', 'fastapi',
            'rest api', 'graphql', 'grpc', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis',
            'docker', 'kubernetes', 'aws', 'microservices', 'authentication', 'authorization', 'oauth', 'jwt',
            'message queue', 'rabbitmq', 'kafka', 'caching', 'load balancing', 'nginx',
            'security', 'encryption', 'rate limiting', 'logging', 'monitoring', 'testing'
        ],
        suggestedKeywords: ['API Design', 'Message Queues', 'Caching Strategies', 'Load Balancing', 'Database Optimization', 'Security Best Practices'],
        description: 'Backend Developer building robust and scalable server-side applications'
    },
    'Full Stack Developer': {
        keywords: [
            'javascript', 'typescript', 'python', 'react', 'node.js', 'express', 'next.js',
            'mongodb', 'postgresql', 'html', 'css', 'tailwind', 'rest api', 'graphql',
            'docker', 'aws', 'git', 'agile', 'testing', 'deployment', 'ci/cd',
            'frontend', 'backend', 'database', 'authentication', 'responsive'
        ],
        suggestedKeywords: ['End-to-end Development', 'Full Stack Architecture', 'DevOps', 'Database Design'],
        description: 'Full Stack Developer proficient in both frontend and backend technologies'
    },
    'DevOps Engineer': {
        keywords: [
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'ansible', 'jenkins',
            'ci/cd', 'github actions', 'gitlab', 'linux', 'bash', 'python', 'yaml',
            'monitoring', 'prometheus', 'grafana', 'elk', 'logging', 'nginx', 'load balancer',
            'infrastructure', 'automation', 'deployment', 'helm', 'argocd', 'security'
        ],
        suggestedKeywords: ['Infrastructure as Code', 'Container Orchestration', 'Cloud Architecture', 'Site Reliability', 'Automation'],
        description: 'DevOps Engineer specializing in CI/CD, cloud infrastructure, and automation'
    },
    'Product Manager': {
        keywords: [
            'product', 'roadmap', 'strategy', 'stakeholder', 'user research', 'analytics',
            'agile', 'scrum', 'sprint', 'backlog', 'prioritization', 'metrics', 'kpi',
            'a/b testing', 'user experience', 'market research', 'competitive analysis',
            'requirements', 'specification', 'wireframe', 'prototype', 'launch', 'growth'
        ],
        suggestedKeywords: ['Product Strategy', 'User Research', 'Data-Driven Decisions', 'Cross-functional Leadership', 'OKRs'],
        description: 'Product Manager driving product vision and strategy'
    },
    'ML Engineer': {
        keywords: [
            'machine learning', 'deep learning', 'python', 'tensorflow', 'pytorch', 'keras',
            'mlops', 'model', 'training', 'inference', 'deployment', 'docker', 'kubernetes',
            'gpu', 'cuda', 'transformers', 'llm', 'nlp', 'computer vision', 'neural network',
            'data pipeline', 'feature engineering', 'hyperparameter', 'optimization', 'aws sagemaker'
        ],
        suggestedKeywords: ['Model Deployment', 'MLOps Pipeline', 'Model Optimization', 'Production ML', 'LLM Fine-tuning'],
        description: 'ML Engineer building and deploying machine learning systems at scale'
    },
    'default': {
        keywords: ['programming', 'development', 'software', 'git', 'api', 'database', 'testing', 'project'],
        suggestedKeywords: ['Problem Solving', 'Communication', 'Team Collaboration', 'Technical Documentation'],
        description: 'Software professional with technical expertise'
    }
};
/**
 * Initialize the local embedding model and pre-compute role embeddings
 * Called once when server starts
 */
async function initializeEmbedder() {
    console.log('🧠 Loading embedding model (MiniLM-L6-v2)...');
    embedder = await (0, transformers_1.pipeline)('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✅ Embedding model loaded!');
    // Pre-compute role embeddings
    console.log('📊 Pre-computing role embeddings...');
    for (const [roleName, profile] of Object.entries(ROLE_PROFILES)) {
        try {
            const roleText = `${roleName}. ${profile.description}. Skills: ${profile.keywords.join(', ')}`;
            roleEmbeddings[roleName] = await getLocalEmbedding(roleText);
        }
        catch (error) {
            console.warn(`⚠️ Could not compute embedding for ${roleName}`);
        }
    }
    console.log('✅ Role embeddings ready!');
}
/**
 * Generate embedding for text using local ML model
 */
async function getLocalEmbedding(text) {
    if (!embedder)
        throw new Error('Embedder not initialized. Call initializeEmbedder() first.');
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}
/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length || vecA.length === 0)
        return 0;
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return isNaN(similarity) ? 0 : similarity;
}
/**
 * Run simple analysis on resume text
 * 100% free, unlimited usage, runs entirely on our server
 */
async function runSimpleAnalysis(resumeText, selectedRole) {
    // Get role profile or use default
    const roleProfile = ROLE_PROFILES[selectedRole] || ROLE_PROFILES['default'];
    const resumeLower = resumeText.toLowerCase();
    // 1. EMBEDDING SIMILARITY (Local ML) - Now actually computed!
    let similarityScore = 70; // Fallback
    try {
        const resumeEmbedding = await getLocalEmbedding(resumeText);
        const roleEmbedding = roleEmbeddings[selectedRole] || roleEmbeddings['default'];
        if (roleEmbedding && roleEmbedding.length > 0) {
            const rawSimilarity = cosineSimilarity(resumeEmbedding, roleEmbedding);
            // Convert to 0-100 scale (typical similarity ranges from 0.3 to 0.9)
            similarityScore = Math.min(100, Math.max(0, Math.round((rawSimilarity - 0.3) / 0.6 * 100)));
        }
    }
    catch (error) {
        console.warn('⚠️ Could not compute embedding similarity, using fallback');
    }
    // 2. KEYWORD MATCHING (improved with partial matching)
    const matchedKeywords = [];
    const missingKeywords = [];
    for (const keyword of roleProfile.keywords) {
        // Check for exact match or partial match (e.g., "react.js" matches "react")
        const keywordLower = keyword.toLowerCase();
        if (resumeLower.includes(keywordLower) ||
            (keywordLower.includes('.') && resumeLower.includes(keywordLower.replace('.', '')))) {
            matchedKeywords.push(keyword);
        }
        else {
            missingKeywords.push(keyword);
        }
    }
    const keywordScore = Math.round((matchedKeywords.length / roleProfile.keywords.length) * 100);
    // 3. SECTION DETECTION (improved patterns)
    const sections = {
        hasEducation: /education|academic|university|college|degree|bachelor|master|b\.?tech|m\.?tech/i.test(resumeText),
        hasExperience: /experience|work|internship|job|professional|employment|worked at/i.test(resumeText),
        hasProjects: /projects?|portfolio|built|developed|created|github\.com/i.test(resumeText),
        hasSkills: /skills|technologies|proficient|expertise|tech stack|languages:/i.test(resumeText),
        hasAchievements: /achievements?|awards?|honors?|recognition|certified|hackathon|competition/i.test(resumeText),
        hasCertifications: /certifi(cation|ed)|course|credential|license/i.test(resumeText),
    };
    // 4. ACTION VERB ANALYSIS (expanded lists)
    const weakVerbs = ['made', 'did', 'worked', 'helped', 'was', 'used', 'had', 'got', 'tried'];
    const strongVerbs = [
        'built', 'designed', 'developed', 'implemented', 'architected', 'optimized', 'led', 'created',
        'engineered', 'automated', 'scaled', 'deployed', 'launched', 'improved', 'reduced', 'increased',
        'managed', 'spearheaded', 'orchestrated', 'streamlined', 'delivered', 'achieved'
    ];
    const foundWeak = weakVerbs.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(resumeText));
    const foundStrong = strongVerbs.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(resumeText));
    // 5. QUANTIFICATION CHECK (improved patterns)
    const quantificationPatterns = /\d+%|\d+\+|\$[\d,]+|\d+k|\d+ users?|\d+x|\d+ (orders?|requests?|customers?|clients?|projects?|teams?|members?)/gi;
    const quantifications = resumeText.match(quantificationPatterns) || [];
    const hasQuantification = quantifications.length > 0;
    // 6. LENGTH & FORMAT CHECK
    const wordCount = resumeText.trim().split(/\s+/).length;
    const isGoodLength = wordCount >= 200 && wordCount <= 800;
    // FINAL SCORE CALCULATION (weighted)
    const sectionScore = (Object.values(sections).filter(Boolean).length / Object.keys(sections).length) * 100;
    const verbScore = foundStrong.length > foundWeak.length ? 100 :
        foundStrong.length === foundWeak.length ? 70 : 40;
    const quantScore = hasQuantification ? 100 : 50;
    const overallScore = Math.round(similarityScore * 0.30 + // 30% - Semantic similarity
        keywordScore * 0.35 + // 35% - Keyword match
        sectionScore * 0.15 + // 15% - Resume sections
        verbScore * 0.10 + // 10% - Action verbs
        quantScore * 0.10 // 10% - Quantification
    );
    return {
        overallScore: Math.min(100, Math.max(0, overallScore)),
        similarityScore,
        keywordScore,
        matchedKeywords,
        missingKeywords: missingKeywords.slice(0, 12), // Top 12 missing
        suggestedKeywords: roleProfile.suggestedKeywords,
        sections,
        actionVerbs: { strong: foundStrong, weak: foundWeak },
        hasQuantification,
        quantificationCount: quantifications.length,
        wordCount,
        isGoodLength,
        analysisType: 'simple',
    };
}
//# sourceMappingURL=simpleAnalyzer.js.map