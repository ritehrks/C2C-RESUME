// Gemini AI Service for Resume Analysis
// Provides deep AI-powered insights for resume optimization

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with 3 API keys for robust fallback
const getGeminiClients = () => {
    const apiKey1 = process.env.GOOGLE_API_KEY;
    const apiKey2 = process.env.GOOGLE_API_KEY2;
    const apiKey3 = process.env.GOOGLE_API_KEY3;
    if (!apiKey1 && !apiKey2 && !apiKey3) {
        throw new Error('No GOOGLE_API_KEY is set in environment variables');
    }
    return [
        ...(apiKey1 ? [new GoogleGenerativeAI(apiKey1)] : []),
        ...(apiKey2 ? [new GoogleGenerativeAI(apiKey2)] : []),
        ...(apiKey3 ? [new GoogleGenerativeAI(apiKey3)] : []),
    ];
};

export interface DeepAnalysisResult {
    resumeScore: number;
    scoreBreakdown: {
        projectsAndExperience: number;
        technicalSkills: number;
        achievements: number;
        presentation: number;
    };
    scoreJustification: string;
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
    const clients = getGeminiClients();

    // Get current date for context
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const currentYear = now.getFullYear();


    const prompt = `You are an expert ATS (Applicant Tracking System) specialist and career coach specializing in helping BTech students with their resumes.

**TARGET AUDIENCE - VERY IMPORTANT:**
- This resume belongs to a BTech/B.E. STUDENT (typically 2nd, 3rd, or final year)
- They are applying for INTERNSHIPS or CAMPUS PLACEMENTS, NOT full-time jobs with years of experience
- Do NOT expect or ask for "years of professional experience" - they are students!
- Projects, hackathons, competitive programming, and academic achievements are their main showcase
- CGPA matters for students (8.0+ is good)
- College clubs, PORs (Positions of Responsibility), and extracurriculars are relevant

**WHAT MATTERS FOR STUDENTS:**
- 👨‍💻 Personal/Academic Projects (most important!)
- 🏆 Competitive Programming (LeetCode, Codeforces, CodeChef ratings)
- 🎯 Hackathon participation and wins
- 🌐 Open source contributions (GitHub, GSoC)
- 📚 Relevant coursework (DSA, DBMS, OS, CN, OOPs)
- 📊 CGPA (especially if > 8.0)
- 🏅 Technical achievements and certifications

**IMPORTANT CONTEXT:**
- Today's date is: ${currentDate}
- Current year is: ${currentYear}
- Do NOT flag recent dates as "future-dated"

**⚠️ CRITICAL - PDF EXTRACTION LIMITATIONS (READ THIS FIRST):**
- The resume text below was AUTO-EXTRACTED from a PDF. It contains text artifacts, scrambled characters, and extraction noise (e.g., 'B.Tech#', missing special characters, merged words)
- The student uses a PROFESSIONAL TEMPLATE that handles ALL formatting — fonts, colors, spacing, section layout, hyperlinks, columns. You cannot see this.
- **NEVER give feedback on:**
  - Visual formatting, layout, or design (you cannot see it)
  - Missing or broken hyperlinks (links ARE present in the actual PDF — extraction just strips them)
  - Formatting artifacts or garbled text (e.g., '#', merged words, 'B.Tech#') — these are extraction errors, NOT real resume issues
  - Contact info noise (e.g., extra characters in phone/email like 'ƒ', merged roll number/email) — these are extraction artifacts
  - Font choices, spacing, column layout, or visual presentation
  - ATS formatting concerns (the template is already ATS-optimized)
- **ONLY give feedback on:** CONTENT (projects, skills, experience, achievements, keywords) — things the student can actually change

**Role/Internship Description:**
${jobDescription}

**Student's Resume (with layout structure preserved):**
${resumeText}

Provide a comprehensive analysis tailored for a BTECH STUDENT in JSON format:

{
    "resumeScore": <YOUR_SCORE_0_TO_100>,
    "scoreBreakdown": {
        "projectsAndExperience": <SCORE_0_TO_100>,
        "technicalSkills": <SCORE_0_TO_100>,
        "achievements": <SCORE_0_TO_100>,
        "presentation": <SCORE_0_TO_100>
    },
    "scoreJustification": "Explain specifically what drove this score up or down based on THIS student's actual content.",
    "overallAssessment": "2-3 sentences on how well this STUDENT resume matches the internship/role. Consider their projects, skills, and learning potential.",
    "strengthsAnalysis": ["List 3-5 strengths with SPECIFIC evidence from the resume. Focus on: strong projects, CP ratings, hackathons, relevant skills, good CGPA, open source, etc."],
    "improvementAreas": ["List 3-5 content-only improvements. DO NOT suggest adding 'years of experience', fixing formatting, or adding links. Instead suggest: more projects, adding CP profiles, quantifying project impact, etc."],
    "keywordOptimization": {
        "strongMatches": ["Skills/keywords from the role that student has demonstrated"],
        "suggestedAdditions": ["Important technical skills they should add or learn"],
        "contextTips": ["How to naturally add these through projects or learning"]
    },
    "contentSuggestions": {
        "summary": "A student-appropriate objective/summary (not a professional summary with career highlights)",
        "experience": "How to better present projects and internships (if any)",
        "skills": "How to organize technical skills for ATS",
        "achievements": "How to highlight hackathons, CP achievements, academic awards"
    },
    "atsOptimization": ["5 keyword/content tips to improve ATS ranking. NO formatting advice - only content. Remember this is for a student."],
    "competitiveEdge": "What makes this student stand out? (projects, CP rating, open source, unique skills)",
    "actionPlan": ["5 immediate CONTENT actions. Examples: 'Add LeetCode profile link', 'Quantify project impact', 'Add hackathon achievements', 'Include CGPA if above 8', etc."]
}

IMPORTANT SCORING GUIDELINES:
- resumeScore must be an ACTUAL NUMBER (0-100) based on a genuine evaluation of THIS specific resume
- Scoring range: Poor fit = 30-50 | Average = 51-65 | Good = 66-79 | Excellent = 80-95
- Do NOT default to mid-range scores. Analyze the actual content and give a score that truly reflects the quality
- Score breakdown fields must also be actual numbers reflecting each sub-category quality

Return ONLY valid JSON, no additional text or markdown formatting.`;


    // Fallback chain: gemini-2.5-pro (all keys) → gemini-3-flash-preview (all keys) → gemini-2.5-flash (all keys)
    const models = ['gemini-2.5-pro', 'gemini-3-flash-preview', 'gemini-2.5-flash'];
    const attempts: { client: GoogleGenerativeAI; model: string; label: string }[] = [];
    for (const modelName of models) {
        clients.forEach((client, idx) => {
            attempts.push({ client, model: modelName, label: `Key${idx + 1} + ${modelName}` });
        });
    }

    let lastError: any = null;

    for (const attempt of attempts) {
        try {
            console.log(`🤖 Trying: ${attempt.label}`);
            const model = attempt.client.getGenerativeModel({ model: attempt.model });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log(`✅ Success with: ${attempt.label}`);

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
            const analysis: DeepAnalysisResult = JSON.parse(cleanedText);
            return analysis;

        } catch (error: any) {
            lastError = error;
            console.warn(`⚠️ ${attempt.label} failed:`, error.message);

            // If it's a JSON parse error, don't retry (response was received but malformed)
            if (error instanceof SyntaxError) {
                throw new Error('Failed to parse AI response. Please try again.');
            }

            // Retry on rate limit, server overload, OR transient network errors
            const isRetryable = error.status === 429 ||
                error.status === 503 ||  // Service Unavailable (temporary overload)
                error.status === 500 ||  // Internal Server Error (transient)
                error.message?.includes('429') ||
                error.message?.includes('503') ||
                error.message?.includes('RESOURCE_EXHAUSTED') ||
                error.message?.includes('quota') ||
                error.message?.includes('fetch failed') ||
                error.message?.includes('ECONNRESET') ||
                error.message?.includes('ETIMEDOUT') ||
                error.message?.includes('Service Unavailable') ||
                error.message?.includes('high demand') ||
                error.name === 'TypeError'; // network fetch errors

            if (!isRetryable) {
                console.error('❌ Non-recoverable error, stopping retry');
                break;
            }
            // Continue to next attempt in chain
        }
    }

    console.error('❌ All models and keys failed:', lastError);
    throw lastError || new Error('All API keys and models exhausted. Please try again later.');
}

// Quick AI feedback for specific sections
export async function getQuickFeedback(
    sectionType: 'summary' | 'experience' | 'skills' | 'achievements',
    content: string,
    targetRole: string
): Promise<string> {
    const clients = getGeminiClients();

    const prompts: Record<string, string> = {
        summary: `Improve this professional summary for a ${targetRole} position. Make it compelling and ATS-friendly:\n\n${content}\n\nProvide the improved version only.`,
        experience: `Enhance this work experience bullet point for a ${targetRole} position. Use strong action verbs and quantify achievements:\n\n${content}\n\nProvide the improved version only.`,
        skills: `Optimize this skills section for a ${targetRole} position. Ensure it's ATS-friendly and well-organized:\n\n${content}\n\nProvide the improved version only.`,
        achievements: `Rewrite this achievement to be more impactful for a ${targetRole} position. Quantify results where possible:\n\n${content}\n\nProvide the improved version only.`,
    };

    // Fallback chain: gemini-2.5-pro (all keys) → gemini-3-flash-preview (all keys) → gemini-2.5-flash (all keys)
    const models = ['gemini-2.5-pro', 'gemini-3-flash-preview', 'gemini-2.5-flash'];
    const attempts: { client: GoogleGenerativeAI; model: string; label: string }[] = [];
    for (const modelName of models) {
        clients.forEach((client, idx) => {
            attempts.push({ client, model: modelName, label: `Key${idx + 1} + ${modelName}` });
        });
    }

    let lastError: any = null;

    for (const attempt of attempts) {
        try {
            console.log(`🤖 Quick Feedback trying: ${attempt.label}`);
            const model = attempt.client.getGenerativeModel({ model: attempt.model });
            const result = await model.generateContent(prompts[sectionType]);
            const response = await result.response;
            console.log(`✅ Quick Feedback success with: ${attempt.label}`);
            return response.text().trim();
        } catch (error: any) {
            lastError = error;
            console.warn(`⚠️ Quick Feedback ${attempt.label} failed:`, error.message);

            const isRateLimitError = error.status === 429 ||
                error.message?.includes('429') ||
                error.message?.includes('RESOURCE_EXHAUSTED') ||
                error.message?.includes('quota');

            if (!isRateLimitError) {
                break;
            }
        }
    }

    console.error('❌ All Quick Feedback attempts failed:', lastError);
    throw new Error('Failed to get AI feedback. All API keys and models exhausted.');
}

export default {
    runDeepAnalysisWithGemini,
    getQuickFeedback,
};
