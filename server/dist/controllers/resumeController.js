"use strict";
// Resume Controller
// Handles CRUD operations and PDF generation for resumes
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeController = void 0;
const latexEngine_js_1 = require("../services/latex/latexEngine.js");
const Resume_js_1 = require("../models/Resume.js");
const User_js_1 = require("../models/User.js");
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'c2c-resume-secret-key-change-in-production';
// Helper to get user ID from request (dev mode or JWT)
const getUserId = async (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            return decoded.userId;
        }
        catch {
            return null;
        }
    }
    // In dev mode, return the dev user's ID
    if (process.env.NODE_ENV !== 'production') {
        const devUser = await User_js_1.User.findOne({ email: 'dev@c2c.mnit.ac.in' });
        return devUser?._id.toString() || null;
    }
    return null;
};
exports.resumeController = {
    // GET /api/resumes - Get all resumes (for dashboard)
    getAll: async (req, res) => {
        try {
            const userId = await getUserId(req);
            // Build query - in dev without auth, show all; otherwise filter by user
            const query = userId ? { userId: new mongoose_1.default.Types.ObjectId(userId) } : {};
            const resumes = await Resume_js_1.Resume.find(query)
                .select('_id name version templateId updatedAt createdAt userId')
                .sort({ updatedAt: -1 })
                .lean();
            console.log(`📋 Fetched ${resumes.length} resumes${userId ? ` for user ${userId}` : ''}`);
            res.json({
                success: true,
                count: resumes.length,
                resumes
            });
        }
        catch (error) {
            console.error('❌ Error fetching resumes:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch resumes',
                details: error.message
            });
        }
    },
    // GET /api/resumes/:id - Get single resume with full content
    getOne: async (req, res) => {
        try {
            const { id } = req.params;
            // Validate MongoDB ObjectId
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid resume ID format'
                });
            }
            const resume = await Resume_js_1.Resume.findById(id).lean();
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
        }
        catch (error) {
            console.error('❌ Error fetching resume:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch resume',
                details: error.message
            });
        }
    },
    // POST /api/resumes - Create new resume
    create: async (req, res) => {
        try {
            const resumeData = req.body;
            // Validate required fields
            if (!resumeData.name) {
                return res.status(400).json({
                    success: false,
                    error: 'Resume name is required'
                });
            }
            // Get user ID from auth or dev mode
            const userId = await getUserId(req);
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required to create resume'
                });
            }
            // Create new resume document
            const newResume = new Resume_js_1.Resume({
                userId: new mongoose_1.default.Types.ObjectId(userId),
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
        }
        catch (error) {
            console.error('❌ Error creating resume:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create resume',
                details: error.message
            });
        }
    },
    // PUT /api/resumes/:id - Update existing resume
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            // Validate MongoDB ObjectId
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid resume ID format'
                });
            }
            // Find and update, incrementing version
            const updatedResume = await Resume_js_1.Resume.findByIdAndUpdate(id, {
                ...updateData,
                $inc: { version: 1 } // Increment version on each save
            }, { new: true, runValidators: true });
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
        }
        catch (error) {
            console.error('❌ Error updating resume:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update resume',
                details: error.message
            });
        }
    },
    // DELETE /api/resumes/:id - Delete resume
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            // Validate MongoDB ObjectId
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid resume ID format'
                });
            }
            const deletedResume = await Resume_js_1.Resume.findByIdAndDelete(id);
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
        }
        catch (error) {
            console.error('❌ Error deleting resume:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete resume',
                details: error.message
            });
        }
    },
    // POST /api/resumes/generate-pdf - Generate PDF from resume data
    generatePdf: async (req, res) => {
        try {
            console.log('📥 Received PDF generation request');
            const { templateName, ...resumeData } = req.body;
            // Validate required fields
            if (!resumeData.name || !resumeData.email) {
                return res.status(400).json({
                    error: 'Missing required fields: name and email are required'
                });
            }
            // Default to mnit_resume if no template specified
            const template = templateName || 'mnit_resume';
            console.log(`📑 Using template: ${template}`);
            // Generate PDF using LaTeX-On-HTTP API
            const pdfBuffer = await (0, latexEngine_js_1.generatePdf)(resumeData, template);
            // Set response headers for PDF download
            const fileName = `${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            console.log('📤 Sending PDF to client');
            res.send(pdfBuffer);
        }
        catch (error) {
            console.error('❌ PDF generation error:', error);
            res.status(500).json({
                error: 'Failed to generate PDF',
                details: error.message
            });
        }
    },
    // GET /api/resumes/:id/download - Download saved PDF
    downloadPdf: async (req, res) => {
        try {
            const { id } = req.params;
            // For now, fetch the resume and generate PDF on the fly
            // In production, you might store generated PDFs in cloud storage
            const resume = await Resume_js_1.Resume.findById(id);
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
        }
        catch (error) {
            console.error('❌ Error downloading PDF:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to download PDF',
                details: error.message
            });
        }
    },
};
//# sourceMappingURL=resumeController.js.map