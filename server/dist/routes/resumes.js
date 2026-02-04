"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Resume Routes
const express_1 = require("express");
const index_js_1 = require("../controllers/index.js");
const router = (0, express_1.Router)();
// CRUD routes
router.get('/', index_js_1.resumeController.getAll);
router.get('/:id', index_js_1.resumeController.getOne);
router.post('/', index_js_1.resumeController.create);
router.put('/:id', index_js_1.resumeController.update);
router.delete('/:id', index_js_1.resumeController.delete);
// PDF generation routes
router.post('/generate-pdf', index_js_1.resumeController.generatePdf);
router.get('/:id/download', index_js_1.resumeController.downloadPdf);
exports.default = router;
//# sourceMappingURL=resumes.js.map