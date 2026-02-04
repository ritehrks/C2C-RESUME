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

**PDF EXTRACTION NOTE:**
- Resume text was auto-extracted from PDF - ignore any special character artifacts
- Focus on CONTENT, KEYWORDS, and SKILLS - not formatting

**Role/Internship Description:**
${jobDescription}

**Student's Resume:**
${resumeText}

Provide a comprehensive analysis tailored for a BTECH STUDENT in JSON format:

{
    "resumeScore": 75,
    "scoreBreakdown": {
        "projectsAndExperience": 80,
        "technicalSkills": 70,
        "achievements": 65,
        "presentation": 75
    },
    "scoreJustification": "Brief explanation of why you gave this score. Be fair - most good student resumes should score 60-85.",
    "overallAssessment": "2-3 sentences on how well this STUDENT resume matches the internship/role. Consider their projects, skills, and learning potential.",
    "strengthsAnalysis": ["List 3-5 strengths. Focus on: strong projects, CP ratings, hackathons, relevant skills, good CGPA, open source, etc."],
    "improvementAreas": ["List 3-5 areas for improvement. DO NOT suggest adding 'years of experience'. Instead suggest: more projects, adding CP profiles, quantifying project impact, etc."],
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
    "atsOptimization": ["5 tips to improve ATS ranking - focus on keywords, project descriptions, skills section. Remember this is for a student."],
    "competitiveEdge": "What makes this student stand out? (projects, CP rating, open source, unique skills)",
    "actionPlan": ["5 immediate actions. Examples: 'Add LeetCode profile link', 'Quantify project impact', 'Add hackathon achievements', 'Include CGPA if above 8', etc."]
}

IMPORTANT SCORING GUIDELINES:
- resumeScore should be 0-100, representing how strong this student's resume is for the target role
- Be realistic: Average good student resume = 65-75, Exceptional = 80-90, Poor = below 50
- Score breakdown should reflect: projects quality, skills relevance, achievements, and formatting

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
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

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
