// Analyzer Routes
import { Router } from 'express';
import { analyzerController } from '../controllers/index.js';

const router = Router();

router.post('/simple', analyzerController.runSimpleAnalysis);
router.post('/deep', analyzerController.runDeepAnalysis);
router.post('/parse-pdf', analyzerController.parsePdf);
router.get('/history', analyzerController.getHistory);
router.get('/usage', analyzerController.getUsage);

export default router;
