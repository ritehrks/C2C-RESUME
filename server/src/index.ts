// Server Entry Point
// TODO: Implement Express server with all routes

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Routes
// TODO: Add route imports
// app.use('/api/auth', authRoutes);
// app.use('/api/resumes', resumeRoutes);
// app.use('/api/analyze', analyzerRoutes);
// app.use('/api/profile', profileRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
