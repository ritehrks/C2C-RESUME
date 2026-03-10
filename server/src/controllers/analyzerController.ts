// Analyzer Controller - IMPROVED VERSION with ML Embeddings
// Implements robust Simple and Deep analysis endpoints

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { calculateSemanticMatch, isEmbedderReady, initializeEmbedder } from '../services/analyzer/embeddingService.js';
import { AnalysisReport } from '../models/AnalysisReport.js';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'c2c-resume-secret-key-change-in-production';

// Helper to extract user ID from token (optional - doesn't require auth)
const getUserIdFromToken = async (req: Request): Promise<string | null> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return decoded.userId;
    } catch {
        return null;
    }
};

// =============================================================================
// COMPREHENSIVE KEYWORD DATABASE (200+ keywords)
// =============================================================================

const PROGRAMMING_LANGUAGES = [
    'javascript', 'typescript', 'python', 'java', 'c\\+\\+', 'c#', 'go', 'golang', 'rust', 'ruby',
    'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'haskell', 'clojure', 'elixir',
    'dart', 'lua', 'objective-c', 'assembly', 'cobol', 'fortran', 'julia', 'f#', 'groovy', 'vb.net',
];

const FRONTEND_TECH = [
    'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 'vuejs', 'vue.js', 'svelte',
    'next.js', 'nextjs', 'nuxt', 'gatsby', 'remix', 'astro', 'solid.js', 'qwik',
    'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'stylus',
    'tailwind', 'tailwindcss', 'bootstrap', 'material-ui', 'mui', 'chakra', 'ant design', 'styled-components',
    'webpack', 'vite', 'rollup', 'parcel', 'esbuild', 'babel', 'eslint', 'prettier',
    'redux', 'zustand', 'mobx', 'recoil', 'jotai', 'context api', 'state management',
    'responsive design', 'mobile-first', 'accessibility', 'a11y', 'wcag', 'seo',
    'pwa', 'progressive web app', 'service worker', 'web components', 'shadow dom',
];

const BACKEND_TECH = [
    'node.js', 'nodejs', 'node', 'express', 'expressjs', 'fastify', 'koa', 'hapi', 'nest.js', 'nestjs',
    'django', 'flask', 'fastapi', 'tornado', 'pyramid',
    'spring', 'spring boot', 'springboot', 'hibernate', 'jpa',
    'rails', 'ruby on rails', 'sinatra',
    'asp.net', '.net core', '.net', 'entity framework',
    'laravel', 'symfony', 'codeigniter',
    'gin', 'echo', 'fiber', 'buffalo',
    'rest', 'restful', 'rest api', 'graphql', 'grpc', 'soap', 'websocket', 'socket.io',
    'microservices', 'monolith', 'serverless', 'lambda', 'api gateway',
    'authentication', 'authorization', 'oauth', 'oauth2', 'jwt', 'passport', 'session',
    'middleware', 'routing', 'caching', 'rate limiting', 'load balancing',
];

const DATABASES = [
    'mongodb', 'mongo', 'postgresql', 'postgres', 'mysql', 'mariadb', 'sqlite',
    'oracle', 'sql server', 'mssql', 'db2',
    'redis', 'memcached', 'elasticsearch', 'opensearch', 'solr',
    'cassandra', 'dynamodb', 'couchdb', 'couchbase', 'neo4j', 'arangodb',
    'firebase', 'firestore', 'supabase', 'planetscale', 'cockroachdb', 'tidb',
    'sql', 'nosql', 'database', 'orm', 'prisma', 'sequelize', 'mongoose', 'typeorm',
    'knex', 'drizzle', 'sql alchemy', 'sqlalchemy', 'activerecord',
    'indexing', 'query optimization', 'stored procedures', 'triggers', 'views',
    'database design', 'normalization', 'denormalization', 'sharding', 'replication',
];

const DEVOPS_CLOUD = [
    'aws', 'amazon web services', 'ec2', 's3', 'lambda', 'rds', 'dynamodb', 'cloudfront', 'route53',
    'azure', 'microsoft azure', 'azure functions', 'azure devops',
    'gcp', 'google cloud', 'cloud run', 'cloud functions', 'bigquery', 'gke',
    'docker', 'dockerfile', 'docker-compose', 'containerization', 'container',
    'kubernetes', 'k8s', 'helm', 'kubectl', 'eks', 'aks', 'gke',
    'terraform', 'pulumi', 'cloudformation', 'ansible', 'chef', 'puppet',
    'jenkins', 'github actions', 'gitlab ci', 'circleci', 'travis ci', 'azure pipelines',
    'ci/cd', 'cicd', 'continuous integration', 'continuous deployment', 'continuous delivery',
    'linux', 'unix', 'ubuntu', 'centos', 'debian', 'rhel', 'bash', 'shell', 'powershell',
    'nginx', 'apache', 'caddy', 'haproxy', 'reverse proxy',
    'prometheus', 'grafana', 'datadog', 'new relic', 'splunk', 'elk', 'logstash', 'kibana',
    'monitoring', 'logging', 'alerting', 'observability', 'apm',
    'heroku', 'vercel', 'netlify', 'railway', 'render', 'fly.io', 'digital ocean',
];

const AI_ML = [
    'machine learning', 'ml', 'deep learning', 'dl', 'artificial intelligence', 'ai',
    'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'xgboost', 'lightgbm',
    'pandas', 'numpy', 'scipy', 'matplotlib', 'seaborn', 'plotly',
    'jupyter', 'jupyter notebook', 'colab', 'kaggle',
    'nlp', 'natural language processing', 'transformers', 'bert', 'gpt', 'llm', 'langchain',
    'computer vision', 'opencv', 'yolo', 'cnn', 'rnn', 'lstm', 'gan',
    'neural network', 'neural networks', 'model training', 'hyperparameter tuning',
    'feature engineering', 'data preprocessing', 'data cleaning', 'eda',
    'mlops', 'mlflow', 'kubeflow', 'sagemaker', 'vertex ai', 'model deployment',
    'regression', 'classification', 'clustering', 'recommendation', 'time series',
    'statistics', 'probability', 'a/b testing', 'hypothesis testing',
];

const TOOLS_PRACTICES = [
    'git', 'github', 'gitlab', 'bitbucket', 'version control', 'source control',
    'jira', 'confluence', 'trello', 'asana', 'notion', 'linear',
    'agile', 'scrum', 'kanban', 'sprint', 'standup', 'retrospective',
    'tdd', 'test-driven development', 'bdd', 'unit testing', 'integration testing', 'e2e testing',
    'jest', 'mocha', 'chai', 'pytest', 'junit', 'testing library', 'cypress', 'playwright', 'selenium',
    'code review', 'pull request', 'merge request', 'pair programming', 'mob programming',
    'clean code', 'solid', 'design patterns', 'architecture', 'system design',
    'documentation', 'api documentation', 'swagger', 'openapi', 'postman', 'insomnia',
    'debugging', 'profiling', 'performance optimization', 'refactoring',
    'figma', 'sketch', 'adobe xd', 'ui/ux', 'wireframe', 'prototype',
    // Competitive Programming & Student-focused
    'leetcode', 'codeforces', 'codechef', 'hackerrank', 'hackerearth', 'atcoder', 'topcoder',
    'competitive programming', 'dsa', 'data structures', 'algorithms', 'problem solving',
    'hackathon', 'gsoc', 'google summer of code', 'lfx', 'open source',
    'oops', 'oop', 'object oriented', 'dbms', 'operating system', 'os', 'computer networks', 'cn',
    'projects', 'personal projects', 'academic projects', 'cgpa', 'gpa',
];

const SOFT_SKILLS = [
    'communication', 'teamwork', 'collaboration', 'leadership', 'problem solving', 'problem-solving',
    'critical thinking', 'analytical', 'attention to detail', 'time management',
    'project management', 'stakeholder', 'cross-functional', 'mentoring', 'mentorship',
    'presentation', 'public speaking', 'technical writing', 'documentation',
];

// Combine all keywords with category info
const ALL_KEYWORDS: { keyword: string; category: string; regex: RegExp }[] = [];

function addKeywords(keywords: string[], category: string) {
    keywords.forEach(kw => {
        // Create regex with word boundaries for accurate matching
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        ALL_KEYWORDS.push({
            keyword: kw,
            category,
            regex: new RegExp(`\\b${escaped}\\b`, 'i'),
        });
    });
}

addKeywords(PROGRAMMING_LANGUAGES, 'Programming Languages');
addKeywords(FRONTEND_TECH, 'Frontend');
addKeywords(BACKEND_TECH, 'Backend');
addKeywords(DATABASES, 'Databases');
addKeywords(DEVOPS_CLOUD, 'DevOps & Cloud');
addKeywords(AI_ML, 'AI/ML & Data Science');
addKeywords(TOOLS_PRACTICES, 'Tools & Practices');
addKeywords(SOFT_SKILLS, 'Soft Skills');

// =============================================================================
// ACTION VERBS
// =============================================================================

const STRONG_ACTION_VERBS = [
    'achieved', 'accomplished', 'architected', 'automated', 'built', 'championed',
    'created', 'decreased', 'delivered', 'designed', 'developed', 'drove',
    'eliminated', 'engineered', 'established', 'exceeded', 'executed', 'expanded',
    'generated', 'grew', 'implemented', 'improved', 'increased', 'initiated',
    'innovated', 'integrated', 'launched', 'led', 'managed', 'maximized',
    'mentored', 'modernized', 'optimized', 'orchestrated', 'overhauled', 'pioneered',
    'reduced', 'refactored', 'resolved', 'revolutionized', 'scaled', 'secured',
    'simplified', 'spearheaded', 'streamlined', 'strengthened', 'transformed', 'upgraded',
];

const WEAK_ACTION_VERBS = [
    'helped', 'assisted', 'worked on', 'was responsible for', 'participated in',
    'involved in', 'handled', 'dealt with', 'familiar with', 'exposure to',
    'contributed to', 'supported', 'aided', 'was part of',
];

// =============================================================================
// SECTION PATTERNS
// =============================================================================

const SECTION_PATTERNS = {
    education: /\b(education|academic|university|college|bachelor|master|phd|degree|b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?|bsc|msc|mba|diploma|cgpa|gpa|graduated)\b/i,
    experience: /\b(experience|work|employment|internship|intern|job|position|role|company|worked at|professional)\b/i,
    projects: /\b(projects?|portfolio|personal projects?|academic projects?|side projects?|built|developed|created)\b/i,
    skills: /\b(skills?|technologies|tech stack|technical skills|proficient|expertise|competencies|tools)\b/i,
    achievements: /\b(achievements?|awards?|honors?|accomplishments?|recognition|certificates?|certifications?|publications?)\b/i,
    summary: /\b(summary|objective|profile|about|introduction|overview)\b/i,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function extractKeywordsWithCategories(text: string): { keyword: string; category: string }[] {
    const found: { keyword: string; category: string }[] = [];
    const seenKeywords = new Set<string>();

    ALL_KEYWORDS.forEach(({ keyword, category, regex }) => {
        if (regex.test(text) && !seenKeywords.has(keyword.toLowerCase())) {
            found.push({ keyword, category });
            seenKeywords.add(keyword.toLowerCase());
        }
    });

    return found;
}

function extractKeywords(text: string): string[] {
    return extractKeywordsWithCategories(text).map(k => k.keyword);
}

function analyzeActionVerbs(text: string): { strong: string[]; weak: string[] } {
    const normalized = text.toLowerCase();

    const strong = STRONG_ACTION_VERBS.filter(verb => {
        const regex = new RegExp(`\\b${verb}\\b`, 'i');
        return regex.test(normalized);
    });

    const weak = WEAK_ACTION_VERBS.filter(verb => {
        const regex = new RegExp(`\\b${verb}\\b`, 'i');
        return regex.test(normalized);
    });

    return { strong, weak };
}

function detectSections(text: string): Record<string, boolean> {
    return {
        hasEducation: SECTION_PATTERNS.education.test(text),
        hasExperience: SECTION_PATTERNS.experience.test(text),
        hasProjects: SECTION_PATTERNS.projects.test(text),
        hasSkills: SECTION_PATTERNS.skills.test(text),
        hasAchievements: SECTION_PATTERNS.achievements.test(text),
        hasSummary: SECTION_PATTERNS.summary.test(text),
    };
}

function hasQuantification(text: string): { found: boolean; examples: string[] } {
    const patterns = [
        /\d+%/g,                    // percentages
        /\$[\d,]+/g,                // dollar amounts
        /\d+\s*(users|customers|clients|projects|applications|apis)/gi,  // counts
        /\d+x\s*(faster|improvement|increase)/gi,  // multipliers
        /\d+\s*(years?|months?)\s*(of\s*)?experience/gi,  // experience
        /top\s*\d+%/gi,             // rankings
        /\d+\+/g,                   // 10+, 100+
        /reduced\s*.*?\d+/gi,       // reduced by X
        /increased\s*.*?\d+/gi,     // increased by X
        /improved\s*.*?\d+/gi,      // improved by X
    ];

    const examples: string[] = [];
    patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            examples.push(...matches.slice(0, 2));
        }
    });

    return { found: examples.length > 0, examples: [...new Set(examples)].slice(0, 5) };
}

function calculateMatch(resumeKeywords: string[], jobKeywords: string[]): { matched: string[]; missing: string[]; percentage: number } {
    if (jobKeywords.length === 0) return { matched: [], missing: [], percentage: 0 };

    const resumeSet = new Set(resumeKeywords.map(k => k.toLowerCase()));
    const matched = jobKeywords.filter(jk => resumeSet.has(jk.toLowerCase()));
    const missing = jobKeywords.filter(jk => !resumeSet.has(jk.toLowerCase()));

    const percentage = Math.round((matched.length / jobKeywords.length) * 100);

    return { matched, missing, percentage };
}

function generateSuggestions(analysis: {
    missingKeywords: string[];
    actionVerbs: { strong: string[]; weak: string[] };
    quantification: { found: boolean };
    sections: Record<string, boolean>;
    matchPercentage: number;
}): string[] {
    const suggestions: string[] = [];

    // Missing keywords
    if (analysis.missingKeywords.length > 0) {
        const topMissing = analysis.missingKeywords.slice(0, 5).join(', ');
        suggestions.push(`📌 Add these missing keywords from the job description: ${topMissing}`);
    }

    // Weak verbs
    if (analysis.actionVerbs.weak.length > 0) {
        suggestions.push(`💪 Replace weak verbs like "${analysis.actionVerbs.weak[0]}" with action verbs like "developed", "implemented", "built"`);
    }

    // Need more strong verbs
    if (analysis.actionVerbs.strong.length < 5) {
        suggestions.push('⚡ Use more strong action verbs (achieved, built, designed, implemented, led, optimized)');
    }

    // No quantification
    if (!analysis.quantification.found) {
        suggestions.push('📊 Add quantifiable achievements (e.g., "increased performance by 40%", "reduced load time by 2s")');
    }

    // Missing sections
    if (!analysis.sections.hasSummary) {
        suggestions.push('📝 Add a professional summary/objective at the top highlighting your key strengths');
    }
    if (!analysis.sections.hasProjects) {
        suggestions.push('🔧 Add a Projects section showcasing your practical work');
    }
    if (!analysis.sections.hasAchievements) {
        suggestions.push('🏆 Consider adding an Achievements section for awards, certifications, or notable accomplishments');
    }

    // Low match
    if (analysis.matchPercentage < 40) {
        suggestions.push('⚠️ Your resume keywords have low overlap with the job description. Consider tailoring it more specifically.');
    }

    return suggestions;
}

// =============================================================================
// CONTROLLER
// =============================================================================

export const analyzerController = {
    // POST /api/analyze/simple - Run simple analysis (FREE, unlimited)
    runSimpleAnalysis: async (req: Request, res: Response) => {
        try {
            const { resumeText, jobDescription, selectedRole } = req.body;

            if (!resumeText || !jobDescription) {
                return res.status(400).json({
                    success: false,
                    error: 'Both resumeText and jobDescription are required'
                });
            }

            console.log('📊 Running improved simple analysis...');

            // Extract keywords with categories
            const resumeKeywordsWithCats = extractKeywordsWithCategories(resumeText);
            let jobKeywordsWithCats = extractKeywordsWithCategories(jobDescription);

            // FALLBACK: If job description has few keywords (just role title), use role-specific keywords
            // Student-focused keywords for BTech students (internships + placements)
            const ROLE_KEYWORDS: Record<string, string[]> = {
                // INTERN ROLES
                'sde_intern': ['data structures', 'algorithms', 'c++', 'python', 'java', 'javascript', 'leetcode', 'codeforces', 'git', 'problem solving', 'projects', 'hackathon'],
                'frontend_intern': ['html', 'css', 'javascript', 'react', 'tailwind', 'responsive design', 'git', 'projects', 'portfolio', 'figma'],
                'backend_intern': ['node.js', 'express', 'python', 'django', 'flask', 'mongodb', 'mysql', 'rest api', 'authentication', 'git', 'projects'],
                'fullstack_intern': ['react', 'node.js', 'mongodb', 'express', 'html', 'css', 'javascript', 'rest api', 'git', 'mern', 'full stack', 'projects'],
                'ml_intern': ['python', 'pandas', 'numpy', 'machine learning', 'sklearn', 'jupyter', 'kaggle', 'sql', 'statistics', 'tensorflow'],

                // PLACEMENT ROLES
                'sde_placement': ['data structures', 'algorithms', 'c++', 'java', 'python', 'system design', 'oops', 'dbms', 'os', 'cgpa', 'projects', 'internship', 'competitive programming'],
                'frontend_placement': ['react', 'javascript', 'typescript', 'html', 'css', 'redux', 'next.js', 'tailwind', 'portfolio', 'responsive', 'testing', 'performance'],
                'backend_placement': ['node.js', 'java', 'python', 'rest api', 'mongodb', 'mysql', 'system design', 'authentication', 'docker', 'microservices'],
                'data_analyst': ['sql', 'python', 'excel', 'tableau', 'statistics', 'data visualization', 'pandas', 'analysis', 'power bi', 'business'],

                // SPECIAL ROLES
                'open_source': ['github', 'open source', 'pull request', 'contributions', 'gsoc', 'lfx', 'git', 'documentation', 'community'],
                'research_intern': ['research', 'cgpa', 'publications', 'machine learning', 'deep learning', 'thesis', 'paper', 'academic'],
                'hackathon': ['hackathon', 'prototype', 'mvp', 'team project', 'presentation', 'innovation', 'problem solving', 'github'],

                // OFF-CAMPUS / STARTUP ROLES
                'startup_sde': ['full stack', 'react', 'node.js', 'mongodb', 'projects', 'deployment', 'vercel', 'api', 'agile', 'startup', 'fast learner'],
                'product_company': ['data structures', 'algorithms', 'system design', 'leetcode', 'codeforces', 'competitive programming', 'clean code', 'scalable', 'internship', 'open source'],
                'service_company': ['sql', 'dbms', 'os', 'oops', 'aptitude', 'communication', 'basic dsa', 'c++', 'java', 'python', 'cgpa'],
                'freelance': ['portfolio', 'projects', 'full stack', 'react', 'node.js', 'deployment', 'client', 'communication', 'github', 'responsive'],
                'devrel': ['github', 'blog', 'documentation', 'open source', 'community', 'presentation', 'social media', 'technical writing', 'youtube', 'twitter'],
            };

            // If we found very few keywords in job description, use role fallback
            if (jobKeywordsWithCats.length < 3 && selectedRole) {
                const roleKeywords = ROLE_KEYWORDS[selectedRole] || [];
                if (roleKeywords.length > 0) {
                    console.log(`   ⚠️ Job description too short, using ${selectedRole} role keywords (${roleKeywords.length})`);
                    jobKeywordsWithCats = roleKeywords.map(kw => ({ keyword: kw, category: 'Role Requirements' }));
                }
            }

            const resumeKeywords = resumeKeywordsWithCats.map(k => k.keyword);
            const jobKeywords = jobKeywordsWithCats.map(k => k.keyword);

            // Calculate match
            const { matched: matchedKeywords, missing: missingKeywords, percentage: matchPercentage } =
                calculateMatch(resumeKeywords, jobKeywords);

            // Analyze action verbs
            const actionVerbs = analyzeActionVerbs(resumeText);

            // Detect sections
            const sections = detectSections(resumeText);

            // Check quantification
            const quantification = hasQuantification(resumeText);

            // Calculate component scores
            const keywordScore = matchPercentage;
            const verbScore = Math.min(100, actionVerbs.strong.length * 10 - actionVerbs.weak.length * 5);
            const sectionScore = Object.values(sections).filter(Boolean).length * 16; // 6 sections = 96%
            const quantScore = quantification.found ? 100 : 50;

            // Calculate semantic similarity using ML embeddings
            let semanticScore = 0;
            let semanticAnalysis = null;
            try {
                console.log('🧠 Computing semantic similarity with ML embeddings...');
                const semanticResult = await calculateSemanticMatch(resumeText, jobDescription);
                semanticScore = semanticResult.overallSimilarity;
                semanticAnalysis = {
                    similarity: semanticScore,
                    modelUsed: 'MiniLM-L6-v2',
                    interpretation: semanticScore >= 70
                        ? 'High semantic alignment - your resume content strongly aligns with the job description'
                        : semanticScore >= 50
                            ? 'Moderate alignment - consider rewording to better match the job description style'
                            : 'Low alignment - your resume content may not effectively communicate relevance to this role',
                };
                console.log(`   ✓ Semantic similarity: ${semanticScore}%`);
            } catch (error) {
                console.log('   ⚠️ Semantic analysis skipped (model loading...)');
            }

            // Weighted overall score (now includes semantic if available)
            const overallScore = semanticScore > 0
                ? Math.round(
                    keywordScore * 0.30 +      // 30% keyword match
                    semanticScore * 0.25 +     // 25% semantic similarity
                    verbScore * 0.15 +         // 15% action verbs
                    sectionScore * 0.20 +      // 20% sections
                    quantScore * 0.10          // 10% quantification
                )
                : Math.round(
                    keywordScore * 0.40 +      // 40% keyword match (fallback)
                    verbScore * 0.20 +         // 20% action verbs
                    sectionScore * 0.25 +      // 25% sections
                    quantScore * 0.15          // 15% quantification
                );

            // Determine rating
            let rating: string;
            let ratingLabel: string;
            let ratingColor: string;
            if (overallScore >= 80) {
                rating = 'excellent';
                ratingLabel = 'Excellent Match';
                ratingColor = '#22c55e';
            } else if (overallScore >= 65) {
                rating = 'good';
                ratingLabel = 'Good Match';
                ratingColor = '#3b82f6';
            } else if (overallScore >= 50) {
                rating = 'fair';
                ratingLabel = 'Fair Match';
                ratingColor = '#eab308';
            } else {
                rating = 'needs_work';
                ratingLabel = 'Needs Improvement';
                ratingColor = '#ef4444';
            }

            // Generate suggestions
            const suggestions = generateSuggestions({
                missingKeywords,
                actionVerbs,
                quantification,
                sections,
                matchPercentage,
            });

            // Group keywords by category for better display
            const keywordsByCategory: Record<string, { matched: string[]; missing: string[] }> = {};

            resumeKeywordsWithCats.forEach(({ keyword, category }) => {
                if (!keywordsByCategory[category]) {
                    keywordsByCategory[category] = { matched: [], missing: [] };
                }
                if (matchedKeywords.includes(keyword)) {
                    keywordsByCategory[category].matched.push(keyword);
                }
            });

            jobKeywordsWithCats.forEach(({ keyword, category }) => {
                if (!keywordsByCategory[category]) {
                    keywordsByCategory[category] = { matched: [], missing: [] };
                }
                if (missingKeywords.includes(keyword)) {
                    keywordsByCategory[category].missing.push(keyword);
                }
            });

            const result = {
                success: true,
                analysis: {
                    overallScore: Math.max(0, Math.min(100, overallScore)),
                    matchPercentage,
                    rating,
                    ratingLabel,
                    ratingColor,
                    scores: {
                        keyword: Math.max(0, keywordScore),
                        semantic: semanticScore,
                        actionVerbs: Math.max(0, Math.min(100, verbScore)),
                        sections: Math.min(100, sectionScore),
                        quantification: quantScore,
                    },
                    semanticAnalysis,
                    keywords: {
                        resume: resumeKeywords,
                        job: jobKeywords,
                        matched: matchedKeywords,
                        missing: missingKeywords,
                        byCategory: keywordsByCategory,
                    },
                    actionVerbs,
                    sections,
                    quantification,
                    suggestions,
                    stats: {
                        resumeKeywordsFound: resumeKeywords.length,
                        jobKeywordsFound: jobKeywords.length,
                        matchedCount: matchedKeywords.length,
                        missingCount: missingKeywords.length,
                        strongVerbsCount: actionVerbs.strong.length,
                        weakVerbsCount: actionVerbs.weak.length,
                        sectionsDetected: Object.values(sections).filter(Boolean).length,
                    }
                }
            };

            console.log(`✅ Analysis complete: ${overallScore}% overall (${matchPercentage}% keyword match)`);

            // Save to database for admin dashboard tracking (if user is authenticated)
            try {
                const userId = await getUserIdFromToken(req);
                if (userId) {
                    await AnalysisReport.create({
                        userId,
                        role: req.body.selectedRole || 'general',
                        analysisType: 'simple',
                        results: {
                            overallScore: Math.max(0, Math.min(100, overallScore)),
                            similarityScore: semanticScore,
                            keywordScore: Math.max(0, keywordScore),
                            matchedKeywords,
                            missingKeywords,
                            sections: {
                                hasEducation: sections.hasEducation,
                                hasExperience: sections.hasExperience,
                                hasProjects: sections.hasProjects,
                                hasSkills: sections.hasSkills,
                            },
                            actionVerbs,
                            hasQuantification: quantification.found,
                        },
                    });
                    console.log('   📊 Analysis saved to database');
                }
            } catch (saveError) {
                console.log('   ⚠️ Could not save analysis to database:', saveError);
            }

            res.json(result);

        } catch (error: any) {
            console.error('❌ Analysis error:', error);
            res.status(500).json({
                success: false,
                error: 'Analysis failed',
                details: error.message
            });
        }
    },

    // POST /api/analyze/deep - Run deep analysis with Gemini AI
    runDeepAnalysis: async (req: Request, res: Response) => {
        try {
            const { resumeText, jobDescription, selectedRole } = req.body;

            if (!resumeText || !jobDescription) {
                return res.status(400).json({
                    success: false,
                    error: 'Both resumeText and jobDescription are required'
                });
            }

            console.log('🤖 Running deep AI analysis with Gemini...');

            // ROLE-BASED KEYWORD FALLBACK - Student focused (internships + placements)
            const ROLE_KEYWORDS: Record<string, string[]> = {
                // INTERN ROLES
                'sde_intern': ['data structures', 'algorithms', 'c++', 'python', 'java', 'javascript', 'leetcode', 'codeforces', 'git', 'problem solving', 'projects', 'hackathon'],
                'frontend_intern': ['html', 'css', 'javascript', 'react', 'tailwind', 'responsive design', 'git', 'projects', 'portfolio', 'figma'],
                'backend_intern': ['node.js', 'express', 'python', 'django', 'flask', 'mongodb', 'mysql', 'rest api', 'authentication', 'git', 'projects'],
                'fullstack_intern': ['react', 'node.js', 'mongodb', 'express', 'html', 'css', 'javascript', 'rest api', 'git', 'mern', 'full stack', 'projects'],
                'ml_intern': ['python', 'pandas', 'numpy', 'machine learning', 'sklearn', 'jupyter', 'kaggle', 'sql', 'statistics', 'tensorflow'],

                // PLACEMENT ROLES
                'sde_placement': ['data structures', 'algorithms', 'c++', 'java', 'python', 'system design', 'oops', 'dbms', 'os', 'cgpa', 'projects', 'internship', 'competitive programming'],
                'frontend_placement': ['react', 'javascript', 'typescript', 'html', 'css', 'redux', 'next.js', 'tailwind', 'portfolio', 'responsive', 'testing', 'performance'],
                'backend_placement': ['node.js', 'java', 'python', 'rest api', 'mongodb', 'mysql', 'system design', 'authentication', 'docker', 'microservices'],
                'data_analyst': ['sql', 'python', 'excel', 'tableau', 'statistics', 'data visualization', 'pandas', 'analysis', 'power bi', 'business'],

                // SPECIAL ROLES
                'open_source': ['github', 'open source', 'pull request', 'contributions', 'gsoc', 'lfx', 'git', 'documentation', 'community'],
                'research_intern': ['research', 'cgpa', 'publications', 'machine learning', 'deep learning', 'thesis', 'paper', 'academic'],
                'hackathon': ['hackathon', 'prototype', 'mvp', 'team project', 'presentation', 'innovation', 'problem solving', 'github'],

                // OFF-CAMPUS / STARTUP ROLES
                'startup_sde': ['full stack', 'react', 'node.js', 'mongodb', 'projects', 'deployment', 'vercel', 'api', 'agile', 'startup', 'fast learner'],
                'product_company': ['data structures', 'algorithms', 'system design', 'leetcode', 'codeforces', 'competitive programming', 'clean code', 'scalable', 'internship', 'open source'],
                'service_company': ['sql', 'dbms', 'os', 'oops', 'aptitude', 'communication', 'basic dsa', 'c++', 'java', 'python', 'cgpa'],
                'freelance': ['portfolio', 'projects', 'full stack', 'react', 'node.js', 'deployment', 'client', 'communication', 'github', 'responsive'],
                'devrel': ['github', 'blog', 'documentation', 'open source', 'community', 'presentation', 'social media', 'technical writing', 'youtube', 'twitter'],
            };

            // Extract keywords from job description
            let jobKeywords = extractKeywords(jobDescription);

            // Fallback to role keywords if job description has few keywords
            if (jobKeywords.length < 3 && selectedRole) {
                const roleKeywords = ROLE_KEYWORDS[selectedRole] || [];
                if (roleKeywords.length > 0) {
                    console.log(`   ⚠️ Deep: Using ${selectedRole} role keywords (${roleKeywords.length})`);
                    jobKeywords = roleKeywords;
                }
            }

            // Check if API key is configured
            if (!process.env.GOOGLE_API_KEY) {
                console.log('⚠️ GOOGLE_API_KEY not set, returning fallback analysis');

                // Run simple analysis as fallback
                const resumeKeywords = extractKeywords(resumeText);
                const { matched: matchedKeywords, missing: missingKeywords, percentage: matchPercentage } =
                    calculateMatch(resumeKeywords, jobKeywords);

                return res.json({
                    success: true,
                    isAiPowered: false,
                    analysis: {
                        matchPercentage,
                        matchedKeywords,
                        missingKeywords,
                        aiInsights: [
                            'Consider adding a professional summary highlighting your key strengths',
                            'Your experience section could benefit from more specific technical details',
                            'Add relevant certifications to strengthen your profile',
                            'Use more action verbs to describe your achievements',
                            'Quantify your accomplishments with specific metrics',
                        ],
                        note: '⚠️ Add GOOGLE_API_KEY to .env for AI-powered deep analysis'
                    }
                });
            }

            // Import and run Gemini analysis
            const { runDeepAnalysisWithGemini } = await import('../services/ai/geminiService.js');
            const aiAnalysis = await runDeepAnalysisWithGemini(resumeText, jobDescription);

            // Also run simple analysis for stats
            const resumeKeywords = extractKeywords(resumeText);
            const { matched: matchedKeywords, missing: missingKeywords, percentage: matchPercentage } =
                calculateMatch(resumeKeywords, jobKeywords);
            const actionVerbs = analyzeActionVerbs(resumeText);

            console.log('✅ AI Deep analysis complete');

            // Save to database for admin dashboard tracking
            try {
                const userId = await getUserIdFromToken(req);
                if (userId) {
                    await AnalysisReport.create({
                        userId,
                        role: req.body.selectedRole || 'general',
                        analysisType: 'deep',
                        results: {
                            overallScore: matchPercentage,
                            similarityScore: 0,
                            keywordScore: matchPercentage,
                            matchedKeywords,
                            missingKeywords,
                            sections: {
                                hasEducation: true,
                                hasExperience: true,
                                hasProjects: true,
                                hasSkills: true,
                            },
                            actionVerbs,
                            hasQuantification: true,
                            aiSuggestions: aiAnalysis?.actionPlan || [],
                        },
                    });
                    console.log('   📊 Deep analysis saved to database');

                    // Increment user's deep analysis count
                    await User.findByIdAndUpdate(userId, {
                        $inc: { deepAnalysisCount: 1 },
                    });
                }
            } catch (saveError) {
                console.log('   ⚠️ Could not save analysis to database:', saveError);
            }

            // Use AI-provided score if available, fallback to keyword matching
            const aiScore = aiAnalysis?.resumeScore || matchPercentage;

            res.json({
                success: true,
                isAiPowered: true,
                analysis: {
                    matchPercentage: aiScore,  // Use AI score for deep analysis
                    keywordMatchPercentage: matchPercentage,  // Keep keyword match for reference
                    scoreBreakdown: aiAnalysis?.scoreBreakdown,
                    scoreJustification: aiAnalysis?.scoreJustification,
                    matchedKeywords,
                    missingKeywords,
                    stats: {
                        hardSkillsFound: matchedKeywords.length,
                        hardSkillsRequired: jobKeywords.length,
                        strongVerbsCount: actionVerbs.strong.length,
                        weakVerbsCount: actionVerbs.weak.length,
                    },
                    ai: aiAnalysis,
                }
            });

        } catch (error: any) {
            console.error('❌ Deep analysis error:', error);
            res.status(500).json({
                success: false,
                error: 'Deep analysis failed',
                details: error.message
            });
        }
    },

    // POST /api/analyze/parse-pdf - Extract text from PDF
    parsePdf: async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No PDF file uploaded. Use form-data with "resume" field.'
                });
            }

            const { parsePdfBuffer, cleanResumeText, formatAsStructuredResume, detectMNITTemplate } = await import('../services/pdf/pdfService.js');
            const pdfResult = await parsePdfBuffer(req.file.buffer);
            const cleanedText = cleanResumeText(pdfResult.text);

            // Determine template type: from user selection or auto-detect
            const userTemplateType = req.body?.templateType as string | undefined; // 'mnit' | 'other'
            const autoDetected = detectMNITTemplate(cleanedText);
            const templateType: 'mnit' | 'other' = userTemplateType === 'mnit' || userTemplateType === 'other'
                ? userTemplateType
                : (autoDetected ? 'mnit' : 'other');

            // Format text with template-aware structure
            const structuredText = formatAsStructuredResume(pdfResult.text, templateType);

            console.log(`📄 Parsed PDF: ${pdfResult.numPages} pages, ${structuredText.length} chars, template: ${templateType}${autoDetected ? ' (auto-detected)' : ''}`);

            res.json({
                success: true,
                data: {
                    text: structuredText,
                    rawText: cleanedText,  // Also send raw text for backward compat
                    numPages: pdfResult.numPages,
                    fileName: req.file.originalname,
                    fileSize: req.file.size,
                    info: pdfResult.info,
                    templateDetected: autoDetected,
                    templateType,
                }
            });

        } catch (error: any) {
            console.error('❌ PDF parsing error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to parse PDF',
                details: error.message
            });
        }
    },

    // GET /api/analyze/history
    getHistory: async (req: Request, res: Response) => {
        res.json({
            success: true,
            history: [],
            message: 'Analysis history feature coming soon'
        });
    },

    // GET /api/analyze/usage
    getUsage: async (req: Request, res: Response) => {
        res.json({
            success: true,
            usage: {
                simpleAnalysesUsed: 0,
                simpleAnalysesLimit: 'unlimited',
                deepAnalysesUsed: 0,
                deepAnalysesLimit: 3,
                remainingDeepAnalyses: 3,
            }
        });
    },

    // GET /api/roles
    getRoles: async (req: Request, res: Response) => {
        res.json({
            success: true,
            roles: [
                { id: 'sde', name: 'Software Development Engineer', keywords: ['algorithms', 'data structures', 'system design', 'api', 'git'] },
                { id: 'frontend', name: 'Frontend Developer', keywords: ['react', 'javascript', 'css', 'html', 'typescript'] },
                { id: 'backend', name: 'Backend Developer', keywords: ['node.js', 'python', 'api', 'database', 'docker'] },
                { id: 'fullstack', name: 'Full Stack Developer', keywords: ['react', 'node.js', 'mongodb', 'api', 'docker'] },
                { id: 'devops', name: 'DevOps Engineer', keywords: ['docker', 'kubernetes', 'aws', 'ci/cd', 'terraform'] },
                { id: 'data', name: 'Data Scientist', keywords: ['python', 'machine learning', 'sql', 'tensorflow', 'statistics'] },
                { id: 'ml', name: 'ML Engineer', keywords: ['pytorch', 'tensorflow', 'deep learning', 'mlops', 'python'] },
            ]
        });
    },
};
