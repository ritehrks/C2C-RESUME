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
export declare function parsePdfBuffer(buffer: Buffer): Promise<PdfParseResult>;
/**
 * Clean and format extracted text for analysis
 */
export declare function cleanResumeText(rawText: string): string;
declare const _default: {
    parsePdfBuffer: typeof parsePdfBuffer;
    cleanResumeText: typeof cleanResumeText;
};
export default _default;
//# sourceMappingURL=pdfService.d.ts.map