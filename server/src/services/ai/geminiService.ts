// Gemini AI Service for Resume Analysis
// Provides deep AI-powered insights for resume optimization

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with API key
const getGeminiClient = () => {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        throw new Error('GOOGLE_API_KEY is not set in environment variables');
    }
    return new GoogleGenerativeAI(apiKey);
};

export interface DeepAnalysisResult {
    overallAssessment: string;
    strengthsAnalysis: string[];
    improvementAreas: string[];
    keywordOptimization: {
        strongMatches: string[];
        suggestedAdditions: string[];
        contextTips: string[];
    };
    contentSuggestions: {
        summary: string;
        experience: string;
        skills: string;
        achievements: string;
    };
    atsOptimization: string[];
    competitiveEdge: string;
    actionPlan: string[];
}

export async function runDeepAnalysisWithGemini(
    resumeText: string,
    jobDescription: string
): Promise<DeepAnalysisResult> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert ATS (Applicant Tracking System) specialist and career coach. Analyze the following resume against the job description and provide detailed, actionable feedback.

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
        const analysis: DeepAnalysisResult = JSON.parse(cleanedText);
        return analysis;

    } catch (error: any) {
        console.error('Gemini API Error:', error);

        // Return fallback structure if parsing fails
        if (error instanceof SyntaxError) {
            throw new Error('Failed to parse AI response. Please try again.');
        }

        throw error;
    }
}

// Quick AI feedback for specific sections
export async function getQuickFeedback(
    sectionType: 'summary' | 'experience' | 'skills' | 'achievements',
    content: string,
    targetRole: string
): Promise<string> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompts: Record<string, string> = {
        summary: `Improve this professional summary for a ${targetRole} position. Make it compelling and ATS-friendly:\n\n${content}\n\nProvide the improved version only.`,
        experience: `Enhance this work experience bullet point for a ${targetRole} position. Use strong action verbs and quantify achievements:\n\n${content}\n\nProvide the improved version only.`,
        skills: `Optimize this skills section for a ${targetRole} position. Ensure it's ATS-friendly and well-organized:\n\n${content}\n\nProvide the improved version only.`,
        achievements: `Rewrite this achievement to be more impactful for a ${targetRole} position. Quantify results where possible:\n\n${content}\n\nProvide the improved version only.`,
    };

    try {
        const result = await model.generateContent(prompts[sectionType]);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Gemini Quick Feedback Error:', error);
        throw new Error('Failed to get AI feedback');
    }
}

export default {
    runDeepAnalysisWithGemini,
    getQuickFeedback,
};
