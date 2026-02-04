"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Auth Routes
const express_1 = require("express");
const index_js_1 = require("../controllers/index.js");
const router = (0, express_1.Router)();
router.get('/google', index_js_1.authController.googleAuth);
router.get('/callback', index_js_1.authController.googleCallback);
router.post('/logout', index_js_1.authController.logout);
router.get('/me', index_js_1.authController.getMe);
router.put('/profile', index_js_1.authController.updateProfile);
router.post('/login', index_js_1.authController.login);
router.post('/register', index_js_1.authController.register);
exports.default = router;
//# sourceMappingURL=auth.js.map