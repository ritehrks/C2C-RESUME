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
 */
export function cleanResumeText(rawText: string): string {
    return rawText
        // Remove excessive whitespace
        .replace(/\s+/g, ' ')
        // Remove page breaks
        .replace(/\f/g, '\n')
        // Normalize line breaks
        .replace(/\n\s*\n/g, '\n\n')
        // Trim
        .trim();
}

export default {
    parsePdfBuffer,
    cleanResumeText,
};
