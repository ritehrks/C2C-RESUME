"use strict";
// Gemini AI Service for Resume Analysis
// Provides deep AI-powered insights for resume optimization
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDeepAnalysisWithGemini = runDeepAnalysisWithGemini;
exports.getQuickFeedback = getQuickFeedback;
const generative_ai_1 = require("@google/generative-ai");
// Initialize Gemini with API key
const getGeminiClient = () => {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        throw new Error('GOOGLE_API_KEY is not set in environment variables');
    }
    return new generative_ai_1.GoogleGenerativeAI(apiKey);
};
async function runDeepAnalysisWithGemini(resumeText, jobDescription) {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    // Get current date for context
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const currentYear = now.getFullYear();
    const prompt = `You are an expert ATS (Applicant Tracking System) specialist and career coach. Analyze the following resume against the job description and provide detailed, actionable feedback.

**IMPORTANT CONTEXT:**
- Today's date is: ${currentDate}
- Current year is: ${currentYear}
- Dates from ${currentYear - 1} (${currentYear - 1}) and earlier are in the PAST, not the future
- Do NOT flag recent dates (2024, 2025, early 2026) as "future-dated" or inconsistent

**Job Description:**
${jobDescription}

**Resume:**
${resumeText}

Please provide a comprehensive analysis in the following JSON format. Be specific, actionable, and constructive:

{
    "overallAssessment": "A 2-3 sentence summary of how well this resume matches the job",
    "strengthsAnalysis": ["List 3-5 specific strengths of this resume for this role"],
    "improvementAreas": ["List 3-5 specific areas that need improvement"],
    "keywordOptimization": {
        "strongMatches": ["Keywords from the job that are well-represented in the resume"],
        "suggestedAdditions": ["Important keywords from the job that should be added to the resume"],
        "contextTips": ["Tips on how to naturally incorporate missing keywords"]
    },
    "contentSuggestions": {
        "summary": "Suggestion for a powerful professional summary tailored to this role",
        "experience": "How to better present work experience for this role",
        "skills": "How to optimize the skills section",
        "achievements": "How to quantify and highlight achievements"
    },
    "atsOptimization": ["5 specific tips to improve ATS parsing and ranking"],
    "competitiveEdge": "What would make this candidate stand out from other applicants",
    "actionPlan": ["Ordered list of 5 immediate actions to improve this resume"]
}

Return ONLY valid JSON, no additional text or markdown formatting.`;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Log token usage
        const usageMetadata = response.usageMetadata;
        if (usageMetadata) {
            console.log('');
            console.log('📊 ═══════════════════════════════════════════');
            console.log('   GEMINI API TOKEN USAGE');
            console.log('═══════════════════════════════════════════');
            console.log(`   📥 Input Tokens:  ${usageMetadata.promptTokenCount || 'N/A'}`);
            console.log(`   📤 Output Tokens: ${usageMetadata.candidatesTokenCount || 'N/A'}`);
            console.log(`   📦 Total Tokens:  ${usageMetadata.totalTokenCount || 'N/A'}`);
            console.log('═══════════════════════════════════════════');
            console.log('');
        }
        // Clean up the response - remove markdown code blocks if present
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.slice(7);
        }
        if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.slice(3);
        }
        if (cleanedText.endsWith('```')) {
            cleanedText = cleanedText.slice(0, -3);
        }
        cleanedText = cleanedText.trim();
        // Parse the JSON response
        const analysis = JSON.parse(cleanedText);
        return analysis;
    }
    catch (error) {
        console.error('Gemini API Error:', error);
        // Return fallback structure if parsing fails
        if (error instanceof SyntaxError) {
            throw new Error('Failed to parse AI response. Please try again.');
        }
        throw error;
    }
}
// Quick AI feedback for specific sections
async function getQuickFeedback(sectionType, content, targetRole) {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    const prompts = {
        summary: `Improve this professional summary for a ${targetRole} position. Make it compelling and ATS-friendly:\n\n${content}\n\nProvide the improved version only.`,
        experience: `Enhance this work experience bullet point for a ${targetRole} position. Use strong action verbs and quantify achievements:\n\n${content}\n\nProvide the improved version only.`,
        skills: `Optimize this skills section for a ${targetRole} position. Ensure it's ATS-friendly and well-organized:\n\n${content}\n\nProvide the improved version only.`,
        achievements: `Rewrite this achievement to be more impactful for a ${targetRole} position. Quantify results where possible:\n\n${content}\n\nProvide the improved version only.`,
    };
    try {
        const result = await model.generateContent(prompts[sectionType]);
        const response = await result.response;
        return response.text().trim();
    }
    catch (error) {
        console.error('Gemini Quick Feedback Error:', error);
        throw new Error('Failed to get AI feedback');
    }
}
exports.default = {
    runDeepAnalysisWithGemini,
    getQuickFeedback,
};
//# sourceMappingURL=geminiService.js.map