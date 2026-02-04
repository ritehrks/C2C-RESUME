"use strict";
// PDF Parsing Service
// Extracts text content from PDF files using pdf-parse
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePdfBuffer = parsePdfBuffer;
exports.cleanResumeText = cleanResumeText;
exports.extractSections = extractSections;
// @ts-ignore - pdf-parse doesn't have type definitions
const pdf_parse_1 = __importDefault(require("pdf-parse"));
/**
 * Parse PDF buffer and extract text content
 */
async function parsePdfBuffer(buffer) {
    try {
        const data = await (0, pdf_parse_1.default)(buffer);
        return {
            text: data.text.trim(),
            numPages: data.numpages,
            info: {
                title: data.info?.Title,
                author: data.info?.Author,
                creationDate: data.info?.CreationDate,
            },
        };
    }
    catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error(`Failed to parse PDF: ${error.message}`);
    }
}
/**
 * Clean and format extracted text for analysis
 * Handles OCR artifacts, special characters, and preserves structure
 */
function cleanResumeText(rawText) {
    let cleaned = rawText;
    // 1. Remove common OCR/PDF artifacts and special characters
    cleaned = cleaned
        // Remove special Unicode characters that break parsing
        .replace(/[ƒ§ï†‡•·]/g, '')
        // Remove # that appears in roll numbers but keep for hashtags
        .replace(/(\d+)#/g, '$1')
        .replace(/#(\d+)/g, '$1')
        // Clean up email symbols
        .replace(/[^\S\r\n]?[@]\s*/g, '@')
        // Remove bullet point variations
        .replace(/[●○◀▶▪▫►◦‣⁃∙]/g, '• ')
        // Normalize dashes
        .replace(/[–—−]/g, '-')
        // Remove zero-width characters
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        // Remove control characters
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    // 2. Fix common PDF extraction issues
    cleaned = cleaned
        // Fix words split across lines (e.g., "What-\nsApp" -> "WhatsApp")
        .replace(/-\s*\n\s*/g, '')
        // Fix dates that got broken (e.g., "2024\n–\n2028" -> "2024 - 2028")
        .replace(/(\d{4})\s*[-–]\s*(\d{4}|\w+)/g, '$1 - $2')
        // Fix percentage formatting
        .replace(/(\d+)\s*%/g, '$1%')
        // Fix "+" in experience (e.g., "2\n+" -> "2+")
        .replace(/(\d+)\s*\+/g, '$1+');
    // 3. Normalize whitespace while preserving paragraph structure
    cleaned = cleaned
        // Normalize line breaks
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Remove page breaks
        .replace(/\f/g, '\n\n')
        // Collapse multiple spaces into one
        .replace(/[^\S\n]+/g, ' ')
        // Remove spaces at beginning/end of lines
        .replace(/^ +| +$/gm, '')
        // Collapse 3+ newlines into 2
        .replace(/\n{3,}/g, '\n\n')
        // Remove empty lines that only have whitespace
        .replace(/\n\s*\n/g, '\n\n');
    // 4. Identify and preserve section headers (common resume sections)
    const sectionHeaders = [
        'education', 'experience', 'work experience', 'projects',
        'skills', 'technical skills', 'achievements', 'certifications',
        'summary', 'objective', 'profile', 'positions of responsibility',
        'languages', 'awards', 'publications', 'interests', 'hobbies',
        'relevant coursework', 'areas of interest'
    ];
    // Add newlines before section headers for better structure
    sectionHeaders.forEach(header => {
        const regex = new RegExp(`([^\\n])\\s*(${header})\\s*`, 'gi');
        cleaned = cleaned.replace(regex, '$1\n\n$2\n');
    });
    // 5. Final cleanup
    cleaned = cleaned
        // Ensure text doesn't start/end with whitespace
        .trim()
        // Collapse any remaining multiple newlines
        .replace(/\n{3,}/g, '\n\n');
    return cleaned;
}
/**
 * Extract sections from resume text
 */
function extractSections(text) {
    const sections = {};
    const sectionPatterns = [
        { name: 'Education', pattern: /\b(education|academic)\b/i },
        { name: 'Experience', pattern: /\b(experience|work|employment|internship)\b/i },
        { name: 'Projects', pattern: /\bprojects?\b/i },
        { name: 'Skills', pattern: /\b(skills|technologies|tech stack)\b/i },
        { name: 'Achievements', pattern: /\b(achievements?|awards?)\b/i },
        { name: 'Summary', pattern: /\b(summary|objective|profile|about)\b/i },
    ];
    // Split by potential section headers
    const lines = text.split('\n');
    let currentSection = 'Header';
    let sectionContent = [];
    for (const line of lines) {
        let foundSection = false;
        for (const { name, pattern } of sectionPatterns) {
            if (pattern.test(line) && line.length < 50) {
                // Save previous section
                if (sectionContent.length > 0) {
                    sections[currentSection] = sectionContent.join('\n').trim();
                }
                currentSection = name;
                sectionContent = [];
                foundSection = true;
                break;
            }
        }
        if (!foundSection) {
            sectionContent.push(line);
        }
    }
    // Save last section
    if (sectionContent.length > 0) {
        sections[currentSection] = sectionContent.join('\n').trim();
    }
    return sections;
}
exports.default = {
    parsePdfBuffer,
    cleanResumeText,
    extractSections,
};
//# sourceMappingURL=pdfService.js.map