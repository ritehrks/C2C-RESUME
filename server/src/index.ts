// Server Entry Point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import resumeRoutes from './routes/resumes.js';
import analyzerRoutes from './routes/analyzer.js';
import authRoutes from './routes/auth.js';
import statsRoutes from './routes/stats.js';

// Import database connection and seeders
import { connectDB } from './config/database.js';
import { seedAdminUser } from './controllers/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/resumes', resumeRoutes);
app.use('/api/analyze', analyzerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);

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
    connectDB().then(async () => {
        // Seed admin user
        await seedAdminUser();

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

export default app;
