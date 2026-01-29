// Resume Controller
// Handles CRUD operations and PDF generation for resumes

import { Request, Response } from 'express';
import { generatePdf, ResumeData } from '../services/latex/latexEngine.js';

export const resumeController = {
    // GET /api/resumes - Get all user resumes
    getAll: async (req: Request, res: Response) => {
        // TODO: Fetch all resumes for authenticated user from MongoDB
        res.json({ message: 'Get all resumes', resumes: [] });
    },

    // GET /api/resumes/:id - Get single resume
    getOne: async (req: Request, res: Response) => {
        // TODO: Fetch single resume by ID from MongoDB
        res.json({ message: 'Get single resume', id: req.params.id });
    },

    // POST /api/resumes - Create new resume
    create: async (req: Request, res: Response) => {
        // TODO: Save resume to MongoDB
        res.json({ message: 'Create resume', data: req.body });
    },

    // PUT /api/resumes/:id - Update resume
    update: async (req: Request, res: Response) => {
        // TODO: Update resume in MongoDB
        res.json({ message: 'Update resume', id: req.params.id });
    },

    // DELETE /api/resumes/:id - Delete resume
    delete: async (req: Request, res: Response) => {
        // TODO: Delete resume from MongoDB
        res.json({ message: 'Delete resume', id: req.params.id });
    },

    // POST /api/resumes/generate-pdf - Generate PDF from resume data
    generatePdf: async (req: Request, res: Response) => {
        try {
            console.log('📥 Received PDF generation request');

            const resumeData: ResumeData = req.body;

            // Validate required fields
            if (!resumeData.name || !resumeData.email) {
                return res.status(400).json({
                    error: 'Missing required fields: name and email are required'
                });
            }

            // Generate PDF using LaTeX-On-HTTP API
            const pdfBuffer = await generatePdf(resumeData, 'mnit_resume');

            // Set response headers for PDF download
            const fileName = `${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Length', pdfBuffer.length);

            console.log('📤 Sending PDF to client');
            res.send(pdfBuffer);

        } catch (error: any) {
            console.error('❌ PDF generation error:', error);
            res.status(500).json({
                error: 'Failed to generate PDF',
                details: error.message
            });
        }
    },

    // GET /api/resumes/:id/download - Download saved PDF (for future use)
    downloadPdf: async (req: Request, res: Response) => {
        // TODO: Fetch and download saved PDF from storage
        res.json({ message: 'Download PDF', id: req.params.id });
    },
};
