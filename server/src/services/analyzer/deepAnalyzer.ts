// Deep Analyzer Service
// Uses Gemini API for AI-powered suggestions (rate limited: 3/day free)

import { GoogleGenerativeAI } from '@google/generative-ai';
import { runSimpleAnalysis, type SimpleAnalysisResult } from './simpleAnalyzer.js';
import { redis } from '../../config/redis.js';

// Three API keys for robust fallback
const API_KEY_1 = process.env.GOOGLE_API_KEY || '';
const API_KEY_2 = process.env.GOOGLE_API_KEY2 || '';
const API_KEY_3 = process.env.GOOGLE_API_KEY3 || '';

const genAI_1 = new GoogleGenerativeAI(API_KEY_1);
const genAI_2 = new GoogleGenerativeAI(API_KEY_2);
const genAI_3 = new GoogleGenerativeAI(API_KEY_3);

/**
 * Check if user has remaining deep analyses for today
 */
export async function checkDeepAnalysisLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date().toISOString().split('T')[0];
  const key = `deep_analysis:${userId}:${today}`;
  const usage = await redis.get(key);
  const usageCount = parseInt(usage || '0', 10);

  return {
    allowed: usageCount < 3,
    remaining: Math.max(0, 3 - usageCount),
  };
}

/**
 * Increment deep analysis usage counter
 */
async function incrementUsage(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const key = `deep_analysis:${userId}:${today}`;
  await redis.incr(key);
  await redis.expire(key, 86400); // Expire after 24 hours
}

/**
 * Run deep analysis using Gemini API
 * Includes all simple analysis features + AI-powered insights
 */
export async function runDeepAnalysis(
  resumeText: string,
  selectedRole: string,
  userId: string
): Promise<DeepAnalysisResult | { error: string }> {
  // 1. Check rate limit
  const limit = await checkDeepAnalysisLimit(userId);
  if (!limit.allowed) {
    return { error: 'Daily limit reached. Try again tomorrow!' };
  }

  // 2. Run simple analysis first
  const simpleResults = await runSimpleAnalysis(resumeText, selectedRole);

  // 3. Call Gemini for AI insights (with API key & model fallback)
  const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer and career coach. Analyze this resume for a ${selectedRole} position.

RESUME TEXT:
${resumeText}

⚠️ CRITICAL - PDF EXTRACTION LIMITATIONS:
- This text was auto-extracted from a PDF and contains artifacts like garbled characters, merged words, or symbols (e.g., 'B.Tech#'). These are extraction errors - NOT actual resume issues.
- The student uses a professional template that handles ALL visual formatting, hyperlinks, and layout automatically.
- NEVER give feedback on: formatting, visual layout, missing links/hyperlinks, font/spacing, ATS formatting. You cannot see any of these - they are handled by the template.
- ONLY give content-based feedback: projects, skills, keywords, quantification, achievements, missing technical content.

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
    "ATS keyword gaps only — do NOT mention formatting, links, or visual issues. Example: 'Add the keyword Docker to your skills section'"
  ],
  
  "competitiveEdge": "What makes this candidate unique or stand out for ${selectedRole} roles specifically"
}

Be specific, actionable, and reference actual content from the resume. Focus on ${selectedRole}-specific feedback.`;

  // Fallback chain: Try best model first with all keys, then next model, etc.
  // Priority: gemini-2.5-pro (all 3 keys) → gemini-3-flash-preview (all 3 keys) → gemini-2.5-flash (all 3 keys)
  const attempts = [
    { client: genAI_1, model: 'gemini-2.5-pro', label: 'Key1 + gemini-2.5-pro' },
    { client: genAI_2, model: 'gemini-2.5-pro', label: 'Key2 + gemini-2.5-pro' },
    { client: genAI_3, model: 'gemini-2.5-pro', label: 'Key3 + gemini-2.5-pro' },
    { client: genAI_1, model: 'gemini-3-flash-preview', label: 'Key1 + gemini-3-flash-preview' },
    { client: genAI_2, model: 'gemini-3-flash-preview', label: 'Key2 + gemini-3-flash-preview' },
    { client: genAI_3, model: 'gemini-3-flash-preview', label: 'Key3 + gemini-3-flash-preview' },
    { client: genAI_1, model: 'gemini-2.5-flash', label: 'Key1 + gemini-2.5-flash' },
    { client: genAI_2, model: 'gemini-2.5-flash', label: 'Key2 + gemini-2.5-flash' },
    { client: genAI_3, model: 'gemini-2.5-flash', label: 'Key3 + gemini-2.5-flash' },
  ];

  let aiResponse: any = {};
  let lastError: any = null;

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
    } catch (error: any) {
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
    analysisType: 'deep' as const,
    remainingDeepAnalyses: limit.remaining - 1,
  };
}

// Types
export interface DeepAnalysisResult extends SimpleAnalysisResult {
  // New comprehensive fields
  overallAssessment?: string;
  strengths?: string[];
  improvements?: string[];
  atsIssues?: string[];
  competitiveEdge?: string;
  // Existing fields
  aiSuggestions: string[];
  aiRewrites: Array<{ original: string; improved: string }>;
  grammarIssues: string[];
  missingElements: string[];
  analysisType: 'deep';
  remainingDeepAnalyses: number;
}

