"use strict";
// Resume Model
// TODO: Implement Resume schema with content sections
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resume = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const resumeSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    version: { type: Number, default: 1 },
    content: {
        personalInfo: {
            name: String,
            email: String,
            phone: String,
            linkedin: String,
            github: String,
            portfolio: String,
        },
        education: [{
                institution: String,
                branch: String,
                cgpa: Number,
                startYear: Number,
                endYear: Number,
            }],
        experience: [{
                company: String,
                role: String,
                startDate: String,
                endDate: String,
                bullets: [String],
            }],
        projects: [{
                title: String,
                techStack: [String],
                description: String,
                bullets: [String],
                link: String,
            }],
        skills: {
            languages: [String],
            frameworks: [String],
            tools: [String],
            databases: [String],
        },
        achievements: [{
                title: String,
                description: String,
                date: String,
            }],
        certifications: [{
                name: String,
                issuer: String,
                date: String,
                link: String,
            }],
        pors: [{
                position: String,
                organization: String,
                duration: String,
                description: String,
            }],
    },
    pdfUrl: String,
    templateId: {
        type: String,
        enum: ['mnit_resume', 'generic_ats_resume'],
        default: 'mnit_resume'
    },
}, { timestamps: true });
exports.Resume = mongoose_1.default.model('Resume', resumeSchema);
//# sourceMappingURL=Resume.js.map