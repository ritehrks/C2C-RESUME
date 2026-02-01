// Resume Routes
import { Router } from 'express';
import { resumeController } from '../controllers/index.js';

const router = Router();

// CRUD routes
router.get('/', resumeController.getAll);
router.get('/:id', resumeController.getOne);
router.post('/', resumeController.create);
router.put('/:id', resumeController.update);
router.delete('/:id', resumeController.delete);

// PDF generation routes
router.post('/generate-pdf', resumeController.generatePdf);
router.get('/:id/download', resumeController.downloadPdf);

export default router;
