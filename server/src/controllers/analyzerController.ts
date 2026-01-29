// Analyzer Controller
// Implements Simple and Deep analysis endpoints

import { Request, Response } from 'express';

// Common tech keywords for matching
const TECH_KEYWORDS = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'django', 'flask', 'spring', 'fastapi',
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'dynamodb', 'firebase',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible',
    'git', 'github', 'gitlab', 'ci/cd', 'devops', 'agile', 'scrum',
    'rest', 'graphql', 'grpc', 'microservices', 'api', 'websocket',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'material-ui',
    'machine learning', 'deep learning', 'ai', 'nlp', 'tensorflow', 'pytorch',
    'sql', 'nosql', 'orm', 'prisma', 'sequelize', 'mongoose',
    'linux', 'unix', 'bash', 'shell', 'powershell',
    'testing', 'jest', 'mocha', 'pytest', 'selenium', 'cypress',
];

// Action verbs that ATS systems look for
const STRONG_ACTION_VERBS = [
    'achieved', 'implemented', 'developed', 'designed', 'led', 'managed', 'created',
    'built', 'launched', 'improved', 'increased', 'reduced', 'optimized', 'spearheaded',
    'engineered', 'architected', 'mentored', 'delivered', 'transformed', 'automated',
    'streamlined', 'integrated', 'established', 'pioneered', 'executed', 'orchestrated',
];

const WEAK_ACTION_VERBS = [
    'helped', 'assisted', 'worked on', 'was responsible for', 'participated in',
    'involved in', 'handled', 'dealt with', 'familiar with', 'exposure to',
];

// Extract keywords from text (normalized)
function extractKeywords(text: string): string[] {
    const normalized = text.toLowerCase();
    const found: string[] = [];

    TECH_KEYWORDS.forEach(keyword => {
        if (normalized.includes(keyword.toLowerCase())) {
            found.push(keyword);
        }
    });

    return [...new Set(found)];
}

// Check for action verbs
function analyzeActionVerbs(text: string): { strong: string[], weak: string[] } {
    const normalized = text.toLowerCase();

    const strong = STRONG_ACTION_VERBS.filter(verb =>
        normalized.includes(verb.toLowerCase())
    );

    const weak = WEAK_ACTION_VERBS.filter(verb =>
        normalized.includes(verb.toLowerCase())
    );

    return { strong, weak };
}

// Calculate match percentage
function calculateMatch(resumeKeywords: string[], jobKeywords: string[]): number {
    if (jobKeywords.length === 0) return 0;

    const matched = resumeKeywords.filter(rk =>
        jobKeywords.some(jk => jk.toLowerCase() === rk.toLowerCase())
    );

    return Math.round((matched.length / jobKeywords.length) * 100);
}

export const analyzerController = {
    // POST /api/analyze/simple - Run simple analysis (FREE, unlimited)
    runSimpleAnalysis: async (req: Request, res: Response) => {
        try {
            const { resumeText, jobDescription } = req.body;

            if (!resumeText || !jobDescription) {
                return res.status(400).json({
                    success: false,
                    error: 'Both resumeText and jobDescription are required'
                });
            }

            console.log('📊 Running simple analysis...');

            // Extract keywords from both
            const resumeKeywords = extractKeywords(resumeText);
            const jobKeywords = extractKeywords(jobDescription);

            // Find matches and gaps
            const matchedKeywords = resumeKeywords.filter(rk =>
                jobKeywords.some(jk => jk.toLowerCase() === rk.toLowerCase())
            );
            const missingKeywords = jobKeywords.filter(jk =>
                !resumeKeywords.some(rk => rk.toLowerCase() === jk.toLowerCase())
            );

            // Analyze action verbs
            const actionVerbs = analyzeActionVerbs(resumeText);

            // Calculate overall match
            const matchPercentage = calculateMatch(resumeKeywords, jobKeywords);

            // Determine rating
            let rating: string;
            let ratingLabel: string;
            if (matchPercentage >= 80) {
                rating = 'excellent';
                ratingLabel = 'Excellent Match';
            } else if (matchPercentage >= 60) {
                rating = 'good';
                ratingLabel = 'Good Match';
            } else if (matchPercentage >= 40) {
                rating = 'fair';
                ratingLabel = 'Fair Match';
            } else {
                rating = 'needs_work';
                ratingLabel = 'Needs Improvement';
            }

            // Generate suggestions
            const suggestions: string[] = [];

            if (missingKeywords.length > 0) {
                suggestions.push(`Add these missing keywords: ${missingKeywords.slice(0, 5).join(', ')}`);
            }

            if (actionVerbs.weak.length > 0) {
                suggestions.push(`Replace weak verbs like "${actionVerbs.weak[0]}" with stronger action verbs`);
            }

            if (actionVerbs.strong.length < 5) {
                suggestions.push('Use more strong action verbs to describe your achievements');
            }

            if (!resumeText.toLowerCase().includes('quantif') && !resumeText.match(/\d+%/)) {
                suggestions.push('Add quantifiable achievements (e.g., "improved performance by 30%")');
            }

            const result = {
                success: true,
                analysis: {
                    matchPercentage,
                    rating,
                    ratingLabel,
                    resumeKeywords,
                    jobKeywords,
                    matchedKeywords,
                    missingKeywords,
                    actionVerbs,
                    suggestions,
                    stats: {
                        hardSkillsFound: matchedKeywords.length,
                        hardSkillsRequired: jobKeywords.length,
                        strongVerbsCount: actionVerbs.strong.length,
                        weakVerbsCount: actionVerbs.weak.length,
                    }
                }
            };

            console.log(`✅ Analysis complete: ${matchPercentage}% match`);
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
            const { resumeText, jobDescription } = req.body;

            if (!resumeText || !jobDescription) {
                return res.status(400).json({
                    success: false,
                    error: 'Both resumeText and jobDescription are required'
                });
            }

            console.log('🤖 Running deep AI analysis with Gemini...');

            // Check if API key is configured
            if (!process.env.GOOGLE_API_KEY) {
                console.log('⚠️ GOOGLE_API_KEY not set, returning fallback analysis');

                // Run simple analysis as fallback
                const resumeKeywords = extractKeywords(resumeText);
                const jobKeywords = extractKeywords(jobDescription);
                const matchedKeywords = resumeKeywords.filter(rk =>
                    jobKeywords.some(jk => jk.toLowerCase() === rk.toLowerCase())
                );
                const missingKeywords = jobKeywords.filter(jk =>
                    !resumeKeywords.some(rk => rk.toLowerCase() === jk.toLowerCase())
                );
                const matchPercentage = calculateMatch(resumeKeywords, jobKeywords);

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
            const jobKeywords = extractKeywords(jobDescription);
            const matchedKeywords = resumeKeywords.filter(rk =>
                jobKeywords.some(jk => jk.toLowerCase() === rk.toLowerCase())
            );
            const missingKeywords = jobKeywords.filter(jk =>
                !resumeKeywords.some(rk => rk.toLowerCase() === jk.toLowerCase())
            );
            const matchPercentage = calculateMatch(resumeKeywords, jobKeywords);
            const actionVerbs = analyzeActionVerbs(resumeText);

            console.log('✅ AI Deep analysis complete');

            res.json({
                success: true,
                isAiPowered: true,
                analysis: {
                    // Simple analysis stats
                    matchPercentage,
                    matchedKeywords,
                    missingKeywords,
                    stats: {
                        hardSkillsFound: matchedKeywords.length,
                        hardSkillsRequired: jobKeywords.length,
                        strongVerbsCount: actionVerbs.strong.length,
                        weakVerbsCount: actionVerbs.weak.length,
                    },
                    // AI-powered insights
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

    // POST /api/analyze/parse-pdf - Extract text from PDF (placeholder)
    parsePdf: async (req: Request, res: Response) => {
        res.json({
            success: false,
            message: 'PDF parsing requires file upload - use form-data with "file" field',
            note: 'For now, paste resume text directly in the analyzer'
        });
    },

    // GET /api/analyze/history - Get analysis history
    getHistory: async (req: Request, res: Response) => {
        res.json({
            success: true,
            history: [],
            message: 'Analysis history feature coming soon'
        });
    },

    // GET /api/analyze/usage - Check remaining deep analyses
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

    // GET /api/roles - Get all supported roles
    getRoles: async (req: Request, res: Response) => {
        res.json({
            success: true,
            roles: [
                { id: 'sde', name: 'Software Development Engineer', keywords: ['javascript', 'react', 'node.js', 'api', 'git'] },
                { id: 'frontend', name: 'Frontend Developer', keywords: ['react', 'javascript', 'css', 'html', 'typescript'] },
                { id: 'backend', name: 'Backend Developer', keywords: ['node.js', 'python', 'api', 'database', 'docker'] },
                { id: 'fullstack', name: 'Full Stack Developer', keywords: ['react', 'node.js', 'mongodb', 'api', 'docker'] },
                { id: 'devops', name: 'DevOps Engineer', keywords: ['docker', 'kubernetes', 'aws', 'ci/cd', 'terraform'] },
                { id: 'data', name: 'Data Scientist', keywords: ['python', 'machine learning', 'sql', 'tensorflow', 'statistics'] },
            ]
        });
    },
};
