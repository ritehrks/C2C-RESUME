"use strict";
// LaTeX Engine Service - Uses LaTeX-On-HTTP API (https://latex.ytotech.com)
// No local LaTeX installation required!
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePdf = generatePdf;
const mustache_1 = __importDefault(require("mustache"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const LATEX_API_URL = 'https://latex.ytotech.com/builds/sync';
// Escape special LaTeX characters
function escapeLatex(text) {
    if (!text)
        return '';
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
function escapeObject(obj) {
    if (typeof obj === 'string') {
        return escapeLatex(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => escapeObject(item));
    }
    if (typeof obj === 'object' && obj !== null) {
        const escaped = {};
        for (const key of Object.keys(obj)) {
            escaped[key] = escapeObject(obj[key]);
        }
        return escaped;
    }
    return obj;
}
// Convert resume data to MNIT template-friendly format
function prepareMnitTemplateData(data) {
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
        EXPERIENCES: escaped.experiences.map((exp) => ({
            COMPANY: exp.company,
            LOCATION: exp.location,
            ROLE: exp.role,
            DATES: exp.dates,
            ITEMS: exp.items.filter((item) => item.trim()),
        })),
        PROJECTS: escaped.projects.map((proj) => ({
            NAME: proj.name,
            DESCRIPTION: proj.description,
            DATES: proj.dates,
            TECHNOLOGIES: proj.technologies,
            ITEMS: proj.items.filter((item) => item.trim()),
        })),
        POSITIONS: escaped.positions.map((pos) => ({
            TITLE: pos.title,
            ORGANIZATION: pos.organization,
            TENURE: pos.tenure,
        })),
        ACHIEVEMENTS: escaped.achievements.map((ach) => ({
            TITLE: ach.title,
            DESCRIPTION: ach.description,
            DATE: ach.date,
        })),
    };
}
// Convert resume data to Generic ATS template-friendly format
function prepareGenericTemplateData(data) {
    const escaped = escapeObject(data);
    // Build educations array
    const educations = [];
    // Primary education (college/university)
    const years = escaped.educationYear?.split('-') || [];
    educations.push({
        INSTITUTION: escaped.institution || 'Your University',
        DEGREE: escaped.degree || 'Bachelor of Technology',
        BRANCH: escaped.course,
        START_YEAR: years[0] || '2020',
        END_YEAR: years[1] || '2024',
        CGPA: escaped.cgpa,
        PERCENTAGE: null,
    });
    // Secondary education (school) if exists
    if (escaped.schoolName) {
        educations.push({
            INSTITUTION: escaped.schoolName,
            DEGREE: 'Class XII',
            BRANCH: escaped.schoolBoard,
            START_YEAR: '',
            END_YEAR: escaped.schoolYear,
            CGPA: null,
            PERCENTAGE: escaped.schoolPercentage,
        });
    }
    const experiences = escaped.experiences?.map((exp) => ({
        COMPANY: exp.company,
        LOCATION: exp.location,
        ROLE: exp.role,
        DATES: exp.dates,
        ITEMS: exp.items.filter((item) => item.trim()),
    })) || [];
    const projects = escaped.projects?.map((proj) => ({
        NAME: proj.name,
        DESCRIPTION: proj.description,
        DATES: proj.dates,
        TECHNOLOGIES: proj.technologies,
        ITEMS: proj.items.filter((item) => item.trim()),
    })) || [];
    const positions = escaped.positions?.map((pos) => ({
        TITLE: pos.title,
        ORGANIZATION: pos.organization,
        TENURE: pos.tenure,
    })) || [];
    const achievements = escaped.achievements?.map((ach) => ({
        TITLE: ach.title,
        DESCRIPTION: ach.description,
        DATE: ach.date,
    })) || [];
    return {
        NAME: escaped.name,
        LOCATION: escaped.location || 'India',
        EMAIL: escaped.email,
        PHONE: escaped.phone,
        GITHUB_URL: escaped.githubUrl,
        LINKEDIN_URL: escaped.linkedinUrl,
        SUMMARY: escaped.summary,
        // Education
        EDUCATIONS: educations,
        // Skills
        LANGUAGES: escaped.languages,
        FRAMEWORKS: escaped.frameworks,
        DEV_TOOLS: escaped.devTools,
        CLOUD_DB: escaped.cloudDb,
        CORE_CS: escaped.coursework,
        SOFT_SKILLS: escaped.softSkills,
        // Dynamic sections with boolean flags for conditionals
        HAS_EXPERIENCES: experiences.length > 0,
        EXPERIENCES: experiences,
        HAS_PROJECTS: projects.length > 0,
        PROJECTS: projects,
        HAS_POSITIONS: positions.length > 0,
        POSITIONS: positions,
        HAS_ACHIEVEMENTS: achievements.length > 0,
        ACHIEVEMENTS: achievements,
    };
}
// Load and render the LaTeX template
function renderTemplate(templateName, data) {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.tex`);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    // Choose the right data transformer based on template
    const templateData = templateName === 'generic_ats_resume'
        ? prepareGenericTemplateData(data)
        : prepareMnitTemplateData(data);
    return mustache_1.default.render(templateContent, templateData);
}
// Helper function to fetch with timeout
async function fetchWithTimeout(url, options, timeoutMs = 30000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    }
    finally {
        clearTimeout(timeout);
    }
}
// Helper function to retry fetch with exponential backoff
async function fetchWithRetry(url, options, maxRetries = 3, timeoutMs = 30000) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`📡 Attempt ${attempt}/${maxRetries} to call LaTeX API...`);
            const response = await fetchWithTimeout(url, options, timeoutMs);
            return response;
        }
        catch (error) {
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
async function generatePdf(resumeData, templateName = 'mnit_resume') {
    // Render the LaTeX template with resume data
    const latexContent = renderTemplate(templateName, resumeData);
    console.log('📄 Rendered LaTeX template, calling API...');
    // Prepare resources array
    const resources = [
        {
            main: true,
            content: latexContent,
        },
    ];
    // For MNIT template, include the logo image
    if (templateName === 'mnit_resume') {
        try {
            const logoPath = path.join(__dirname, 'templates', 'images.jpg');
            const logoBuffer = fs.readFileSync(logoPath);
            const logoBase64 = logoBuffer.toString('base64');
            resources.push({
                path: 'logo.jpg',
                content: logoBase64,
                encoding: 'base64',
            });
            console.log('🖼️ Logo image included in PDF generation');
        }
        catch (error) {
            console.warn('⚠️ Could not load logo image:', error);
        }
    }
    // Prepare API request
    const requestBody = {
        compiler: 'pdflatex',
        resources: resources,
    };
    // Call LaTeX-On-HTTP API with retry logic and 30s timeout
    const response = await fetchWithRetry(LATEX_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    }, 3, // max retries
    30000 // 30 second timeout
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
exports.default = {
    generatePdf,
    escapeLatex,
};
//# sourceMappingURL=latexEngine.js.map