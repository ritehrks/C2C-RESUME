"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Pre-defined job templates for quick selection
const JOB_TEMPLATES = [
    {
        id: 'sde',
        title: 'Software Development Engineer (SDE)',
        icon: '💻',
        description: `Software Development Engineer (SDE)

About the Role:
We are looking for a talented Software Development Engineer to join our team. You will be working on building scalable, high-performance applications.

Requirements:
- Bachelor's degree in Computer Science or related field
- 2+ years of experience in software development
- Strong proficiency in at least one programming language (JavaScript, Python, Java, C++)
- Experience with data structures and algorithms
- Familiarity with system design and architecture
- Experience with REST APIs and microservices
- Knowledge of databases (SQL and NoSQL)
- Experience with Git and version control
- Understanding of CI/CD pipelines
- Strong problem-solving skills

Nice to Have:
- Experience with cloud platforms (AWS, GCP, Azure)
- Familiarity with Docker and Kubernetes
- Contributions to open source projects
- Competitive programming experience`
    },
    {
        id: 'frontend',
        title: 'Frontend Developer',
        icon: '🎨',
        description: `Frontend Developer

About the Role:
We are seeking a skilled Frontend Developer to create amazing user experiences for our web applications.

Requirements:
- 2+ years of experience in frontend development
- Strong proficiency in React, Vue, or Angular
- Expert knowledge of JavaScript/TypeScript
- Deep understanding of HTML5 and CSS3
- Experience with responsive design and mobile-first development
- Familiarity with state management (Redux, Zustand, MobX)
- Knowledge of build tools (Webpack, Vite)
- Experience with testing frameworks (Jest, Cypress)
- Understanding of web accessibility (WCAG) and SEO best practices
- Experience with CSS frameworks (Tailwind, Bootstrap, Material-UI)

Nice to Have:
- Experience with Next.js or similar frameworks
- Knowledge of design systems
- Familiarity with Figma or design tools
- Performance optimization experience
- Experience with PWA development`
    },
    {
        id: 'backend',
        title: 'Backend Developer',
        icon: '⚙️',
        description: `Backend Developer

About the Role:
We are looking for a Backend Developer to build robust, scalable server-side applications and APIs.

Requirements:
- 2+ years of backend development experience
- Strong proficiency in Node.js, Python, Java, or Go
- Experience with RESTful API design and development
- Knowledge of databases (PostgreSQL, MySQL, MongoDB, Redis)
- Understanding of authentication and authorization (OAuth, JWT)
- Experience with microservices architecture
- Familiarity with Docker and containerization
- Knowledge of message queues (RabbitMQ, Kafka)
- Experience with caching strategies
- Understanding of security best practices

Nice to Have:
- Experience with GraphQL
- Knowledge of cloud services (AWS, GCP, Azure)
- Experience with serverless architecture
- Understanding of event-driven architecture
- Database optimization and query tuning`
    },
    {
        id: 'fullstack',
        title: 'Full Stack Developer',
        icon: '🔧',
        description: `Full Stack Developer

About the Role:
We need a versatile Full Stack Developer who can work on both frontend and backend technologies.

Requirements:
- 3+ years of full stack development experience
- Frontend: React, Vue, or Angular with TypeScript
- Backend: Node.js, Python, or Java
- Experience with REST APIs and GraphQL
- Strong database skills (PostgreSQL, MongoDB)
- Understanding of system design principles
- Experience with Git and version control
- Knowledge of Docker and deployment pipelines
- Familiarity with cloud platforms (AWS/GCP/Azure)
- Strong debugging and problem-solving skills

Nice to Have:
- Experience with Next.js or similar frameworks
- Knowledge of Kubernetes
- CI/CD pipeline setup experience
- Performance optimization skills
- Experience with testing (unit, integration, e2e)`
    },
    {
        id: 'devops',
        title: 'DevOps Engineer',
        icon: '🚀',
        description: `DevOps Engineer

About the Role:
We are hiring a DevOps Engineer to build and maintain our infrastructure, CI/CD pipelines, and ensure system reliability.

Requirements:
- 2+ years of DevOps experience
- Strong knowledge of cloud platforms (AWS, GCP, or Azure)
- Experience with Docker and Kubernetes
- Proficiency in CI/CD tools (Jenkins, GitHub Actions, GitLab CI)
- Infrastructure as Code (Terraform, Pulumi, CloudFormation)
- Configuration management (Ansible, Chef, Puppet)
- Strong Linux/Unix administration skills
- Experience with monitoring and logging (Prometheus, Grafana, ELK)
- Shell scripting and automation
- Understanding of networking and security

Nice to Have:
- Kubernetes certifications (CKA, CKAD)
- Cloud certifications (AWS Solutions Architect, GCP Professional)
- Experience with service mesh (Istio)
- Cost optimization experience
- Disaster recovery planning`
    },
    {
        id: 'data_scientist',
        title: 'Data Scientist',
        icon: '📊',
        description: `Data Scientist

About the Role:
We are looking for a Data Scientist to extract insights from data and build predictive models.

Requirements:
- Master's or PhD in Computer Science, Statistics, or related field
- Strong proficiency in Python (pandas, numpy, scikit-learn)
- Experience with machine learning algorithms and techniques
- Deep understanding of statistics and probability
- Experience with data visualization (Matplotlib, Seaborn, Tableau)
- Knowledge of SQL and database querying
- Experience with Jupyter notebooks
- Understanding of A/B testing and hypothesis testing
- Feature engineering and data preprocessing skills
- Strong communication skills for presenting findings

Nice to Have:
- Deep learning experience (TensorFlow, PyTorch)
- NLP or computer vision experience
- Kaggle competitions or publications
- Big data tools (Spark, Hadoop)
- Experience with cloud ML services (SageMaker, Vertex AI)`
    },
    {
        id: 'ml_engineer',
        title: 'Machine Learning Engineer',
        icon: '🤖',
        description: `Machine Learning Engineer

About the Role:
We are seeking a Machine Learning Engineer to develop and deploy ML models at scale.

Requirements:
- 2+ years of ML engineering experience
- Strong proficiency in Python
- Experience with deep learning frameworks (TensorFlow, PyTorch)
- Model deployment and serving experience
- Understanding of MLOps best practices
- Experience with feature engineering and data pipelines
- Knowledge of cloud ML platforms (AWS SageMaker, GCP Vertex AI)
- Docker and Kubernetes for ML workloads
- Model monitoring and performance tracking
- Experience with distributed training

Nice to Have:
- NLP or Computer Vision specialization
- Experience with transformers and LLMs
- MLflow, Kubeflow, or similar MLOps tools
- Real-time inference optimization
- Published papers or research experience`
    },
    {
        id: 'product_manager',
        title: 'Product Manager',
        icon: '📋',
        description: `Product Manager

About the Role:
We are looking for a Product Manager to drive product strategy and execution.

Requirements:
- 3+ years of product management experience
- Strong understanding of product development lifecycle
- Experience with Agile/Scrum methodologies
- Excellent stakeholder management skills
- Data-driven decision making
- Experience with user research and customer interviews
- Proficiency in product analytics tools
- Strong communication and presentation skills
- Experience writing PRDs and specifications
- Understanding of UX/UI principles

Nice to Have:
- Technical background or coding experience
- MBA or business degree
- Experience with A/B testing
- Previous startup experience
- Industry domain expertise`
    }
];

// Simple analysis result type - matches new backend response
interface SimpleAnalysisResult {
    overallScore: number;
    matchPercentage: number;
    rating: string;
    ratingLabel: string;
    ratingColor: string;
    scores: {
        keyword: number;
        semantic: number;
        actionVerbs: number;
        sections: number;
        quantification: number;
    };
    semanticAnalysis?: {
        similarity: number;
        modelUsed: string;
        interpretation: string;
    };
    keywords: {
        resume: string[];
        job: string[];
        matched: string[];
        missing: string[];
        byCategory?: Record<string, { matched: string[]; missing: string[] }>;
    };
    actionVerbs: {
        strong: string[];
        weak: string[];
    };
    sections: Record<string, boolean>;
    quantification: { found: boolean; examples: string[] };
    suggestions: string[];
    stats: {
        resumeKeywordsFound: number;
        jobKeywordsFound: number;
        matchedCount: number;
        missingCount: number;
        strongVerbsCount: number;
        weakVerbsCount: number;
        sectionsDetected: number;
    };
    // Legacy support
    matchedKeywords?: string[];
    missingKeywords?: string[];
}

// Deep analysis AI result type
interface DeepAnalysisResult {
    matchPercentage: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    stats: {
        hardSkillsFound: number;
        hardSkillsRequired: number;
        strongVerbsCount: number;
        weakVerbsCount: number;
    };
    ai: {
        overallAssessment: string;
        strengthsAnalysis: string[];
        improvementAreas: string[];
        keywordOptimization: {
            strongMatches: string[];
            suggestedAdditions: string[];
            contextTips: string[];
        };
        contentSuggestions: {
            summary: string;
            experience: string;
            skills: string;
            achievements: string;
        };
        atsOptimization: string[];
        competitiveEdge: string;
        actionPlan: string[];
    };
}

type AnalysisMode = 'simple' | 'deep';

export default function AnalyzerPage() {
    const [jobDescription, setJobDescription] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('simple');
    const [simpleResult, setSimpleResult] = useState<SimpleAnalysisResult | null>(null);
    const [deepResult, setDeepResult] = useState<DeepAnalysisResult | null>(null);
    const [isAiPowered, setIsAiPowered] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // PDF upload states
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Handle PDF file upload
    const handleFileUpload = async (file: File) => {
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('resume', file);

            const response = await fetch(`${API_URL}/api/analyze/parse-pdf`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to parse PDF');
            }

            setResumeText(data.data.text);
            setUploadedFileName(data.data.fileName);
            console.log(`✅ Parsed PDF: ${data.data.numPages} pages`);

        } catch (err: any) {
            setError(err.message || 'Failed to upload PDF');
            console.error('Upload error:', err);
        } finally {
            setIsUploading(false);
        }
    };

    // Handle drag and drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
    };

    const handleAnalysis = async (mode: AnalysisMode) => {
        if (!jobDescription.trim() || !resumeText.trim()) {
            setError('Please provide both job description and resume text');
            return;
        }

        setIsAnalyzing(true);
        setAnalysisMode(mode);
        setError(null);

        try {
            const endpoint = mode === 'simple' ? '/api/analyze/simple' : '/api/analyze/deep';

            // Get auth token for tracking (optional)
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ jobDescription, resumeText }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Analysis failed');
            }

            if (mode === 'simple') {
                setSimpleResult(data.analysis);
                setDeepResult(null);
            } else {
                setDeepResult(data.analysis);
                setSimpleResult(null);
                setIsAiPowered(data.isAiPowered);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to analyze resume');
            console.error('Analysis error:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Get color classes based on match percentage
    const getMatchColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600 dark:text-green-400';
        if (percentage >= 60) return 'text-blue-600 dark:text-blue-400';
        if (percentage >= 40) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getRatingBadgeColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
        if (percentage >= 60) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
        if (percentage >= 40) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    };

    const getRatingLabel = (percentage: number) => {
        if (percentage >= 80) return 'Excellent Match';
        if (percentage >= 60) return 'Good Match';
        if (percentage >= 40) return 'Fair Match';
        return 'Needs Improvement';
    };

    const currentResult = simpleResult || deepResult;

    return (
        <div className="bg-app-bg-light dark:bg-app-bg-dark text-[#0d121b] dark:text-white font-display min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7ebf3] dark:border-gray-800 bg-white/95 dark:bg-[#101622]/95 px-6 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" title="Back to Dashboard">
                        <Image src="/logo-v2.png" alt="C2C Logo" width={140} height={50} className="h-12 w-auto" />
                    </Link>
                </div>
                <nav className="hidden md:flex flex-1 justify-center gap-8">
                    <Link className="text-[#4c669a] dark:text-gray-400 hover:text-app-primary dark:hover:text-app-primary transition-colors text-sm font-medium leading-normal" href="/dashboard">Dashboard</Link>
                    <Link className="text-[#4c669a] dark:text-gray-400 hover:text-app-primary dark:hover:text-app-primary transition-colors text-sm font-medium leading-normal" href="/builder">Resume Builder</Link>
                    <span className="text-app-primary text-sm font-bold leading-normal">ATS Analyzer</span>
                </nav>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-[#4c669a] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                    </button>
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-500 to-purple-600"></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 py-8">
                <div className="mb-8">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-[#4c669a] dark:text-gray-400 mb-1">
                            <Link href="/dashboard" className="hover:text-app-primary transition-colors">Dashboard</Link>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            <span className="font-medium text-app-primary">ATS Analyzer</span>
                        </div>
                        <h1 className="text-[#0d121b] dark:text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight">ATS Analyzer</h1>
                        <p className="text-[#4c669a] dark:text-gray-400 text-base font-normal max-w-2xl">
                            Optimize your resume for the Applicant Tracking System. Choose Simple Analysis for quick feedback or Deep Analysis for AI-powered insights.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Input */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="bg-white dark:bg-[#1e2636] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-700 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-app-primary">description</span>
                                <h3 className="text-[#0d121b] dark:text-white font-bold text-lg">Target Job Description</h3>
                            </div>

                            {/* Job Role Quick Select Dropdown */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                    Quick Select Role (or paste your own below)
                                </label>
                                <select
                                    className="w-full px-4 py-3 rounded-lg bg-[#f8f9fc] dark:bg-[#101622] border border-[#cfd7e7] dark:border-gray-600 text-[#0d121b] dark:text-white text-sm focus:outline-0 focus:ring-2 focus:ring-app-primary/20 transition-all cursor-pointer"
                                    onChange={(e) => {
                                        const selectedRole = JOB_TEMPLATES.find(j => j.id === e.target.value);
                                        if (selectedRole) {
                                            setJobDescription(selectedRole.description);
                                        }
                                    }}
                                    defaultValue=""
                                >
                                    <option value="" disabled>📋 Select a common job role...</option>
                                    {JOB_TEMPLATES.map((job) => (
                                        <option key={job.id} value={job.id}>
                                            {job.icon} {job.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <textarea
                                className="form-input w-full resize-none rounded-lg text-[#0d121b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-app-primary/20 border border-[#cfd7e7] dark:border-gray-600 bg-[#f8f9fc] dark:bg-[#101622] min-h-[160px] placeholder:text-[#8d9ab3] p-4 text-sm font-normal leading-relaxed transition-all"
                                placeholder="Paste the full job description here (e.g. Responsibilities, Requirements, Skills)..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        </div>

                        <div className="bg-white dark:bg-[#1e2636] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-app-primary">article</span>
                                    <h3 className="text-[#0d121b] dark:text-white font-bold text-lg">Your Resume</h3>
                                </div>
                                {uploadedFileName && (
                                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                        {uploadedFileName}
                                    </span>
                                )}
                            </div>

                            {/* PDF Upload Zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`relative border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-all cursor-pointer ${isDragging
                                    ? 'border-app-primary bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-[#cfd7e7] dark:border-gray-600 hover:border-app-primary hover:bg-gray-50 dark:hover:bg-[#101622]'
                                    }`}
                                onClick={() => document.getElementById('pdf-upload')?.click()}
                            >
                                <input
                                    type="file"
                                    id="pdf-upload"
                                    accept=".pdf"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                                {isUploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-3xl text-app-primary animate-spin">progress_activity</span>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Parsing PDF...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-3xl text-slate-400">upload_file</span>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Drop your resume PDF here or <span className="text-app-primary">browse</span>
                                        </p>
                                        <p className="text-xs text-slate-500">PDF only, max 5MB</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                                <span className="text-xs text-slate-400 uppercase">or paste text</span>
                                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                            </div>

                            <textarea
                                className="form-input w-full resize-none rounded-lg text-[#0d121b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-app-primary/20 border border-[#cfd7e7] dark:border-gray-600 bg-[#f8f9fc] dark:bg-[#101622] min-h-[120px] placeholder:text-[#8d9ab3] p-4 text-sm font-normal leading-relaxed transition-all"
                                placeholder="Or paste your resume text here..."
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400 flex items-center gap-2">
                                <span className="material-symbols-outlined">error</span>
                                {error}
                            </div>
                        )}

                        {/* Analysis Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => handleAnalysis('simple')}
                                disabled={isAnalyzing}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-xl h-14 font-bold shadow-sm transition-all ${isAnalyzing && analysisMode === 'simple'
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : 'bg-white hover:bg-gray-50 dark:bg-[#1e2636] dark:hover:bg-[#2a3449] border border-[#cfd7e7] dark:border-gray-600 text-app-primary dark:text-blue-400'
                                    }`}
                            >
                                {isAnalyzing && analysisMode === 'simple' ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">analytics</span>
                                        Simple Analysis
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleAnalysis('deep')}
                                disabled={isAnalyzing}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-xl h-14 font-bold shadow-lg transition-all ${isAnalyzing && analysisMode === 'deep'
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : 'bg-gradient-to-r from-purple-600 to-app-primary hover:from-purple-700 hover:to-blue-700 text-white shadow-purple-500/20'
                                    }`}
                            >
                                {isAnalyzing && analysisMode === 'deep' ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        AI Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">auto_awesome</span>
                                        Deep AI Analysis
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                            🚀 Deep Analysis uses Gemini AI for comprehensive insights
                        </p>
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        {!currentResult ? (
                            // Empty state
                            <div className="bg-white dark:bg-[#1e2636] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-700 p-12 text-center">
                                <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">query_stats</span>
                                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Analysis Yet</h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Paste a job description and your resume text, then choose an analysis type.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Score Card */}
                                <div className="bg-white dark:bg-[#1e2636] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-700 p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row gap-8 items-center">
                                        <div className="relative size-40 flex-shrink-0">
                                            {/* Use overallScore for simple, matchPercentage for deep */}
                                            {(() => {
                                                const displayScore = simpleResult?.overallScore ?? currentResult.matchPercentage;
                                                return (
                                                    <>
                                                        <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                                            <path className="text-gray-100 dark:text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeWidth="3"></path>
                                                            <path className={getMatchColor(displayScore)} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${displayScore}, 100`} strokeLinecap="round" strokeWidth="3"></path>
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className={`text-3xl font-bold ${getMatchColor(displayScore)}`}>{displayScore}%</span>
                                                            <span className="text-xs font-medium text-[#4c669a] dark:text-gray-400 uppercase tracking-wide">{simpleResult ? 'Overall' : 'Match'}</span>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-xl font-bold text-[#0d121b] dark:text-white">{getRatingLabel(currentResult.matchPercentage)}</h2>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getRatingBadgeColor(currentResult.matchPercentage)}`}>
                                                    {deepResult && isAiPowered ? '🤖 AI Powered' : simpleResult ? 'Quick Scan' : ''}
                                                </span>
                                            </div>

                                            {/* AI Overall Assessment for Deep Analysis */}
                                            {deepResult?.ai?.overallAssessment ? (
                                                <p className="text-[#4c669a] dark:text-gray-400 leading-relaxed mb-4">
                                                    {deepResult.ai.overallAssessment}
                                                </p>
                                            ) : (
                                                <p className="text-[#4c669a] dark:text-gray-400 leading-relaxed mb-4">
                                                    {currentResult.matchPercentage >= 80
                                                        ? "Excellent! Your resume strongly matches the job requirements."
                                                        : currentResult.matchPercentage >= 60
                                                            ? "Good match! A few tweaks could make it even better."
                                                            : "Your resume needs some optimization for this role."}
                                                </p>
                                            )}

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-[#f8f9fc] dark:bg-[#101622] rounded-lg p-3 border border-[#e7ebf3] dark:border-gray-800">
                                                    <p className="text-xs text-[#4c669a] dark:text-gray-400 mb-1">Skills Matched</p>
                                                    <p className="text-lg font-bold text-[#0d121b] dark:text-white">
                                                        {simpleResult?.stats?.matchedCount ?? simpleResult?.keywords?.matched?.length ?? 0}/
                                                        {(simpleResult?.stats?.jobKeywordsFound ?? ((simpleResult?.keywords?.matched?.length ?? 0) + (simpleResult?.keywords?.missing?.length ?? 0))) || 1}
                                                    </p>
                                                </div>
                                                <div className="bg-[#f8f9fc] dark:bg-[#101622] rounded-lg p-3 border border-[#e7ebf3] dark:border-gray-800">
                                                    <p className="text-xs text-[#4c669a] dark:text-gray-400 mb-1">Missing</p>
                                                    <p className="text-lg font-bold text-red-500">
                                                        {simpleResult?.stats?.missingCount ?? simpleResult?.keywords?.missing?.length ?? currentResult.missingKeywords?.length ?? 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Deep Analysis Results */}
                                {deepResult?.ai && (
                                    <>
                                        {/* Strengths & Improvements */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white dark:bg-[#1e2636] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-700 p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="material-symbols-outlined text-green-500">thumb_up</span>
                                                    <h3 className="text-[#0d121b] dark:text-white font-bold text-lg">Strengths</h3>
                                                </div>
                                                <ul className="space-y-2">
                                                    {deepResult.ai.strengthsAnalysis?.map((strength, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                            <span className="material-symbols-outlined text-green-500 text-[16px] mt-0.5">check_circle</span>
                                                            {strength}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="bg-white dark:bg-[#1e2636] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-700 p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="material-symbols-outlined text-yellow-500">tips_and_updates</span>
                                                    <h3 className="text-[#0d121b] dark:text-white font-bold text-lg">Room for Improvement</h3>
                                                </div>
                                                <ul className="space-y-2">
                                                    {deepResult.ai.improvementAreas?.map((area, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                            <span className="material-symbols-outlined text-yellow-500 text-[16px] mt-0.5">arrow_forward</span>
                                                            {area}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Keyword Optimization */}
                                        <div className="bg-white dark:bg-[#1e2636] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-700 p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="material-symbols-outlined text-app-primary">key</span>
                                                <h3 className="text-[#0d121b] dark:text-white font-bold text-lg">Keyword Optimization</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 uppercase">Strong Matches</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {deepResult.ai.keywordOptimization?.strongMatches?.slice(0, 6).map((kw, i) => (
                                                            <span key={i} className="px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">{kw}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 uppercase">Add These Keywords</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {deepResult.ai.keywordOptimization?.suggestedAdditions?.slice(0, 6).map((kw, i) => (
                                                            <span key={i} className="px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">{kw}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {Array.isArray(deepResult.ai.keywordOptimization?.contextTips) && deepResult.ai.keywordOptimization.contextTips.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">💡 How to Add Keywords Naturally:</p>
                                                    <ul className="space-y-1.5">
                                                        {deepResult.ai.keywordOptimization.contextTips.slice(0, 3).map((tip, i) => (
                                                            <li key={i} className="text-sm text-slate-500 dark:text-slate-400 flex items-start gap-2">
                                                                <span className="text-app-primary">•</span>
                                                                {tip}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* ATS Optimization Tips */}
                                        <div className="bg-gradient-to-r from-[#1152d4] to-[#0a3690] rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                                            <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="material-symbols-outlined">rocket_launch</span>
                                                    <h3 className="font-bold text-lg">Action Plan</h3>
                                                </div>
                                                <ol className="space-y-2 text-sm text-blue-100">
                                                    {deepResult.ai.actionPlan?.map((action, i) => (
                                                        <li key={i} className="flex items-start gap-3">
                                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                                            <span>{action}</span>
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>
                                        </div>

                                        {/* Competitive Edge */}
                                        {deepResult.ai.competitiveEdge && (
                                            <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl shadow-lg p-6 text-white">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="material-symbols-outlined">diamond</span>
                                                    <h3 className="font-bold text-lg">Your Competitive Edge</h3>
                                                </div>
                                                <p className="text-purple-100">{deepResult.ai.competitiveEdge}</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Simple Analysis Results - Keywords */}
                                {simpleResult && (
                                    <>
                                        {/* Score Breakdown - NEW */}
                                        {simpleResult.scores && (
                                            <div className="bg-white dark:bg-[#1e2636] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-700 p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="material-symbols-outlined text-app-primary">analytics</span>
                                                    <h3 className="text-[#0d121b] dark:text-white font-bold text-lg">Score Breakdown</h3>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                        <p className="text-xl font-bold text-blue-600">{simpleResult.scores.keyword}%</p>
                                                        <p className="text-xs text-blue-500">Keywords</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                                        <p className="text-xl font-bold text-purple-600">{simpleResult.scores.semantic || 0}%</p>
                                                        <p className="text-xs text-purple-500">Semantic</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                        <p className="text-xl font-bold text-green-600">{simpleResult.scores.sections}%</p>
                                                        <p className="text-xs text-green-500">Sections</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                                        <p className="text-xl font-bold text-orange-600">{simpleResult.scores.actionVerbs}%</p>
                                                        <p className="text-xs text-orange-500">Action Verbs</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                                                        <p className="text-xl font-bold text-pink-600">{simpleResult.scores.quantification}%</p>
                                                        <p className="text-xs text-pink-500">Quantified</p>
                                                    </div>
                                                </div>
                                                {simpleResult.semanticAnalysis && (
                                                    <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-lg">
                                                        <p className="text-xs font-medium text-purple-700 dark:text-purple-300">🧠 AI Semantic Analysis: {simpleResult.semanticAnalysis.interpretation}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Missing Keywords */}
                                            <div className="bg-white dark:bg-[#1e2636] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-700 p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-[#0d121b] dark:text-white font-bold text-lg flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-red-500">warning</span>
                                                        Missing Keywords
                                                    </h3>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(simpleResult.keywords?.missing ?? simpleResult.missingKeywords)?.slice(0, 8).map((keyword, i) => (
                                                        <span key={i} className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-full text-sm font-medium">{keyword}</span>
                                                    ))}
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Matched ({(simpleResult.keywords?.matched ?? simpleResult.matchedKeywords)?.length ?? 0})</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(simpleResult.keywords?.matched ?? simpleResult.matchedKeywords)?.slice(0, 6).map((keyword, i) => (
                                                            <span key={i} className="px-2.5 py-1 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 rounded-md text-xs font-medium">{keyword}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Verbs */}
                                            <div className="bg-white dark:bg-[#1e2636] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-700 p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="material-symbols-outlined text-app-primary">psychology</span>
                                                    <h3 className="text-[#0d121b] dark:text-white font-bold text-lg">Action Verbs</h3>
                                                </div>

                                                {simpleResult.actionVerbs?.weak?.length > 0 && (
                                                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                                        <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Weak verbs to replace:</p>
                                                        <p className="text-xs text-red-600/70 dark:text-red-400/70">{simpleResult.actionVerbs.weak.join(', ')}</p>
                                                    </div>
                                                )}

                                                {simpleResult.actionVerbs?.strong?.length > 0 && (
                                                    <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                                        <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Strong verbs used:</p>
                                                        <p className="text-xs text-green-700/70 dark:text-green-400/70">{simpleResult.actionVerbs.strong.slice(0, 5).join(', ')}</p>
                                                    </div>
                                                )}

                                                {/* Sections Detected - NEW */}
                                                {simpleResult.sections && (
                                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Sections Detected</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.entries(simpleResult.sections).map(([key, found]) => (
                                                                <span key={key} className={`px-2 py-1 rounded text-xs font-medium ${found ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                                                                    {found ? '✓' : '✗'} {key.replace('has', '')}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Suggestions */}
                                        {simpleResult.suggestions?.length > 0 && (
                                            <div className="bg-gradient-to-r from-[#1152d4] to-[#0a3690] rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="material-symbols-outlined">auto_fix_high</span>
                                                        <h3 className="font-bold text-lg">Quick Wins</h3>
                                                    </div>
                                                    <ul className="space-y-2 text-sm text-blue-100">
                                                        {simpleResult.suggestions.map((suggestion, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <span className="block size-1.5 mt-2 rounded-full bg-blue-300"></span>
                                                                <span>{suggestion}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {/* Upgrade prompt */}
                                        <div className="bg-gradient-to-r from-purple-600/10 to-app-primary/10 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-700 p-6 text-center">
                                            <span className="material-symbols-outlined text-4xl text-purple-500 mb-2">auto_awesome</span>
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Want More Detailed Insights?</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                                Get AI-powered feedback with personalized suggestions, competitive edge analysis, and a step-by-step action plan.
                                            </p>
                                            <button
                                                onClick={() => handleAnalysis('deep')}
                                                disabled={isAnalyzing}
                                                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-app-primary text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                                                Run Deep AI Analysis
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
