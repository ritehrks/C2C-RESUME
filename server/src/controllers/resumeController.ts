// Resume Controller
// Handles CRUD operations and PDF generation for resumes

import { Request, Response } from 'express';
import { generatePdf, ResumeData } from '../services/latex/latexEngine.js';
import { Resume } from '../models/Resume.js';
import mongoose from 'mongoose';

export const resumeController = {
    // GET /api/resumes - Get all resumes (for dashboard)
    getAll: async (req: Request, res: Response) => {
        try {
            // For now, fetch all resumes (auth can be added later)
            // Select only fields needed for dashboard cards
            const resumes = await Resume.find()
                .select('_id name version templateId updatedAt createdAt')
                .sort({ updatedAt: -1 })
                .lean();

            console.log(`📋 Fetched ${resumes.length} resumes`);
            res.json({
                success: true,
                count: resumes.length,
                resumes
            });
        } catch (error: any) {
            console.error('❌ Error fetching resumes:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch resumes',
                details: error.message
            });
        }
    },

    // GET /api/resumes/:id - Get single resume with full content
    getOne: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // Validate MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid resume ID format'
                });
            }

            const resume = await Resume.findById(id).lean();

            if (!resume) {
                return res.status(404).json({
                    success: false,
                    error: 'Resume not found'
                });
            }

            console.log(`📄 Fetched resume: ${resume.name}`);
            res.json({
                success: true,
                resume
            });
        } catch (error: any) {
            console.error('❌ Error fetching resume:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch resume',
                details: error.message
            });
        }
    },

    // POST /api/resumes - Create new resume
    create: async (req: Request, res: Response) => {
        try {
            const resumeData = req.body;

            // Validate required fields
            if (!resumeData.name) {
                return res.status(400).json({
                    success: false,
                    error: 'Resume name is required'
                });
            }

            // Create new resume document
            // Note: userId should come from auth middleware in production
            const newResume = new Resume({
                userId: new mongoose.Types.ObjectId(), // Placeholder - replace with auth user ID
                name: resumeData.name,
                version: 1,
                templateId: resumeData.templateId || 'mnit_resume',
                content: resumeData.content || {
                    personalInfo: {},
                    education: [],
                    experience: [],
                    projects: [],
                    skills: { languages: [], frameworks: [], tools: [], databases: [] },
                    achievements: [],
                    certifications: [],
                    pors: [],
                },
            });

            const savedResume = await newResume.save();

            console.log(`✅ Created resume: ${savedResume.name} (ID: ${savedResume._id})`);
            res.status(201).json({
                success: true,
                message: 'Resume created successfully',
                resume: savedResume
            });
        } catch (error: any) {
            console.error('❌ Error creating resume:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create resume',
                details: error.message
            });
        }
    },

    // PUT /api/resumes/:id - Update existing resume
    update: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Validate MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid resume ID format'
                });
            }

            // Find and update, incrementing version
            const updatedResume = await Resume.findByIdAndUpdate(
                id,
                {
                    ...updateData,
                    $inc: { version: 1 } // Increment version on each save
                },
                { new: true, runValidators: true }
            );

            if (!updatedResume) {
                return res.status(404).json({
                    success: false,
                    error: 'Resume not found'
                });
            }

            console.log(`✏️ Updated resume: ${updatedResume.name} (v${updatedResume.version})`);
            res.json({
                success: true,
                message: 'Resume updated successfully',
                resume: updatedResume
            });
        } catch (error: any) {
            console.error('❌ Error updating resume:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update resume',
                details: error.message
            });
        }
    },

    // DELETE /api/resumes/:id - Delete resume
    delete: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // Validate MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid resume ID format'
                });
            }

            const deletedResume = await Resume.findByIdAndDelete(id);

            if (!deletedResume) {
                return res.status(404).json({
                    success: false,
                    error: 'Resume not found'
                });
            }

            console.log(`🗑️ Deleted resume: ${deletedResume.name}`);
            res.json({
                success: true,
                message: 'Resume deleted successfully',
                deletedId: id
            });
        } catch (error: any) {
            console.error('❌ Error deleting resume:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete resume',
                details: error.message
            });
        }
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

    // GET /api/resumes/:id/download - Download saved PDF
    downloadPdf: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // For now, fetch the resume and generate PDF on the fly
            // In production, you might store generated PDFs in cloud storage
            const resume = await Resume.findById(id);

            if (!resume) {
                return res.status(404).json({
                    success: false,
                    error: 'Resume not found'
                });
            }

            // TODO: If pdfUrl exists, redirect to it
            // For now, return info about the resume
            res.json({
                success: true,
                message: 'Use POST /api/resumes/generate-pdf to generate PDF',
                resumeId: id,
                resumeName: resume.name
            });
        } catch (error: any) {
            console.error('❌ Error downloading PDF:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to download PDF',
                details: error.message
            });
        }
    },
};
