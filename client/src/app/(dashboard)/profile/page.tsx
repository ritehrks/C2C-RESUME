"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MasterProfile {
    personalInfo: {
        name: string;
        email: string;
        phone: string;
        linkedin: string;
        github: string;
        portfolio: string;
    };
    education: Array<{
        institution: string;
        degree: string;
        branch: string;
        cgpa: string;
        startYear: string;
        endYear: string;
    }>;
    skills: {
        languages: string;
        frameworks: string;
        tools: string;
        databases: string;
        softSkills: string;
    };
}

const defaultProfile: MasterProfile = {
    personalInfo: {
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        github: '',
        portfolio: '',
    },
    education: [{
        institution: '',
        degree: 'Bachelor of Technology',
        branch: '',
        cgpa: '',
        startYear: '',
        endYear: '',
    }],
    skills: {
        languages: '',
        frameworks: '',
        tools: '',
        databases: '',
        softSkills: '',
    },
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<MasterProfile>(defaultProfile);
    const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'billing'>('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

    // Mock user data (will be replaced with real auth)
    const user = {
        name: 'Guest User',
        email: 'guest@c2c.mnit.ac.in',
        avatar: null,
        plan: 'Free',
        joinedDate: 'January 2026',
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            // For now, save to localStorage (will be API call later)
            localStorage.setItem('masterProfile', JSON.stringify(profile));
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    // Load profile from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('masterProfile');
        if (saved) {
            setProfile(JSON.parse(saved));
        }
    }, []);

    const updatePersonalInfo = (field: keyof MasterProfile['personalInfo'], value: string) => {
        setProfile(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value }
        }));
    };

    const updateEducation = (index: number, field: string, value: string) => {
        setProfile(prev => {
            const newEducation = [...prev.education];
            newEducation[index] = { ...newEducation[index], [field]: value };
            return { ...prev, education: newEducation };
        });
    };

    const updateSkills = (field: keyof MasterProfile['skills'], value: string) => {
        setProfile(prev => ({
            ...prev,
            skills: { ...prev.skills, [field]: value }
        }));
    };

    return (
        <div className="p-4 sm:p-8">
            <div className="mx-auto max-w-6xl">
                {/* Profile Header Card */}
                <div className="relative mb-8 rounded-2xl overflow-hidden">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-app-primary via-purple-600 to-pink-500"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <div className="relative z-10 p-8 md:p-12">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="size-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center">
                                    <span className="text-5xl font-bold text-white">{(profile.personalInfo.name || user.name).charAt(0)}</span>
                                </div>
                                <button className="absolute bottom-0 right-0 size-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                                    <span className="material-symbols-outlined text-gray-700 text-[18px]">edit</span>
                                </button>
                            </div>

                            {/* User Info */}
                            <div className="text-center md:text-left text-white">
                                <h1 className="text-3xl font-bold mb-1">{profile.personalInfo.name || user.name}</h1>
                                <p className="text-white/80 mb-3">{profile.personalInfo.email || user.email}</p>
                                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                                        🎓 {user.plan} Plan
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                                        📅 Joined {user.joinedDate}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="md:ml-auto grid grid-cols-3 gap-4 text-center">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <p className="text-3xl font-bold text-white">5</p>
                                    <p className="text-xs text-white/70">Resumes</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <p className="text-3xl font-bold text-white">12</p>
                                    <p className="text-xs text-white/70">Analyses</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <p className="text-3xl font-bold text-white">89%</p>
                                    <p className="text-xs text-white/70">Avg Score</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'profile'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[18px] align-middle mr-2">person</span>
                        Master Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'settings'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[18px] align-middle mr-2">settings</span>
                        Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('billing')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'billing'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[18px] align-middle mr-2">credit_card</span>
                        Billing
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Info Section */}
                            <div className="bg-white dark:bg-[#1a2235] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="size-10 rounded-lg bg-app-primary/10 dark:bg-app-primary/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-app-primary">person</span>
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-lg">Personal Information</h3>
                                        <p className="text-sm text-slate-500">Your contact details for resumes</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={profile.personalInfo.name}
                                            onChange={(e) => updatePersonalInfo('name', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={profile.personalInfo.email}
                                            onChange={(e) => updatePersonalInfo('email', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                            placeholder="johndoe@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={profile.personalInfo.phone}
                                            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">LinkedIn URL</label>
                                        <input
                                            type="url"
                                            value={profile.personalInfo.linkedin}
                                            onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                            placeholder="linkedin.com/in/johndoe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GitHub URL</label>
                                        <input
                                            type="url"
                                            value={profile.personalInfo.github}
                                            onChange={(e) => updatePersonalInfo('github', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                            placeholder="github.com/johndoe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Portfolio URL</label>
                                        <input
                                            type="url"
                                            value={profile.personalInfo.portfolio}
                                            onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                            placeholder="johndoe.dev"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Education Section */}
                            <div className="bg-white dark:bg-[#1a2235] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="size-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-emerald-500">school</span>
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-lg">Education</h3>
                                        <p className="text-sm text-slate-500">Your academic background</p>
                                    </div>
                                </div>

                                {profile.education.map((edu, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Institution</label>
                                            <input
                                                type="text"
                                                value={edu.institution}
                                                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                                placeholder="MNIT Jaipur"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Degree</label>
                                            <input
                                                type="text"
                                                value={edu.degree}
                                                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                                placeholder="Bachelor of Technology"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Branch</label>
                                            <input
                                                type="text"
                                                value={edu.branch}
                                                onChange={(e) => updateEducation(index, 'branch', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                                placeholder="Computer Science"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CGPA</label>
                                            <input
                                                type="text"
                                                value={edu.cgpa}
                                                onChange={(e) => updateEducation(index, 'cgpa', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                                placeholder="8.5"
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Year</label>
                                                <input
                                                    type="text"
                                                    value={edu.startYear}
                                                    onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                                    placeholder="2021"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Year</label>
                                                <input
                                                    type="text"
                                                    value={edu.endYear}
                                                    onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                                    placeholder="2025"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Skills Section */}
                            <div className="bg-white dark:bg-[#1a2235] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="size-10 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-purple-500">code</span>
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-lg">Technical Skills</h3>
                                        <p className="text-sm text-slate-500">Comma-separated list of skills</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Programming Languages</label>
                                        <input
                                            type="text"
                                            value={profile.skills.languages}
                                            onChange={(e) => updateSkills('languages', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                            placeholder="JavaScript, Python, C++, Java"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Frameworks & Libraries</label>
                                        <input
                                            type="text"
                                            value={profile.skills.frameworks}
                                            onChange={(e) => updateSkills('frameworks', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                            placeholder="React, Node.js, Express, Next.js"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Developer Tools</label>
                                        <input
                                            type="text"
                                            value={profile.skills.tools}
                                            onChange={(e) => updateSkills('tools', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                            placeholder="Git, Docker, VS Code, Postman"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Databases & Cloud</label>
                                        <input
                                            type="text"
                                            value={profile.skills.databases}
                                            onChange={(e) => updateSkills('databases', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                            placeholder="MongoDB, PostgreSQL, AWS, Firebase"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Soft Skills</label>
                                        <input
                                            type="text"
                                            value={profile.skills.softSkills}
                                            onChange={(e) => updateSkills('softSkills', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-app-primary/20 focus:border-app-primary transition-all"
                                            placeholder="Problem Solving, Team Leadership, Communication"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex items-center justify-between bg-white dark:bg-[#1a2235] rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                <div className="flex items-center gap-2">
                                    {saveStatus === 'saved' && (
                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                            Changes saved successfully!
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-app-primary hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-app-primary/20 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[20px]">save</span>
                                            Save Profile
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <div className="bg-white dark:bg-[#1a2235] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                                <h4 className="font-bold mb-4">Quick Actions</h4>
                                <div className="space-y-3">
                                    <Link href="/builder" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <span className="size-10 rounded-lg bg-app-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-app-primary">add_circle</span>
                                        </span>
                                        <div>
                                            <p className="font-medium">Create Resume</p>
                                            <p className="text-xs text-slate-500">Use profile data</p>
                                        </div>
                                    </Link>
                                    <Link href="/analyzer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <span className="size-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-purple-500">analytics</span>
                                        </span>
                                        <div>
                                            <p className="font-medium">Analyze Resume</p>
                                            <p className="text-xs text-slate-500">Get ATS score</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            {/* Upgrade Card */}
                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 via-app-primary to-blue-600 p-6 text-white">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-12 -mb-12"></div>
                                <div className="relative z-10">
                                    <span className="material-symbols-outlined text-4xl mb-3">diamond</span>
                                    <h4 className="font-bold text-xl mb-2">Upgrade to Pro</h4>
                                    <p className="text-sm text-white/80 mb-4">Get unlimited AI analyses, priority support & more templates.</p>
                                    <button className="w-full py-2.5 bg-white text-app-primary font-semibold rounded-lg hover:bg-white/90 transition-colors">
                                        Upgrade Now - ₹499/mo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-2xl">
                        <div className="bg-white dark:bg-[#1a2235] rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
                            <h3 className="font-bold text-lg">Account Settings</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-500">dark_mode</span>
                                        <div>
                                            <p className="font-medium">Dark Mode</p>
                                            <p className="text-sm text-slate-500">Toggle dark theme</p>
                                        </div>
                                    </div>
                                    <button className="relative w-12 h-6 bg-app-primary rounded-full transition-colors">
                                        <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></span>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-500">notifications</span>
                                        <div>
                                            <p className="font-medium">Email Notifications</p>
                                            <p className="text-sm text-slate-500">Receive updates and tips</p>
                                        </div>
                                    </div>
                                    <button className="relative w-12 h-6 bg-slate-300 rounded-full transition-colors">
                                        <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow"></span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                <h4 className="font-medium text-red-600 mb-3">Danger Zone</h4>
                                <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className="max-w-4xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Free Plan */}
                            <div className="bg-white dark:bg-[#1a2235] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-lg">Free</h4>
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded">Current</span>
                                </div>
                                <p className="text-3xl font-bold mb-4">₹0<span className="text-sm font-normal text-slate-500">/month</span></p>
                                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[16px]">check</span> 5 Resumes</li>
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[16px]">check</span> Unlimited Simple Analyses</li>
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[16px]">check</span> 3 Deep Analyses/day</li>
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[16px]">check</span> 2 Templates</li>
                                </ul>
                                <button disabled className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold rounded-lg cursor-not-allowed">
                                    Current Plan
                                </button>
                            </div>

                            {/* Pro Plan */}
                            <div className="relative bg-gradient-to-br from-app-primary to-purple-600 rounded-xl p-6 text-white overflow-hidden">
                                <div className="absolute top-0 right-0 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-bl-lg">POPULAR</div>
                                <h4 className="font-bold text-lg mb-4">Pro</h4>
                                <p className="text-3xl font-bold mb-4">₹499<span className="text-sm font-normal text-white/70">/month</span></p>
                                <ul className="space-y-2 text-sm text-white/90 mb-6">
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">check</span> Unlimited Resumes</li>
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">check</span> Unlimited Analyses</li>
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">check</span> All Templates</li>
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">check</span> Priority Support</li>
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">check</span> Export to DOCX</li>
                                </ul>
                                <button className="w-full py-2 bg-white text-app-primary font-semibold rounded-lg hover:bg-white/90 transition-colors">
                                    Upgrade to Pro
                                </button>
                            </div>

                            {/* Enterprise Plan */}
                            <div className="bg-white dark:bg-[#1a2235] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                                <h4 className="font-bold text-lg mb-4">Enterprise</h4>
                                <p className="text-3xl font-bold mb-4">Custom</p>
                                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[16px]">check</span> Everything in Pro</li>
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[16px]">check</span> Custom Branding</li>
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[16px]">check</span> API Access</li>
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[16px]">check</span> Dedicated Support</li>
                                </ul>
                                <button className="w-full py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
