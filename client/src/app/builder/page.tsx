"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { resumeApi } from '@/lib/api';

// Types for resume data
interface Experience {
    company: string;
    location: string;
    role: string;
    dates: string;
    items: string[];
}

interface Project {
    name: string;
    description: string;
    dates: string;
    technologies: string;
    items: string[];
}

interface Position {
    title: string;
    organization: string;
    tenure: string;
}

interface Achievement {
    title: string;
    description: string;
    date: string;
}

interface ResumeData {
    // Personal Info
    name: string;
    course: string;
    roll: string;
    phone: string;
    email: string;
    collegeEmail: string;
    degree: string;
    githubUrl: string;
    linkedinUrl: string;
    // Education
    cgpa: string;
    educationYear: string;
    schoolName: string;
    schoolPercentage: string;
    schoolBoard: string;
    schoolYear: string;
    // Skills
    languages: string;
    devTools: string;
    frameworks: string;
    cloudDb: string;
    softSkills: string;
    coursework: string;
    interests: string;
    // Dynamic sections
    experiences: Experience[];
    projects: Project[];
    positions: Position[];
    achievements: Achievement[];
}

const defaultResumeData: ResumeData = {
    name: "Your Name",
    course: "B.Tech in Computer Science",
    roll: "2021UCS1234",
    phone: "9876543210",
    email: "youremail@gmail.com",
    collegeEmail: "2021ucs1234@mnit.ac.in",
    degree: "B.Tech Computer Science & Engineering",
    githubUrl: "https://github.com/yourusername",
    linkedinUrl: "https://linkedin.com/in/yourusername",
    cgpa: "8.5",
    educationYear: "2021-2025",
    schoolName: "Your School Name",
    schoolPercentage: "95",
    schoolBoard: "CBSE",
    schoolYear: "2021",
    languages: "C++, Python, JavaScript, TypeScript",
    devTools: "VS Code, Git, Docker, Postman",
    frameworks: "React, Node.js, Express, Next.js",
    cloudDb: "MongoDB, PostgreSQL, AWS, Firebase",
    softSkills: "Leadership, Communication, Problem Solving",
    coursework: "Data Structures, Algorithms, DBMS, OS, CN",
    interests: "Web Development, Machine Learning, System Design",
    experiences: [
        {
            company: "Company Name",
            location: "City",
            role: "Software Engineer Intern",
            dates: "May 2024 - July 2024",
            items: ["Developed REST APIs using Node.js and Express", "Improved application performance by 30%"]
        }
    ],
    projects: [
        {
            name: "Project Name",
            description: "A brief description of what the project does",
            dates: "Jan 2024 - Mar 2024",
            technologies: "React, Node.js, MongoDB",
            items: ["Implemented user authentication and authorization", "Built responsive UI with React and Tailwind CSS"]
        }
    ],
    positions: [
        {
            title: "Technical Lead",
            organization: "Coding Club MNIT",
            tenure: "Aug 2023 - Present"
        }
    ],
    achievements: [
        {
            title: "Winner",
            description: "National Level Hackathon",
            date: "2024"
        }
    ]
};

function BuilderContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const editId = searchParams.get('id');
    const templateParam = searchParams.get('template');

    const [zoom, setZoom] = useState(85);
    const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
    const [resumeId, setResumeId] = useState<string | null>(editId);
    const [resumeName, setResumeName] = useState('Untitled Resume');
    const [isLoading, setIsLoading] = useState(!!editId);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [selectedTemplate, setSelectedTemplate] = useState<'mnit_resume' | 'generic_ats_resume'>(
        templateParam === 'generic' ? 'generic_ats_resume' : 'mnit_resume'
    );

    // Load existing resume if ID is provided in URL
    useEffect(() => {
        if (editId) {
            loadResume(editId);
        }
    }, [editId]);

    const loadResume = async (id: string) => {
        try {
            setIsLoading(true);
            const data = await resumeApi.getOne(id);
            if (data.success && data.resume) {
                setResumeId(id);
                setResumeName(data.resume.name);

                // Map database content to local format
                const content = data.resume.content;
                if (content) {
                    setResumeData({
                        // Personal Info
                        name: content.personalInfo?.name || defaultResumeData.name,
                        email: content.personalInfo?.email || defaultResumeData.email,
                        phone: content.personalInfo?.phone || defaultResumeData.phone,
                        githubUrl: content.personalInfo?.github || defaultResumeData.githubUrl,
                        linkedinUrl: content.personalInfo?.linkedin || defaultResumeData.linkedinUrl,
                        course: defaultResumeData.course, // Not stored in content
                        roll: defaultResumeData.roll, // Not stored in content
                        collegeEmail: defaultResumeData.collegeEmail, // Not stored in content
                        degree: content.education?.[0]?.branch || defaultResumeData.degree,

                        // Education
                        cgpa: String(content.education?.[0]?.cgpa || defaultResumeData.cgpa),
                        educationYear: content.education?.[0]
                            ? `${content.education[0].startYear}-${content.education[0].endYear}`
                            : defaultResumeData.educationYear,
                        schoolName: defaultResumeData.schoolName, // Not in content model
                        schoolPercentage: defaultResumeData.schoolPercentage,
                        schoolBoard: defaultResumeData.schoolBoard,
                        schoolYear: defaultResumeData.schoolYear,

                        // Skills
                        languages: content.skills?.languages?.join(', ') || defaultResumeData.languages,
                        devTools: content.skills?.tools?.join(', ') || defaultResumeData.devTools,
                        frameworks: content.skills?.frameworks?.join(', ') || defaultResumeData.frameworks,
                        cloudDb: content.skills?.databases?.join(', ') || defaultResumeData.cloudDb,
                        softSkills: defaultResumeData.softSkills,
                        coursework: defaultResumeData.coursework,
                        interests: defaultResumeData.interests,

                        // Experience
                        experiences: content.experience?.map((exp: any) => ({
                            company: exp.company || '',
                            location: '', // Not in content model
                            role: exp.role || '',
                            dates: `${exp.startDate || ''} - ${exp.endDate || ''}`,
                            items: exp.bullets || [''],
                        })) || defaultResumeData.experiences,

                        // Projects
                        projects: content.projects?.map((proj: any) => ({
                            name: proj.title || '',
                            description: proj.description || '',
                            dates: '', // Not in content model
                            technologies: proj.techStack?.join(', ') || '',
                            items: proj.bullets || [''],
                        })) || defaultResumeData.projects,

                        // Positions of Responsibility
                        positions: content.pors?.map((por: any) => ({
                            title: por.position || '',
                            organization: por.organization || '',
                            tenure: por.duration || '',
                        })) || defaultResumeData.positions,

                        // Achievements
                        achievements: content.achievements?.map((ach: any) => ({
                            title: ach.title || '',
                            description: ach.description || '',
                            date: ach.date || '',
                        })) || defaultResumeData.achievements,
                    });
                }

                // Load saved template selection
                if (data.resume.templateId) {
                    setSelectedTemplate(data.resume.templateId as 'mnit_resume' | 'generic_ats_resume');
                }
            }
        } catch (error) {
            console.error('Failed to load resume:', error);
            alert('Failed to load resume. Starting with a blank template.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveStatus('saving');

            const saveData = {
                name: resumeName || resumeData.name || 'Untitled Resume',
                templateId: selectedTemplate,
                content: {
                    personalInfo: {
                        name: resumeData.name,
                        email: resumeData.email,
                        phone: resumeData.phone,
                        linkedin: resumeData.linkedinUrl,
                        github: resumeData.githubUrl,
                    },
                    education: [{
                        institution: 'MNIT Jaipur',
                        branch: resumeData.degree,
                        cgpa: parseFloat(resumeData.cgpa) || 0,
                        startYear: parseInt(resumeData.educationYear.split('-')[0]) || 2021,
                        endYear: parseInt(resumeData.educationYear.split('-')[1]) || 2025,
                    }],
                    experience: resumeData.experiences.map(exp => ({
                        company: exp.company,
                        role: exp.role,
                        startDate: exp.dates.split(' - ')[0] || '',
                        endDate: exp.dates.split(' - ')[1] || '',
                        bullets: exp.items,
                    })),
                    projects: resumeData.projects.map(proj => ({
                        title: proj.name,
                        techStack: proj.technologies.split(', '),
                        description: proj.description,
                        bullets: proj.items,
                    })),
                    skills: {
                        languages: resumeData.languages.split(', '),
                        frameworks: resumeData.frameworks.split(', '),
                        tools: resumeData.devTools.split(', '),
                        databases: resumeData.cloudDb.split(', '),
                    },
                    achievements: resumeData.achievements.map(ach => ({
                        title: ach.title,
                        description: ach.description,
                        date: ach.date,
                    })),
                    certifications: [],
                    pors: resumeData.positions.map(pos => ({
                        position: pos.title,
                        organization: pos.organization,
                        duration: pos.tenure,
                        description: '',
                    })),
                },
            };

            if (resumeId) {
                // Update existing resume
                await resumeApi.update(resumeId, saveData);
            } else {
                // Create new resume
                const result = await resumeApi.create(saveData);
                if (result.resume._id) {
                    setResumeId(result.resume._id);
                    // Update URL without full reload
                    window.history.replaceState({}, '', `/builder?id=${result.resume._id}`);
                }
            }

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error: any) {
            console.error('Save error:', error);
            setSaveStatus('error');
            alert(`Failed to save: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = (field: keyof ResumeData, value: string) => {
        setResumeData(prev => ({ ...prev, [field]: value }));
    };

    const updateExperience = (index: number, field: keyof Experience, value: string | string[]) => {
        setResumeData(prev => {
            const newExperiences = [...prev.experiences];
            newExperiences[index] = { ...newExperiences[index], [field]: value };
            return { ...prev, experiences: newExperiences };
        });
    };

    const addExperience = () => {
        setResumeData(prev => ({
            ...prev,
            experiences: [...prev.experiences, { company: "", location: "", role: "", dates: "", items: [""] }]
        }));
    };

    const removeExperience = (index: number) => {
        setResumeData(prev => ({
            ...prev,
            experiences: prev.experiences.filter((_, i) => i !== index)
        }));
    };

    const updateProject = (index: number, field: keyof Project, value: string | string[]) => {
        setResumeData(prev => {
            const newProjects = [...prev.projects];
            newProjects[index] = { ...newProjects[index], [field]: value };
            return { ...prev, projects: newProjects };
        });
    };

    const addProject = () => {
        setResumeData(prev => ({
            ...prev,
            projects: [...prev.projects, { name: "", description: "", dates: "", technologies: "", items: [""] }]
        }));
    };

    const removeProject = (index: number) => {
        setResumeData(prev => ({
            ...prev,
            projects: prev.projects.filter((_, i) => i !== index)
        }));
    };

    const updatePosition = (index: number, field: keyof Position, value: string) => {
        setResumeData(prev => {
            const newPositions = [...prev.positions];
            newPositions[index] = { ...newPositions[index], [field]: value };
            return { ...prev, positions: newPositions };
        });
    };

    const addPosition = () => {
        setResumeData(prev => ({
            ...prev,
            positions: [...prev.positions, { title: "", organization: "", tenure: "" }]
        }));
    };

    const removePosition = (index: number) => {
        setResumeData(prev => ({
            ...prev,
            positions: prev.positions.filter((_, i) => i !== index)
        }));
    };

    const updateAchievement = (index: number, field: keyof Achievement, value: string) => {
        setResumeData(prev => {
            const newAchievements = [...prev.achievements];
            newAchievements[index] = { ...newAchievements[index], [field]: value };
            return { ...prev, achievements: newAchievements };
        });
    };

    const addAchievement = () => {
        setResumeData(prev => ({
            ...prev,
            achievements: [...prev.achievements, { title: "", description: "", date: "" }]
        }));
    };

    const removeAchievement = (index: number) => {
        setResumeData(prev => ({
            ...prev,
            achievements: prev.achievements.filter((_, i) => i !== index)
        }));
    };

    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownloadPDF = async () => {
        setIsGenerating(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const response = await fetch(`${API_URL}/api/resumes/generate-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...resumeData,
                    templateName: selectedTemplate,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate PDF');
            }

            // Get the PDF blob and trigger download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error: any) {
            console.error('PDF generation error:', error);
            alert(`Failed to generate PDF: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    // PDF Preview state and functions
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    const handlePreviewPDF = async () => {
        setIsLoadingPreview(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const response = await fetch(`${API_URL}/api/resumes/generate-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...resumeData,
                    templateName: selectedTemplate,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate PDF');
            }

            // Get the PDF blob and create a URL for preview
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setPreviewUrl(url);
            setShowPreview(true);
        } catch (error: any) {
            console.error('PDF preview error:', error);
            alert(`Failed to generate preview: ${error.message}`);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleDownloadFromPreview = () => {
        if (!previewUrl) return;
        const link = document.createElement('a');
        link.href = previewUrl;
        link.download = `${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const closePreview = () => {
        setShowPreview(false);
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    return (
        <div className="bg-app-bg-light dark:bg-app-bg-dark text-[#0d121b] dark:text-white font-display overflow-hidden flex flex-col h-screen">
            {/* Header */}
            <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7ebf3] dark:border-gray-800 bg-white dark:bg-[#101622] px-6 py-3 z-20">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center justify-center size-9 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-app-primary transition-colors" title="Back to Dashboard">
                        <span className="material-symbols-outlined text-[22px]">arrow_back</span>
                    </Link>
                    <Image src="/logo-v2.png" alt="C2C Logo" width={140} height={50} className="h-12 w-auto" />
                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{resumeData.name || "Untitled Resume"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedTemplate === 'mnit_resume' ? 'MNIT Official Template' : 'Generic ATS Template'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Save Status Indicator */}
                    <div className="hidden sm:flex items-center text-sm font-medium gap-1">
                        {saveStatus === 'saving' && (
                            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                <span>Saving...</span>
                            </span>
                        )}
                        {saveStatus === 'saved' && (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                <span>Saved!</span>
                            </span>
                        )}
                        {saveStatus === 'error' && (
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                <span>Error</span>
                            </span>
                        )}
                        {saveStatus === 'idle' && resumeId && (
                            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined text-[18px]">cloud_done</span>
                                <span>Synced</span>
                            </span>
                        )}
                    </div>
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>
                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all ${isSaving
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                <span className="hidden sm:inline">Saving...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                <span className="hidden sm:inline">{resumeId ? 'Save' : 'Save New'}</span>
                            </>
                        )}
                    </button>
                    {/* Preview PDF Button */}
                    <button
                        onClick={handlePreviewPDF}
                        disabled={isLoadingPreview}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all ${isLoadingPreview
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                    >
                        {isLoadingPreview ? (
                            <>
                                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                <span className="hidden sm:inline">Loading...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                <span className="hidden sm:inline">Preview</span>
                            </>
                        )}
                    </button>
                    {/* Download PDF Button */}
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isGenerating}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all ${isGenerating
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-app-primary hover:bg-blue-700 text-white'
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                <span className="hidden sm:inline">Generating...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                <span className="hidden sm:inline">Download PDF</span>
                            </>
                        )}
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar - Editor */}
                <div className="w-full lg:w-[450px] xl:w-[500px] flex-none flex flex-col border-r border-[#e7ebf3] dark:border-gray-800 bg-white dark:bg-[#101622] overflow-y-auto">
                    <div className="p-6 pb-20">
                        <div className="mb-6 flex flex-col gap-4">
                            <div className="flex justify-between items-end">
                                <h2 className="text-2xl font-bold tracking-tight dark:text-white">Editor</h2>
                                <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded ${selectedTemplate === 'mnit_resume'
                                    ? 'text-app-primary bg-app-primary/10'
                                    : 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30'
                                    }`}>
                                    {selectedTemplate === 'mnit_resume' ? 'MNIT Format' : 'ATS Format'}
                                </span>
                            </div>

                            {/* Template Selector */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Resume Template</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setSelectedTemplate('mnit_resume')}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${selectedTemplate === 'mnit_resume'
                                            ? 'border-app-primary bg-app-primary/5 dark:bg-app-primary/10'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined text-[24px] ${selectedTemplate === 'mnit_resume' ? 'text-app-primary' : 'text-gray-400'
                                            }`}>school</span>
                                        <span className={`text-xs font-semibold ${selectedTemplate === 'mnit_resume' ? 'text-app-primary' : 'text-gray-600 dark:text-gray-400'
                                            }`}>MNIT Official</span>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">College specific</span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedTemplate('generic_ats_resume')}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${selectedTemplate === 'generic_ats_resume'
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined text-[24px] ${selectedTemplate === 'generic_ats_resume' ? 'text-emerald-500' : 'text-gray-400'
                                            }`}>description</span>
                                        <span className={`text-xs font-semibold ${selectedTemplate === 'generic_ats_resume' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'
                                            }`}>Generic ATS</span>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">Universal format</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">

                            {/* Personal Info */}
                            <details className="group flex flex-col rounded-lg border border-[#cfd7e7] dark:border-gray-700 bg-app-bg-light dark:bg-[#151c2b] open:bg-white dark:open:bg-[#101622] open:shadow-sm transition-all duration-200" open>
                                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 select-none">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-app-primary">person</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Personal Info</span>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
                                </summary>
                                <div className="px-4 pb-4 pt-1 flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800">
                                    <label className="flex flex-col gap-1.5">
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Full Name</span>
                                        <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-10 px-3 focus:ring-app-primary focus:border-app-primary dark:text-white" type="text" value={resumeData.name} onChange={(e) => updateField('name', e.target.value)} />
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="flex flex-col gap-1.5">
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Roll Number</span>
                                            <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-10 px-3 focus:ring-app-primary focus:border-app-primary dark:text-white" type="text" value={resumeData.roll} onChange={(e) => updateField('roll', e.target.value)} />
                                        </label>
                                        <label className="flex flex-col gap-1.5">
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Phone</span>
                                            <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-10 px-3 focus:ring-app-primary focus:border-app-primary dark:text-white" type="tel" value={resumeData.phone} onChange={(e) => updateField('phone', e.target.value)} />
                                        </label>
                                    </div>
                                    <label className="flex flex-col gap-1.5">
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Course / Program</span>
                                        <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-10 px-3 focus:ring-app-primary focus:border-app-primary dark:text-white" type="text" value={resumeData.course} onChange={(e) => updateField('course', e.target.value)} />
                                    </label>
                                    <label className="flex flex-col gap-1.5">
                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Degree</span>
                                        <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-10 px-3 focus:ring-app-primary focus:border-app-primary dark:text-white" type="text" value={resumeData.degree} onChange={(e) => updateField('degree', e.target.value)} />
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="flex flex-col gap-1.5">
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Personal Email</span>
                                            <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-10 px-3 focus:ring-app-primary focus:border-app-primary dark:text-white" type="email" value={resumeData.email} onChange={(e) => updateField('email', e.target.value)} />
                                        </label>
                                        <label className="flex flex-col gap-1.5">
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">College Email</span>
                                            <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-10 px-3 focus:ring-app-primary focus:border-app-primary dark:text-white" type="email" value={resumeData.collegeEmail} onChange={(e) => updateField('collegeEmail', e.target.value)} />
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="flex flex-col gap-1.5">
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">GitHub URL</span>
                                            <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-10 px-3 focus:ring-app-primary focus:border-app-primary dark:text-white" type="url" value={resumeData.githubUrl} onChange={(e) => updateField('githubUrl', e.target.value)} />
                                        </label>
                                        <label className="flex flex-col gap-1.5">
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">LinkedIn URL</span>
                                            <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-10 px-3 focus:ring-app-primary focus:border-app-primary dark:text-white" type="url" value={resumeData.linkedinUrl} onChange={(e) => updateField('linkedinUrl', e.target.value)} />
                                        </label>
                                    </div>
                                </div>
                            </details>

                            {/* Education */}
                            <details className="group flex flex-col rounded-lg border border-[#cfd7e7] dark:border-gray-700 bg-app-bg-light dark:bg-[#151c2b] open:bg-white dark:open:bg-[#101622] open:shadow-sm transition-all duration-200">
                                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 select-none">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-gray-500 group-open:text-app-primary">school</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Education</span>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
                                </summary>
                                <div className="px-4 pb-4 pt-1 flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-700/50">
                                        <p className="text-xs font-semibold text-app-primary mb-2">MNIT Jaipur (Current)</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="flex flex-col gap-1">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">CGPA</span>
                                                <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" type="text" value={resumeData.cgpa} onChange={(e) => updateField('cgpa', e.target.value)} />
                                            </label>
                                            <label className="flex flex-col gap-1">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Year</span>
                                                <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" type="text" value={resumeData.educationYear} onChange={(e) => updateField('educationYear', e.target.value)} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-700/50">
                                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">School (12th)</p>
                                        <div className="flex flex-col gap-3">
                                            <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="School Name" type="text" value={resumeData.schoolName} onChange={(e) => updateField('schoolName', e.target.value)} />
                                            <div className="grid grid-cols-3 gap-2">
                                                <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="%" type="text" value={resumeData.schoolPercentage} onChange={(e) => updateField('schoolPercentage', e.target.value)} />
                                                <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="Board" type="text" value={resumeData.schoolBoard} onChange={(e) => updateField('schoolBoard', e.target.value)} />
                                                <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="Year" type="text" value={resumeData.schoolYear} onChange={(e) => updateField('schoolYear', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </details>

                            {/* Experience */}
                            <details className="group flex flex-col rounded-lg border border-[#cfd7e7] dark:border-gray-700 bg-app-bg-light dark:bg-[#151c2b] open:bg-white dark:open:bg-[#101622] open:shadow-sm transition-all duration-200">
                                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 select-none">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-gray-500 group-open:text-app-primary">work</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Experience</span>
                                        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">{resumeData.experiences.length}</span>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
                                </summary>
                                <div className="px-4 pb-4 pt-1 flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800">
                                    {resumeData.experiences.map((exp, index) => (
                                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-700/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-semibold text-app-primary">Experience {index + 1}</span>
                                                <button onClick={() => removeExperience(index)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="Company Name" type="text" value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="Role" type="text" value={exp.role} onChange={(e) => updateExperience(index, 'role', e.target.value)} />
                                                    <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="Location" type="text" value={exp.location} onChange={(e) => updateExperience(index, 'location', e.target.value)} />
                                                </div>
                                                <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="Dates (e.g., May 2024 - Jul 2024)" type="text" value={exp.dates} onChange={(e) => updateExperience(index, 'dates', e.target.value)} />
                                                <textarea className="form-textarea w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm p-3 dark:text-white min-h-[80px]" placeholder="• Work description (one per line)" value={exp.items.join('\n')} onChange={(e) => updateExperience(index, 'items', e.target.value.split('\n'))} />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={addExperience} className="flex items-center justify-center gap-2 w-full py-2 rounded-md border border-dashed border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-app-primary transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        Add Experience
                                    </button>
                                </div>
                            </details>

                            {/* Projects */}
                            <details className="group flex flex-col rounded-lg border border-[#cfd7e7] dark:border-gray-700 bg-app-bg-light dark:bg-[#151c2b] open:bg-white dark:open:bg-[#101622] open:shadow-sm transition-all duration-200">
                                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 select-none">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-gray-500 group-open:text-app-primary">rocket_launch</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Projects</span>
                                        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">{resumeData.projects.length}</span>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
                                </summary>
                                <div className="px-4 pb-4 pt-1 flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800">
                                    {resumeData.projects.map((project, index) => (
                                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-700/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-semibold text-app-primary">Project {index + 1}</span>
                                                <button onClick={() => removeProject(index)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="Project Name" type="text" value={project.name} onChange={(e) => updateProject(index, 'name', e.target.value)} />
                                                <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="Brief Description" type="text" value={project.description} onChange={(e) => updateProject(index, 'description', e.target.value)} />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="Dates" type="text" value={project.dates} onChange={(e) => updateProject(index, 'dates', e.target.value)} />
                                                    <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="Technologies" type="text" value={project.technologies} onChange={(e) => updateProject(index, 'technologies', e.target.value)} />
                                                </div>
                                                <textarea className="form-textarea w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm p-3 dark:text-white min-h-[80px]" placeholder="• Key points (one per line)" value={project.items.join('\n')} onChange={(e) => updateProject(index, 'items', e.target.value.split('\n'))} />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={addProject} className="flex items-center justify-center gap-2 w-full py-2 rounded-md border border-dashed border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-app-primary transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        Add Project
                                    </button>
                                </div>
                            </details>

                            {/* Technical Skills */}
                            <details className="group flex flex-col rounded-lg border border-[#cfd7e7] dark:border-gray-700 bg-app-bg-light dark:bg-[#151c2b] open:bg-white dark:open:bg-[#101622] open:shadow-sm transition-all duration-200">
                                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 select-none">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-gray-500 group-open:text-app-primary">bolt</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Technical Skills</span>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
                                </summary>
                                <div className="px-4 pb-4 pt-1 flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800">
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Languages</span>
                                        <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" type="text" value={resumeData.languages} onChange={(e) => updateField('languages', e.target.value)} />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Developer Tools</span>
                                        <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" type="text" value={resumeData.devTools} onChange={(e) => updateField('devTools', e.target.value)} />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Frameworks</span>
                                        <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" type="text" value={resumeData.frameworks} onChange={(e) => updateField('frameworks', e.target.value)} />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Cloud / Databases</span>
                                        <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" type="text" value={resumeData.cloudDb} onChange={(e) => updateField('cloudDb', e.target.value)} />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Soft Skills</span>
                                        <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" type="text" value={resumeData.softSkills} onChange={(e) => updateField('softSkills', e.target.value)} />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Coursework</span>
                                        <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" type="text" value={resumeData.coursework} onChange={(e) => updateField('coursework', e.target.value)} />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Areas of Interest</span>
                                        <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" type="text" value={resumeData.interests} onChange={(e) => updateField('interests', e.target.value)} />
                                    </label>
                                </div>
                            </details>

                            {/* Positions of Responsibility */}
                            <details className="group flex flex-col rounded-lg border border-[#cfd7e7] dark:border-gray-700 bg-app-bg-light dark:bg-[#151c2b] open:bg-white dark:open:bg-[#101622] open:shadow-sm transition-all duration-200">
                                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 select-none">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-gray-500 group-open:text-app-primary">groups</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Positions of Responsibility</span>
                                        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">{resumeData.positions.length}</span>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
                                </summary>
                                <div className="px-4 pb-4 pt-1 flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800">
                                    {resumeData.positions.map((pos, index) => (
                                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-700/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-semibold text-app-primary">Position {index + 1}</span>
                                                <button onClick={() => removePosition(index)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="Position Title" type="text" value={pos.title} onChange={(e) => updatePosition(index, 'title', e.target.value)} />
                                                <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="Organization / Club" type="text" value={pos.organization} onChange={(e) => updatePosition(index, 'organization', e.target.value)} />
                                                <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="Tenure" type="text" value={pos.tenure} onChange={(e) => updatePosition(index, 'tenure', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={addPosition} className="flex items-center justify-center gap-2 w-full py-2 rounded-md border border-dashed border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-app-primary transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        Add Position
                                    </button>
                                </div>
                            </details>

                            {/* Achievements */}
                            <details className="group flex flex-col rounded-lg border border-[#cfd7e7] dark:border-gray-700 bg-app-bg-light dark:bg-[#151c2b] open:bg-white dark:open:bg-[#101622] open:shadow-sm transition-all duration-200">
                                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 select-none">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-gray-500 group-open:text-app-primary">emoji_events</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Achievements</span>
                                        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">{resumeData.achievements.length}</span>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
                                </summary>
                                <div className="px-4 pb-4 pt-1 flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800">
                                    {resumeData.achievements.map((ach, index) => (
                                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-700/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-semibold text-app-primary">Achievement {index + 1}</span>
                                                <button onClick={() => removeAchievement(index)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="Achievement Title" type="text" value={ach.title} onChange={(e) => updateAchievement(index, 'title', e.target.value)} />
                                                <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="Description" type="text" value={ach.description} onChange={(e) => updateAchievement(index, 'description', e.target.value)} />
                                                <input className="form-input w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a202c] text-sm h-9 px-3 dark:text-white" placeholder="Date / Year" type="text" value={ach.date} onChange={(e) => updateAchievement(index, 'date', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={addAchievement} className="flex items-center justify-center gap-2 w-full py-2 rounded-md border border-dashed border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-app-primary transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        Add Achievement
                                    </button>
                                </div>
                            </details>

                        </div>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="hidden lg:flex flex-1 flex-col bg-gray-50 dark:bg-[#0b0f17] h-full relative border-l border-[#e7ebf3] dark:border-gray-800">
                    <div className="flex-none h-[60px] w-full bg-white dark:bg-[#101622] border-b border-[#e7ebf3] dark:border-gray-800 px-8 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Live Preview</span>
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${selectedTemplate === 'mnit_resume'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                }`}>
                                {selectedTemplate === 'mnit_resume' ? 'MNIT Format' : 'ATS Format'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                <button className="size-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-white hover:shadow-sm dark:hover:bg-gray-700 dark:text-gray-400 transition-all" title="Zoom Out" onClick={() => setZoom(z => Math.max(50, z - 10))}>
                                    <span className="material-symbols-outlined text-[20px]">remove</span>
                                </button>
                                <span className="text-xs font-semibold text-gray-600 w-12 text-center dark:text-gray-300">{zoom}%</span>
                                <button className="size-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-white hover:shadow-sm dark:hover:bg-gray-700 dark:text-gray-400 transition-all" title="Zoom In" onClick={() => setZoom(z => Math.min(150, z + 10))}>
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 bg-gray-100/50 dark:bg-[#0b0f17] flex justify-center items-start">
                        <div
                            className="bg-white text-black w-[210mm] min-h-[297mm] shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative flex flex-col shrink-0 transition-transform origin-top transform p-[12mm]"
                            style={{ transform: `scale(${zoom / 100})` }}
                        >
                            {/* MNIT Resume Preview */}
                            <div className="flex gap-4 mb-4">
                                {/* MNIT Logo */}
                                <img src="/mnit-logo.png" alt="MNIT Jaipur" className="w-[2.35cm] h-[2.35cm] object-contain" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">{resumeData.name}</h1>
                                            <p className="text-sm text-gray-600">Roll No.: {resumeData.roll}</p>
                                            <p className="text-sm text-gray-600">{resumeData.course}</p>
                                            <p className="text-sm text-gray-600">{resumeData.degree}</p>
                                            <p className="text-sm text-gray-600">Malaviya National Institute Of Technology, Jaipur</p>
                                        </div>
                                        <div className="text-right text-sm text-gray-600">
                                            <p>📞 +91-{resumeData.phone}</p>
                                            <p>✉️ {resumeData.email}</p>
                                            <p>✉️ {resumeData.collegeEmail}</p>
                                            <p>GitHub Profile</p>
                                            <p>LinkedIn Profile</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Education Section */}
                            <div className="mb-3">
                                <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">Education</h2>
                                <div className="flex justify-between text-sm">
                                    <div>
                                        <p className="font-semibold">Malaviya National Institute of Technology, Jaipur</p>
                                        <p className="text-gray-600 italic">{resumeData.degree}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-600">{resumeData.educationYear}</p>
                                        <p>CGPA: {resumeData.cgpa}</p>
                                    </div>
                                </div>
                                {resumeData.schoolName && (
                                    <div className="flex justify-between text-sm mt-2">
                                        <div>
                                            <p className="font-semibold">{resumeData.schoolName}</p>
                                            <p className="text-gray-600 italic">{resumeData.schoolBoard}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-600">{resumeData.schoolYear}</p>
                                            <p>Percentage: {resumeData.schoolPercentage}%</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Experience Section */}
                            {resumeData.experiences.length > 0 && (
                                <div className="mb-3">
                                    <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">Experience</h2>
                                    {resumeData.experiences.map((exp, index) => (
                                        <div key={index} className="mb-2">
                                            <div className="flex justify-between text-sm">
                                                <p className="font-semibold">{exp.company}</p>
                                                <p className="text-gray-600">{exp.dates}</p>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <p className="text-gray-600 italic">{exp.role}</p>
                                                <p className="text-gray-500">{exp.location}</p>
                                            </div>
                                            <ul className="list-disc ml-5 text-sm text-gray-700 mt-1">
                                                {exp.items.filter(item => item.trim()).map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Projects Section */}
                            {resumeData.projects.length > 0 && (
                                <div className="mb-3">
                                    <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">Personal Projects</h2>
                                    {resumeData.projects.map((project, index) => (
                                        <div key={index} className="mb-2">
                                            <div className="flex justify-between text-sm">
                                                <p className="font-semibold">{project.name}</p>
                                                <p className="text-gray-600">{project.dates}</p>
                                            </div>
                                            <p className="text-sm text-gray-600 italic">{project.description}</p>
                                            <ul className="list-disc ml-5 text-sm text-gray-700 mt-1">
                                                <li>Tools & technologies: {project.technologies}</li>
                                                {project.items.filter(item => item.trim()).map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Technical Skills Section */}
                            <div className="mb-3">
                                <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">Technical Skills and Interests</h2>
                                <div className="text-sm space-y-0.5">
                                    <p><span className="font-semibold">Languages:</span> {resumeData.languages}</p>
                                    <p><span className="font-semibold">Developer Tools:</span> {resumeData.devTools}</p>
                                    <p><span className="font-semibold">Frameworks:</span> {resumeData.frameworks}</p>
                                    <p><span className="font-semibold">Cloud/Databases:</span> {resumeData.cloudDb}</p>
                                    <p><span className="font-semibold">Soft Skills:</span> {resumeData.softSkills}</p>
                                    <p><span className="font-semibold">Coursework:</span> {resumeData.coursework}</p>
                                    <p><span className="font-semibold">Areas of Interest:</span> {resumeData.interests}</p>
                                </div>
                            </div>

                            {/* Positions of Responsibility */}
                            {resumeData.positions.length > 0 && (
                                <div className="mb-3">
                                    <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">Positions of Responsibility</h2>
                                    {resumeData.positions.map((pos, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <p><span className="font-semibold">{pos.title},</span> {pos.organization}</p>
                                            <p className="text-gray-600">{pos.tenure}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Achievements */}
                            {resumeData.achievements.length > 0 && (
                                <div className="mb-3">
                                    <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-2">Achievements</h2>
                                    {resumeData.achievements.map((ach, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <p><span className="font-semibold">{ach.title}</span> {ach.description}</p>
                                            <p className="text-gray-600">{ach.date}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* PDF Preview Modal */}
            {showPreview && previewUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <span className="size-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-purple-500">picture_as_pdf</span>
                                </span>
                                <div>
                                    <h3 className="font-bold text-lg">PDF Preview</h3>
                                    <p className="text-sm text-slate-500">{resumeData.name}_Resume.pdf</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownloadFromPreview}
                                    className="flex items-center gap-2 px-4 py-2 bg-app-primary hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">download</span>
                                    Download
                                </button>
                                <button
                                    onClick={closePreview}
                                    className="size-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        {/* PDF Viewer */}
                        <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-4 overflow-hidden">
                            <iframe
                                src={previewUrl || undefined}
                                className="w-full h-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
                                title="PDF Preview"
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <p className="text-xs text-slate-500">
                                <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
                                Preview generated with {selectedTemplate === 'mnit_resume' ? 'MNIT Official' : 'Generic ATS'} template
                            </p>
                            <button
                                onClick={closePreview}
                                className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Loading fallback for Suspense
function BuilderLoading() {
    return (
        <div className="bg-app-bg-light dark:bg-app-bg-dark text-[#0d121b] dark:text-white font-display overflow-hidden flex flex-col h-screen items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-app-primary animate-spin">progress_activity</span>
            <p className="mt-4 text-slate-500">Loading builder...</p>
        </div>
    );
}

// Export default with Suspense boundary
export default function BuilderPage() {
    return (
        <Suspense fallback={<BuilderLoading />}>
            <BuilderContent />
        </Suspense>
    );
}
