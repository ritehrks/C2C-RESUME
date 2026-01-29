// Resume Routes
import { Router } from 'express';
import { resumeController } from '../controllers/index.js';

const router = Router();

router.get('/', resumeController.getAll);
router.get('/:id', resumeController.getOne);
router.post('/', resumeController.create);
router.put('/:id', resumeController.update);
router.delete('/:id', resumeController.delete);
router.post('/:id/generate-pdf', resumeController.generatePdf);
router.get('/:id/download', resumeController.downloadPdf);

export default router;
