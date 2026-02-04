"use strict";
// Deep Analyzer Service
// Uses Gemini API for AI-powered suggestions (rate limited: 3/day free)
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDeepAnalysisLimit = checkDeepAnalysisLimit;
exports.runDeepAnalysis = runDeepAnalysis;
const generative_ai_1 = require("@google/generative-ai");
const simpleAnalyzer_js_1 = require("./simpleAnalyzer.js");
const redis_js_1 = require("../../config/redis.js");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
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
    // 3. Call Gemini for AI insights
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    const prompt = `
You are a resume expert. Analyze this ${selectedRole} resume and provide:
1. 3 specific suggestions to improve it
2. 2 bullet points that could be rewritten better (provide the rewrite)
3. Any grammar or tone issues
4. What's missing for this role

Resume:
${resumeText}

Return as JSON only (no markdown):
{
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "rewrites": [{"original": "original text", "improved": "improved text"}],
  "grammarIssues": ["issue1"],
  "missingElements": ["element1"]
}`;
    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        // Parse JSON from response (handle potential markdown wrapping)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const aiResponse = JSON.parse(jsonMatch?.[0] || '{}');
        // 4. Increment usage
        await incrementUsage(userId);
        return {
            ...simpleResults,
            aiSuggestions: aiResponse.suggestions || [],
            aiRewrites: aiResponse.rewrites || [],
            grammarIssues: aiResponse.grammarIssues || [],
            missingElements: aiResponse.missingElements || [],
            analysisType: 'deep',
            remainingDeepAnalyses: limit.remaining - 1,
        };
    }
    catch (error) {
        console.error('Gemini API error:', error);
        return { error: 'AI analysis failed. Please try again.' };
    }
}
//# sourceMappingURL=deepAnalyzer.js.map