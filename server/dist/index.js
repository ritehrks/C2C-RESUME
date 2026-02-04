"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Server Entry Point
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import routes
const resumes_js_1 = __importDefault(require("./routes/resumes.js"));
const analyzer_js_1 = __importDefault(require("./routes/analyzer.js"));
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const stats_js_1 = __importDefault(require("./routes/stats.js"));
// Import database connection and seeders
const database_js_1 = require("./config/database.js");
const index_js_1 = require("./controllers/index.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
// Routes
app.use('/api/resumes', resumes_js_1.default);
app.use('/api/analyze', analyzer_js_1.default);
app.use('/api/auth', auth_js_1.default);
app.use('/api/stats', stats_js_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'C2C Resume Server is running 🚀'
    });
});
if (require.main === module) {
    // Connect to database, then start server
    (0, database_js_1.connectDB)().then(async () => {
        // Seed admin user
        await (0, index_js_1.seedAdminUser)();
        app.listen(PORT, () => {
            console.log(`🚀 C2C Resume Server running on http://localhost:${PORT}`);
            console.log(`📋 API Endpoints:`);
            console.log(`   - GET  /health`);
            console.log(`   - POST /api/auth/login`);
            console.log(`   - POST /api/auth/register`);
            console.log(`   - GET/POST/PUT/DELETE /api/resumes`);
            console.log(`   - POST /api/resumes/generate-pdf`);
            console.log(`   - POST /api/analyze/simple`);
        });
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map