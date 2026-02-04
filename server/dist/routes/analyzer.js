"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Analyzer Routes
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const index_js_1 = require("../controllers/index.js");
const router = (0, express_1.Router)();
// Configure multer for PDF uploads (in-memory storage, max 5MB)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
});
router.post('/simple', index_js_1.analyzerController.runSimpleAnalysis);
router.post('/deep', index_js_1.analyzerController.runDeepAnalysis);
router.post('/parse-pdf', upload.single('resume'), index_js_1.analyzerController.parsePdf);
router.get('/history', index_js_1.analyzerController.getHistory);
router.get('/usage', index_js_1.analyzerController.getUsage);
exports.default = router;
//# sourceMappingURL=analyzer.js.map