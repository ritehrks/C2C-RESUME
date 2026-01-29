"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { resumeApi, ResumeListItem } from '@/lib/api';

// Helper to format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
}

export default function DashboardPage() {
    const [resumes, setResumes] = useState<ResumeListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Fetch resumes on mount
    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await resumeApi.getAll();
            setResumes(data.resumes);
        } catch (err: any) {
            setError(err.message || 'Failed to load resumes');
            console.error('Error fetching resumes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            setDeletingId(id);
            await resumeApi.delete(id);
            setResumes(prev => prev.filter(r => r._id !== id));
        } catch (err: any) {
            alert(`Failed to delete: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Left Column: Resumes */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Heading Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Resumes</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track your CV versions</p>
                        </div>
                        <Link href="/builder" className="inline-flex items-center justify-center gap-2 bg-app-primary hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-lg shadow-app-primary/20">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Create New Resume</span>
                        </Link>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center gap-3 text-slate-500">
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                <span>Loading resumes...</span>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
                            <p className="flex items-center gap-2">
                                <span className="material-symbols-outlined">error</span>
                                {error}
                            </p>
                            <button onClick={fetchResumes} className="mt-2 text-sm underline hover:no-underline">
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && resumes.length === 0 && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center">
                            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">description</span>
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No resumes yet</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-4">Create your first resume to get started!</p>
                            <Link href="/builder" className="inline-flex items-center gap-2 bg-app-primary hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Create Resume
                            </Link>
                        </div>
                    )}

                    {/* Resume Grid */}
                    {!loading && !error && resumes.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resumes.map((resume) => (
                                <div key={resume._id} className="group bg-white dark:bg-[#1a2235] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:border-app-primary/50 transition-all duration-300 flex flex-col">
                                    {/* Preview Area */}
                                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 overflow-hidden border-b border-slate-100 dark:border-slate-700 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600">description</span>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-1 flex gap-1">
                                                <Link href={`/builder?id=${resume._id}`} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Edit">
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Card Content */}
                                    <div className="p-4 flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                            <Link href={`/builder?id=${resume._id}`} className="font-semibold text-slate-900 dark:text-white truncate hover:text-app-primary transition-colors">
                                                {resume.name}
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(resume._id, resume.name)}
                                                disabled={deletingId === resume._id}
                                                className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-red-500 transition-colors disabled:opacity-50"
                                            >
                                                {deletingId === resume._id ? 'progress_activity' : 'delete'}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            <span>Last edited {formatRelativeTime(resume.updatedAt)}</span>
                                        </div>
                                        <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                                            <span className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
                                                {resume.templateId || 'Default'}
                                            </span>
                                            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
                                                v{resume.version}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Updates Widget */}
                <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
                    <div className="bg-white dark:bg-[#1a2235] rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Quick Stats</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-center">
                                <p className="text-3xl font-bold text-app-primary">{resumes.length}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Resumes</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-center">
                                <p className="text-3xl font-bold text-green-500">
                                    {resumes.reduce((sum, r) => sum + r.version, 0)}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Versions</p>
                            </div>
                        </div>
                    </div>

                    {/* ATS Score Card */}
                    <div className="bg-gradient-to-br from-app-primary to-blue-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 rounded-full bg-black/10 blur-xl"></div>
                        <div className="relative z-10">
                            <span className="material-symbols-outlined text-3xl mb-2">auto_awesome</span>
                            <h4 className="font-bold text-lg mb-1">Analyze Your Resume</h4>
                            <p className="text-blue-100 text-sm mb-3">Get an ATS score and AI-powered feedback!</p>
                            <Link href="/analyzer" className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-1.5 px-3 rounded transition-colors inline-block">
                                Go to Analyzer
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
