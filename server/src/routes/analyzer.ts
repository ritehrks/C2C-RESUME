// Analyzer Routes
import { Router } from 'express';
import multer from 'multer';
import { analyzerController } from '../controllers/index.js';

const router = Router();

// Configure multer for PDF uploads (in-memory storage, max 5MB)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
});

router.post('/simple', analyzerController.runSimpleAnalysis);
router.post('/deep', analyzerController.runDeepAnalysis);
router.post('/parse-pdf', upload.single('resume'), analyzerController.parsePdf);
router.get('/history', analyzerController.getHistory);
router.get('/usage', analyzerController.getUsage);

export default router;
