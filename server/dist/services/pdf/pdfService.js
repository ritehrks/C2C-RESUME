"use strict";
// PDF Parsing Service
// Extracts text content from PDF files using pdf-parse
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePdfBuffer = parsePdfBuffer;
exports.cleanResumeText = cleanResumeText;
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
 */
function cleanResumeText(rawText) {
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
exports.default = {
    parsePdfBuffer,
    cleanResumeText,
};
//# sourceMappingURL=pdfService.js.map