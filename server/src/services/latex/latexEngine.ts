// LaTeX Engine Service - Uses LaTeX-On-HTTP API (https://latex.ytotech.com)
// No local LaTeX installation required!

import Mustache from 'mustache';
import * as fs from 'fs';
import * as path from 'path';

const LATEX_API_URL = 'https://latex.ytotech.com/builds/sync';

// Resume data interface matching frontend
export interface ResumeData {
    name: string;
    course: string;
    roll: string;
    phone: string;
    email: string;
    collegeEmail: string;
    degree: string;
    githubUrl: string;
    linkedinUrl: string;
    cgpa: string;
    educationYear: string;
    schoolName: string;
    schoolPercentage: string;
    schoolBoard: string;
    schoolYear: string;
    languages: string;
    devTools: string;
    frameworks: string;
    cloudDb: string;
    softSkills: string;
    coursework: string;
    interests: string;
    experiences: {
        company: string;
        location: string;
        role: string;
        dates: string;
        items: string[];
    }[];
    projects: {
        name: string;
        description: string;
        dates: string;
        technologies: string;
        items: string[];
    }[];
    positions: {
        title: string;
        organization: string;
        tenure: string;
    }[];
    achievements: {
        title: string;
        description: string;
        date: string;
    }[];
}

// Escape special LaTeX characters
function escapeLatex(text: string): string {
    if (!text) return '';
    return text
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');
}

// Escape all fields in an object recursively
function escapeObject(obj: any): any {
    if (typeof obj === 'string') {
        return escapeLatex(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => escapeObject(item));
    }
    if (typeof obj === 'object' && obj !== null) {
        const escaped: any = {};
        for (const key of Object.keys(obj)) {
            escaped[key] = escapeObject(obj[key]);
        }
        return escaped;
    }
    return obj;
}

// Convert resume data to template-friendly format
function prepareTemplateData(data: ResumeData): any {
    const escaped = escapeObject(data);

    return {
        NAME: escaped.name,
        COURSE: escaped.course,
        ROLL: escaped.roll,
        PHONE: escaped.phone,
        EMAIL: escaped.email,
        COLLEGE_EMAIL: escaped.collegeEmail,
        DEGREE: escaped.degree,
        GITHUB_URL: escaped.githubUrl,
        LINKEDIN_URL: escaped.linkedinUrl,
        CGPA: escaped.cgpa,
        EDUCATION_YEAR: escaped.educationYear,
        // School section (conditional)
        SCHOOL: escaped.schoolName ? [{
            SCHOOL_NAME: escaped.schoolName,
            SCHOOL_PERCENTAGE: escaped.schoolPercentage,
            SCHOOL_BOARD: escaped.schoolBoard,
            SCHOOL_YEAR: escaped.schoolYear,
        }] : [],
        // Skills
        LANGUAGES: escaped.languages,
        DEV_TOOLS: escaped.devTools,
        FRAMEWORKS: escaped.frameworks,
        CLOUD_DB: escaped.cloudDb,
        SOFT_SKILLS: escaped.softSkills,
        COURSEWORK: escaped.coursework,
        INTERESTS: escaped.interests,
        // Dynamic sections
        EXPERIENCES: escaped.experiences.map((exp: any) => ({
            COMPANY: exp.company,
            LOCATION: exp.location,
            ROLE: exp.role,
            DATES: exp.dates,
            ITEMS: exp.items.filter((item: string) => item.trim()),
        })),
        PROJECTS: escaped.projects.map((proj: any) => ({
            NAME: proj.name,
            DESCRIPTION: proj.description,
            DATES: proj.dates,
            TECHNOLOGIES: proj.technologies,
            ITEMS: proj.items.filter((item: string) => item.trim()),
        })),
        POSITIONS: escaped.positions.map((pos: any) => ({
            TITLE: pos.title,
            ORGANIZATION: pos.organization,
            TENURE: pos.tenure,
        })),
        ACHIEVEMENTS: escaped.achievements.map((ach: any) => ({
            TITLE: ach.title,
            DESCRIPTION: ach.description,
            DATE: ach.date,
        })),
    };
}

// Load and render the LaTeX template
function renderTemplate(templateName: string, data: ResumeData): string {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.tex`);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');

    const templateData = prepareTemplateData(data);

    // Configure Mustache to use {{ }} delimiters (already default)
    // But we need to handle the LaTeX-style delimiters in our template
    // Our template uses {{{VAR}}} for unescaped and {{#SECTION}}...{{/SECTION}} for sections

    return Mustache.render(templateContent, templateData);
}

// Helper function to fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 30000): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeout);
    }
}

// Helper function to retry fetch with exponential backoff
async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries: number = 3,
    timeoutMs: number = 30000
): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`📡 Attempt ${attempt}/${maxRetries} to call LaTeX API...`);
            const response = await fetchWithTimeout(url, options, timeoutMs);
            return response;
        } catch (error: any) {
            lastError = error;
            console.error(`⚠️ Attempt ${attempt} failed:`, error.message || error);

            if (attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                console.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError || new Error('All retry attempts failed');
}

// Generate PDF using LaTeX-On-HTTP API
export async function generatePdf(resumeData: ResumeData, templateName: string = 'mnit_resume'): Promise<Buffer> {
    // Render the LaTeX template with resume data
    const latexContent = renderTemplate(templateName, resumeData);

    console.log('📄 Rendered LaTeX template, calling API...');

    // Prepare API request
    const requestBody = {
        compiler: 'pdflatex',
        resources: [
            {
                main: true,
                content: latexContent,
            },
        ],
    };

    // Call LaTeX-On-HTTP API with retry logic and 30s timeout
    const response = await fetchWithRetry(
        LATEX_API_URL,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        },
        3,  // max retries
        30000  // 30 second timeout
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ LaTeX API Error:', errorText);
        throw new Error(`LaTeX compilation failed: ${response.status} - ${errorText}`);
    }

    console.log('✅ PDF generated successfully!');

    // Return the PDF as a buffer
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export default {
    generatePdf,
    escapeLatex,
};
