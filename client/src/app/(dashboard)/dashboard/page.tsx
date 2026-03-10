"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { resumeApi, ResumeListItem } from '@/lib/api';

// Extended type for dashboard cards with content preview
interface DashboardResume extends ResumeListItem {
    content?: {
        personalInfo?: {
            name?: string;
            email?: string;
            phone?: string;
        };
        skills?: {
            languages?: string[];
            frameworks?: string[];
            tools?: string[];
        };
        education?: Array<{
            institution?: string;
            branch?: string;
        }>;
        projects?: Array<{
            title?: string;
        }>;
    };
}

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
    const [resumes, setResumes] = useState<DashboardResume[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Rename state
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [renameSaving, setRenameSaving] = useState(false);
    const renameInputRef = useRef<HTMLInputElement>(null);

    // Fetch resumes on mount
    useEffect(() => {
        fetchResumes();
    }, []);

    // Auto-focus rename input
    useEffect(() => {
        if (renamingId && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [renamingId]);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await resumeApi.getAll();
            setResumes(data.resumes as DashboardResume[]);
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

    const startRename = (resume: DashboardResume) => {
        setRenamingId(resume._id);
        setRenameValue(resume.name);
    };

    const saveRename = async (id: string) => {
        const trimmed = renameValue.trim();
        if (!trimmed) {
            setRenamingId(null);
            return;
        }

        try {
            setRenameSaving(true);
            await resumeApi.update(id, { name: trimmed } as any);
            setResumes(prev => prev.map(r =>
                r._id === id ? { ...r, name: trimmed } : r
            ));
        } catch (err: any) {
            alert(`Failed to rename: ${err.message}`);
        } finally {
            setRenameSaving(false);
            setRenamingId(null);
        }
    };

    const handleRenameKeyDown = (e: React.KeyboardEvent, id: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveRename(id);
        } else if (e.key === 'Escape') {
            setRenamingId(null);
        }
    };

    // Build a mini-resume preview from content data
    const renderMiniPreview = (resume: DashboardResume) => {
        const c = resume.content;
        const isMNIT = resume.templateId !== 'generic_ats_resume';
        const personName = c?.personalInfo?.name || '';
        const personEmail = c?.personalInfo?.email || '';
        const hasContent = personName || personEmail || (c?.skills && Object.values(c.skills).some(s => s && s.length > 0));
        const skillTags = [
            ...(c?.skills?.languages || []),
            ...(c?.skills?.frameworks || []),
            ...(c?.skills?.tools || []),
        ].slice(0, 6);
        const projectNames = (c?.projects || []).map(p => p.title).filter(Boolean).slice(0, 3);
        const eduName = c?.education?.[0]?.institution || '';

        if (!hasContent) {
            // Empty resume - show template wireframe
            return (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 select-none">
                    <div className={`w-28 rounded-md border-2 border-dashed p-3 flex flex-col gap-1 ${isMNIT ? 'border-blue-300 dark:border-blue-700' : 'border-emerald-300 dark:border-emerald-700'}`}>
                        {/* header line */}
                        <div className={`h-2 w-16 rounded-full ${isMNIT ? 'bg-blue-200 dark:bg-blue-800' : 'bg-emerald-200 dark:bg-emerald-800'}`}></div>
                        <div className="h-1 w-12 rounded-full bg-slate-200 dark:bg-slate-600"></div>
                        <div className="mt-1 h-1 w-full rounded-full bg-slate-100 dark:bg-slate-700"></div>
                        <div className="h-1 w-[90%] rounded-full bg-slate-100 dark:bg-slate-700"></div>
                        <div className="mt-1 h-1.5 w-10 rounded-full bg-slate-200 dark:bg-slate-600"></div>
                        <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-slate-700"></div>
                        <div className="h-1 w-[80%] rounded-full bg-slate-100 dark:bg-slate-700"></div>
                        <div className="mt-1 h-1.5 w-8 rounded-full bg-slate-200 dark:bg-slate-600"></div>
                        <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-slate-700"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
                        {isMNIT ? 'MNIT Template' : 'Generic ATS'}
                    </p>
                </div>
            );
        }

        // Rich preview - show mini resume layout
        return (
            <div className="w-full h-full flex items-center justify-center p-3 select-none">
                <div className={`w-32 bg-white dark:bg-slate-800 rounded shadow-sm border p-2.5 flex flex-col gap-1 ${isMNIT ? 'border-blue-200 dark:border-blue-800' : 'border-emerald-200 dark:border-emerald-800'}`}>
                    {/* Header */}
                    <div className="text-center mb-0.5">
                        {isMNIT && <div className="w-5 h-5 mx-auto mb-0.5 rounded bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center"><span className="text-[8px] text-blue-600 dark:text-blue-400 font-bold">M</span></div>}
                        <p className="text-[7px] font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">{personName || 'Your Name'}</p>
                        {personEmail && <p className="text-[5px] text-slate-400 truncate">{personEmail}</p>}
                    </div>
                    <div className={`h-[0.5px] w-full ${isMNIT ? 'bg-blue-200 dark:bg-blue-800' : 'bg-emerald-200 dark:bg-emerald-800'}`}></div>
                    {/* Education */}
                    {eduName && (
                        <>
                            <p className="text-[5px] font-bold text-slate-500 uppercase tracking-wider">Education</p>
                            <p className="text-[5px] text-slate-600 dark:text-slate-400 truncate">{eduName}</p>
                        </>
                    )}
                    {/* Skills tags */}
                    {skillTags.length > 0 && (
                        <>
                            <p className="text-[5px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Skills</p>
                            <div className="flex flex-wrap gap-[2px]">
                                {skillTags.map((s, i) => (
                                    <span key={i} className="text-[4px] px-1 py-[0.5px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">{s}</span>
                                ))}
                            </div>
                        </>
                    )}
                    {/* Projects */}
                    {projectNames.length > 0 && (
                        <>
                            <p className="text-[5px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Projects</p>
                            {projectNames.map((p, i) => (
                                <div key={i} className="flex items-center gap-0.5">
                                    <div className="w-0.5 h-0.5 rounded-full bg-blue-400"></div>
                                    <p className="text-[5px] text-slate-600 dark:text-slate-400 truncate">{p}</p>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        );
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
                        <div className="relative group">
                            <button className="inline-flex items-center justify-center gap-2 bg-app-primary hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-lg shadow-app-primary/20">
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                <span>Create New Resume</span>
                                <span className="material-symbols-outlined text-[18px]">expand_more</span>
                            </button>
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a2235] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                                <div className="p-2">
                                    <p className="text-xs font-semibold text-slate-400 px-3 py-2">Choose Template</p>
                                    <Link href="/builder?template=mnit" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <span className="material-symbols-outlined text-app-primary text-[22px]">school</span>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">MNIT Official</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">For MNIT students</p>
                                        </div>
                                    </Link>
                                    <Link href="/builder?template=generic" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <span className="material-symbols-outlined text-emerald-500 text-[22px]">description</span>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Generic ATS</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Universal format</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
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
                                    {/* Preview Area — mini resume layout */}
                                    <Link href={`/builder?id=${resume._id}`} className="relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-750 overflow-hidden border-b border-slate-100 dark:border-slate-700 cursor-pointer">
                                        {renderMiniPreview(resume)}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-1 flex gap-1">
                                                <span className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                    {/* Card Content */}
                                    <div className="p-4 flex flex-col gap-2">
                                        <div className="flex justify-between items-center gap-2">
                                            {renamingId === resume._id ? (
                                                <div className="flex-1 flex items-center gap-1">
                                                    <input
                                                        ref={renameInputRef}
                                                        type="text"
                                                        value={renameValue}
                                                        onChange={(e) => setRenameValue(e.target.value)}
                                                        onKeyDown={(e) => handleRenameKeyDown(e, resume._id)}
                                                        onBlur={() => saveRename(resume._id)}
                                                        disabled={renameSaving}
                                                        className="flex-1 font-semibold text-slate-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        placeholder="Resume name..."
                                                    />
                                                    {renameSaving && <span className="material-symbols-outlined text-blue-500 text-sm animate-spin">progress_activity</span>}
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                                    <Link href={`/builder?id=${resume._id}`} className="font-semibold text-slate-900 dark:text-white truncate hover:text-app-primary transition-colors">
                                                        {resume.name}
                                                    </Link>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); startRename(resume); }}
                                                        className="material-symbols-outlined text-slate-300 text-sm cursor-pointer hover:text-blue-500 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                                                        title="Rename"
                                                    >
                                                        edit
                                                    </button>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleDelete(resume._id, resume.name)}
                                                disabled={deletingId === resume._id}
                                                className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-red-500 transition-colors disabled:opacity-50 flex-shrink-0"
                                            >
                                                {deletingId === resume._id ? 'progress_activity' : 'delete'}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            <span>Last edited {formatRelativeTime(resume.updatedAt)}</span>
                                        </div>
                                        <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${resume.templateId === 'generic_ats_resume'
                                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                }`}>
                                                {resume.templateId === 'generic_ats_resume' ? 'Generic ATS' : 'MNIT'}
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
