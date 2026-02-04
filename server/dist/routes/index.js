"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzerRoutes = exports.resumeRoutes = exports.authRoutes = void 0;
// Routes barrel export
const auth_js_1 = __importDefault(require("./auth.js"));
exports.authRoutes = auth_js_1.default;
const resumes_js_1 = __importDefault(require("./resumes.js"));
exports.resumeRoutes = resumes_js_1.default;
const analyzer_js_1 = __importDefault(require("./analyzer.js"));
exports.analyzerRoutes = analyzer_js_1.default;
//# sourceMappingURL=index.js.map