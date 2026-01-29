"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

export default function BuilderPage() {
    const [zoom, setZoom] = useState(85);
    const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);

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

    const handleDownloadPDF = () => {
        // For now, show alert. Backend integration will handle actual PDF generation
        alert("PDF Download will be available after backend integration. The LaTeX template is ready!");
        console.log("Resume Data:", resumeData);
    };

    return (
        <div className="bg-app-bg-light dark:bg-app-bg-dark text-[#0d121b] dark:text-white font-display overflow-hidden flex flex-col h-screen">
            {/* Header */}
            <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7ebf3] dark:border-gray-800 bg-white dark:bg-[#101622] px-6 py-3 z-20">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center justify-center size-9 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-app-primary transition-colors" title="Back to Dashboard">
                        <span className="material-symbols-outlined text-[22px]">arrow_back</span>
                    </Link>
                    <Image src="/logo.png?v=2" alt="C2C Logo" width={140} height={50} className="h-12 w-auto" />
                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{resumeData.name || "Untitled Resume"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">MNIT Official Template</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center text-sm font-medium text-green-600 dark:text-green-400 gap-1">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>Auto-saved</span>
                    </div>
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 bg-app-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        <span className="hidden sm:inline">Download PDF</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar - Editor */}
                <div className="w-full lg:w-[450px] xl:w-[500px] flex-none flex flex-col border-r border-[#e7ebf3] dark:border-gray-800 bg-white dark:bg-[#101622] overflow-y-auto">
                    <div className="p-6 pb-20">
                        <div className="mb-6 flex justify-between items-end">
                            <h2 className="text-2xl font-bold tracking-tight dark:text-white">Editor</h2>
                            <span className="text-xs font-semibold uppercase tracking-wider text-app-primary bg-app-primary/10 px-2 py-1 rounded">MNIT Format</span>
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
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded font-medium">MNIT Format</span>
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
                                {/* MNIT Logo placeholder */}
                                <div className="w-[2.35cm] h-[2.35cm] bg-gray-200 flex items-center justify-center text-xs text-gray-500 rounded">
                                    MNIT Logo
                                </div>
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
        </div>
    );
}
