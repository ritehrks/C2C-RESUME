// PDF Parsing Service
// Extracts text content from PDF files using pdf-parse

// @ts-ignore - pdf-parse doesn't have type definitions
import pdf from 'pdf-parse';

export interface PdfParseResult {
    text: string;
    numPages: number;
    info: {
        title?: string;
        author?: string;
        creationDate?: string;
    };
}

/**
 * Parse PDF buffer and extract text content
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<PdfParseResult> {
    try {
        const data = await pdf(buffer);

        return {
            text: data.text.trim(),
            numPages: data.numpages,
            info: {
                title: data.info?.Title,
                author: data.info?.Author,
                creationDate: data.info?.CreationDate,
            },
        };
    } catch (error: any) {
        console.error('PDF parsing error:', error);
        throw new Error(`Failed to parse PDF: ${error.message}`);
    }
}

/**
 * Clean and format extracted text for analysis
 * Handles OCR artifacts, special characters, and preserves structure
 */
export function cleanResumeText(rawText: string): string {
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
 * Detect if the resume was built using the MNIT template
 * Checks for known markers in the extracted text
 */
export function detectMNITTemplate(text: string): boolean {
    const markers = [
        /malaviya\s*national\s*institute/i,
        /mnit\s*jaipur/i,
        /roll\s*no\.?\s*:/i,
    ];
    // Need at least 2 markers to confirm MNIT template
    const matchCount = markers.filter(m => m.test(text)).length;
    return matchCount >= 2;
}

/**
 * Format extracted text as a structured resume with visual layout hints.
 * This preserves the template's section ordering and formatting so that
 * AI models can understand the visual layout from plain text alone.
 */
export function formatAsStructuredResume(rawText: string, templateType: 'mnit' | 'other'): string {
    const cleaned = cleanResumeText(rawText);

    if (templateType === 'other') {
        return formatGenericResume(cleaned);
    }

    return formatMNITResume(cleaned);
}

/**
 * Format text following the MNIT LaTeX template structure:
 *   Header (Logo + Name + Contact) → Education → Experience →
 *   Projects → Technical Skills → Positions of Responsibility → Achievements
 */
function formatMNITResume(text: string): string {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const sections = extractSectionsAdvanced(lines);

    let output = '';

    // ── Header ──────────────────────────────────────────
    if (sections.header.length > 0) {
        output += '┌─────────────────────────────────────────────────────┐\n';
        output += '│  [MNIT Jaipur Logo]                                 │\n';
        for (const line of sections.header) {
            output += `│  ${line.padEnd(52)}│\n`;
        }
        output += '└─────────────────────────────────────────────────────┘\n\n';
    }

    // ── Named sections in MNIT template order ──
    const sectionOrder = [
        { key: 'education', label: 'EDUCATION' },
        { key: 'experience', label: 'EXPERIENCE' },
        { key: 'projects', label: 'PERSONAL PROJECTS' },
        { key: 'skills', label: 'TECHNICAL SKILLS AND INTERESTS' },
        { key: 'positions', label: 'POSITIONS OF RESPONSIBILITY' },
        { key: 'achievements', label: 'ACHIEVEMENTS' },
    ];

    for (const { key, label } of sectionOrder) {
        const content = sections[key];
        if (content && content.length > 0) {
            output += `═══ ${label} ${'═'.repeat(Math.max(0, 48 - label.length))}\n`;
            for (const line of content) {
                // Indent bullet-point lines
                if (line.startsWith('•') || line.startsWith('-') || line.startsWith('▪')) {
                    output += `  ${line}\n`;
                } else {
                    output += `${line}\n`;
                }
            }
            output += '\n';
        }
    }

    return output.trim();
}

/**
 * Format text for non-template resumes — still adds structure but
 * without assuming MNIT section order
 */
function formatGenericResume(text: string): string {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const sections = extractSectionsAdvanced(lines);

    let output = '';

    // Header
    if (sections.header.length > 0) {
        output += '┌─────────────────────────────────────────────────────┐\n';
        for (const line of sections.header) {
            output += `│  ${line.padEnd(52)}│\n`;
        }
        output += '└─────────────────────────────────────────────────────┘\n\n';
    }

    // All detected sections in order found
    const genericOrder = ['education', 'experience', 'projects', 'skills', 'achievements', 'positions', 'summary', 'other'];
    const labelMap: Record<string, string> = {
        education: 'EDUCATION',
        experience: 'EXPERIENCE / INTERNSHIPS',
        projects: 'PROJECTS',
        skills: 'SKILLS',
        achievements: 'ACHIEVEMENTS / CERTIFICATIONS',
        positions: 'POSITIONS OF RESPONSIBILITY',
        summary: 'SUMMARY / OBJECTIVE',
        other: 'OTHER',
    };

    for (const key of genericOrder) {
        const content = sections[key];
        if (content && content.length > 0) {
            const label = labelMap[key] || key.toUpperCase();
            output += `═══ ${label} ${'═'.repeat(Math.max(0, 48 - label.length))}\n`;
            for (const line of content) {
                if (line.startsWith('•') || line.startsWith('-') || line.startsWith('▪')) {
                    output += `  ${line}\n`;
                } else {
                    output += `${line}\n`;
                }
            }
            output += '\n';
        }
    }

    return output.trim();
}

/**
 * Advanced section extractor — splits text into named sections
 * using common resume section header patterns
 */
function extractSectionsAdvanced(lines: string[]): Record<string, string[]> {
    const result: Record<string, string[]> = {
        header: [],
        education: [],
        experience: [],
        projects: [],
        skills: [],
        achievements: [],
        positions: [],
        summary: [],
        other: [],
    };

    const sectionMatchers: { key: string; pattern: RegExp }[] = [
        { key: 'education', pattern: /^(education|academic|qualification)/i },
        { key: 'experience', pattern: /^(experience|work\s*experience|employment|internship)/i },
        { key: 'projects', pattern: /^(personal\s*)?projects?/i },
        { key: 'skills', pattern: /^(technical\s*)?(skills|technologies|tech\s*stack|skills\s*and\s*interests)/i },
        { key: 'achievements', pattern: /^(achievements?|awards?|honors?|certifications?)/i },
        { key: 'positions', pattern: /^(positions?\s*of\s*responsibility|leadership|extra\s*curricular)/i },
        { key: 'summary', pattern: /^(summary|objective|profile|about\s*me)/i },
    ];

    let currentSection = 'header';
    let headerDone = false;

    for (const line of lines) {
        // Check if this line is a section header
        let matchedSection: string | null = null;
        // Section headers are usually short (< 60 chars) and don't contain many special chars
        if (line.length < 60) {
            for (const { key, pattern } of sectionMatchers) {
                if (pattern.test(line)) {
                    matchedSection = key;
                    break;
                }
            }
        }

        if (matchedSection) {
            headerDone = true;
            currentSection = matchedSection;
            // Don't add the header line itself — it's represented by the section marker
        } else {
            // First named section marks end of header region
            if (!headerDone && currentSection === 'header') {
                result.header.push(line);
            } else if (headerDone) {
                result[currentSection].push(line);
            } else {
                result.header.push(line);
            }
        }
    }

    return result;
}

/**
 * Extract sections from resume text (legacy, kept for backward compat)
 */
export function extractSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
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
    let sectionContent: string[] = [];

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

export default {
    parsePdfBuffer,
    cleanResumeText,
    formatAsStructuredResume,
    detectMNITTemplate,
    extractSections,
};

