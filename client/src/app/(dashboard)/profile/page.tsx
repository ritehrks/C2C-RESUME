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

interface UserData {
    name: string;
    email: string;
    profileImage?: string;
    createdAt?: string;
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
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
    const [userData, setUserData] = useState<UserData | null>(null);

    // Fetch user data from localStorage (set during login)
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserData({
                name: user.name || 'User',
                email: user.email || '',
                profileImage: user.profileImage,
                createdAt: user.createdAt
            });

            // Auto-fill profile personal info from user data
            setProfile(prev => ({
                ...prev,
                personalInfo: {
                    ...prev.personalInfo,
                    name: user.name || prev.personalInfo.name,
                    email: user.email || prev.personalInfo.email
                }
            }));
        }
    }, []);

    // Format joined date
    const getJoinedDate = () => {
        if (userData?.createdAt) {
            return new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
        return 'Recently';
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            // Save to localStorage
            localStorage.setItem('masterProfile', JSON.stringify(profile));

            // Also save to backend if token exists
            const token = localStorage.getItem('token');
            if (token) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ masterProfile: profile })
                });
            }

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

    const displayName = profile.personalInfo.name || userData?.name || 'User';
    const displayEmail = profile.personalInfo.email || userData?.email || '';

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
                                <div className="size-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center overflow-hidden">
                                    {userData?.profileImage ? (
                                        <img src={userData.profileImage} alt={displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-5xl font-bold text-white">{displayName.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="text-center md:text-left text-white">
                                <h1 className="text-3xl font-bold mb-1">{displayName}</h1>
                                <p className="text-white/80 mb-3">{displayEmail}</p>
                                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                                        📅 Joined {getJoinedDate()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
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
                    </div>
                </div>
            </div>
        </div>
    );
}
