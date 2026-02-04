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
    summary?: string;
    location?: string;
    institution?: string;
}
declare function escapeLatex(text: string): string;
export declare function generatePdf(resumeData: ResumeData, templateName?: string): Promise<Buffer>;
declare const _default: {
    generatePdf: typeof generatePdf;
    escapeLatex: typeof escapeLatex;
};
export default _default;
//# sourceMappingURL=latexEngine.d.ts.map