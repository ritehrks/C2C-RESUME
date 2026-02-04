"use strict";
// Deep Analyzer Service
// Uses Gemini API for AI-powered suggestions (rate limited: 3/day free)
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDeepAnalysisLimit = checkDeepAnalysisLimit;
exports.runDeepAnalysis = runDeepAnalysis;
const generative_ai_1 = require("@google/generative-ai");
const simpleAnalyzer_js_1 = require("./simpleAnalyzer.js");
const redis_js_1 = require("../../config/redis.js");
// Primary and secondary API keys for fallback
const PRIMARY_API_KEY = process.env.GEMINI_API_KEY || '';
const SECONDARY_API_KEY = 'AIzaSyA-PPa7ToeVtN4P0mflKT5vUdKY4B795ow';
const genAI_Primary = new generative_ai_1.GoogleGenerativeAI(PRIMARY_API_KEY);
const genAI_Secondary = new generative_ai_1.GoogleGenerativeAI(SECONDARY_API_KEY);
/**
 * Check if user has remaining deep analyses for today
 */
async function checkDeepAnalysisLimit(userId) {
    const today = new Date().toISOString().split('T')[0];
    const key = `deep_analysis:${userId}:${today}`;
    const usage = await redis_js_1.redis.get(key);
    const usageCount = parseInt(usage || '0', 10);
    return {
        allowed: usageCount < 3,
        remaining: Math.max(0, 3 - usageCount),
    };
}
/**
 * Increment deep analysis usage counter
 */
async function incrementUsage(userId) {
    const today = new Date().toISOString().split('T')[0];
    const key = `deep_analysis:${userId}:${today}`;
    await redis_js_1.redis.incr(key);
    await redis_js_1.redis.expire(key, 86400); // Expire after 24 hours
}
/**
 * Run deep analysis using Gemini API
 * Includes all simple analysis features + AI-powered insights
 */
async function runDeepAnalysis(resumeText, selectedRole, userId) {
    // 1. Check rate limit
    const limit = await checkDeepAnalysisLimit(userId);
    if (!limit.allowed) {
        return { error: 'Daily limit reached. Try again tomorrow!' };
    }
    // 2. Run simple analysis first
    const simpleResults = await (0, simpleAnalyzer_js_1.runSimpleAnalysis)(resumeText, selectedRole);
    // 3. Call Gemini for AI insights (with API key & model fallback)
    const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer and career coach. Analyze this resume for a ${selectedRole} position.

RESUME TEXT:
${resumeText}

ANALYSIS CONTEXT:
- Target Role: ${selectedRole}
- Keywords Matched: ${simpleResults.matchedKeywords.length}/${simpleResults.matchedKeywords.length + simpleResults.missingKeywords.length}
- Current Score: ${simpleResults.overallScore}%

Provide a comprehensive analysis in the following JSON format ONLY (no markdown, no code blocks):

{
  "overallAssessment": "A 2-3 sentence executive summary of the candidate's fit for ${selectedRole}. Be specific about their strengths relative to this role.",
  
  "strengths": [
    "Specific strength 1 with evidence from resume",
    "Specific strength 2 with evidence from resume",
    "Specific strength 3 with evidence from resume",
    "Specific strength 4 with evidence from resume"
  ],
  
  "improvements": [
    "Specific actionable improvement 1",
    "Specific actionable improvement 2", 
    "Specific actionable improvement 3",
    "Specific actionable improvement 4"
  ],
  
  "rewrites": [
    {
      "original": "Exact text from resume that could be improved",
      "improved": "Better version with action verbs and quantification"
    },
    {
      "original": "Another weak bullet point",
      "improved": "Stronger version with impact metrics"
    }
  ],
  
  "missingElements": [
    "Critical skill or section missing for ${selectedRole}",
    "Another missing element"
  ],
  
  "atsIssues": [
    "Any ATS-specific formatting or keyword issues"
  ],
  
  "competitiveEdge": "What makes this candidate unique or stand out for ${selectedRole} roles specifically"
}

Be specific, actionable, and reference actual content from the resume. Focus on ${selectedRole}-specific feedback.`;
    // Fallback chain: Primary API (best model) → Secondary API (best model) → Secondary API (2.5-flash)
    const attempts = [
        { client: genAI_Primary, model: 'gemini-3-flash-preview', label: 'Primary API + gemini-3-flash' },
        { client: genAI_Secondary, model: 'gemini-3-flash-preview', label: 'Secondary API + gemini-3-flash' },
        { client: genAI_Secondary, model: 'gemini-2.5-flash', label: 'Secondary API + gemini-2.5-flash' },
    ];
    let aiResponse = {};
    let lastError = null;
    for (const attempt of attempts) {
        try {
            console.log(`🤖 Trying: ${attempt.label}`);
            const model = attempt.client.getGenerativeModel({ model: attempt.model });
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            // Parse JSON from response (handle potential markdown wrapping)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            aiResponse = JSON.parse(jsonMatch?.[0] || '{}');
            console.log(`✅ Success with: ${attempt.label}`);
            break; // Success, exit loop
        }
        catch (error) {
            lastError = error;
            console.warn(`⚠️ ${attempt.label} failed:`, error.message);
            // Only retry on rate limit (429) or resource exhausted errors
            const isRateLimitError = error.status === 429 ||
                error.message?.includes('429') ||
                error.message?.includes('RESOURCE_EXHAUSTED') ||
                error.message?.includes('quota');
            if (!isRateLimitError) {
                // Not a rate limit error, don't try fallback
                console.error('❌ Non-recoverable error, stopping retry');
                break;
            }
            // Continue to next model in chain
        }
    }
    // Check if we got a valid response
    if (!aiResponse.strengths && !aiResponse.improvements && lastError) {
        console.error('❌ All models failed:', lastError);
        return { error: 'Server busy. Please try again in a few minutes.' };
    }
    // 4. Increment usage
    await incrementUsage(userId);
    return {
        ...simpleResults,
        // New AI response fields
        overallAssessment: aiResponse.overallAssessment || '',
        strengths: aiResponse.strengths || [],
        improvements: aiResponse.improvements || [],
        aiRewrites: aiResponse.rewrites || [],
        missingElements: aiResponse.missingElements || [],
        atsIssues: aiResponse.atsIssues || [],
        competitiveEdge: aiResponse.competitiveEdge || '',
        // Legacy compatibility
        aiSuggestions: aiResponse.improvements || aiResponse.suggestions || [],
        grammarIssues: aiResponse.atsIssues || aiResponse.grammarIssues || [],
        analysisType: 'deep',
        remainingDeepAnalyses: limit.remaining - 1,
    };
}
//# sourceMappingURL=deepAnalyzer.js.map