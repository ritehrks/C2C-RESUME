"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Stats Routes - Admin Dashboard API
const express_1 = require("express");
const index_js_1 = require("../controllers/index.js");
const router = (0, express_1.Router)();
// All routes require admin authentication (verified in controller)
router.get('/overview', index_js_1.statsController.getOverview);
router.get('/resumes', index_js_1.statsController.getResumeStats);
router.get('/analysis', index_js_1.statsController.getAnalysisStats);
router.get('/activity', index_js_1.statsController.getRecentActivity);
router.get('/users', index_js_1.statsController.getUserList);
exports.default = router;
//# sourceMappingURL=stats.js.map