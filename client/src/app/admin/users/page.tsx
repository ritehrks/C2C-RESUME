"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    authProvider: 'local' | 'google';
    analysisCount?: number;
    resumeCount?: number;
    createdAt: string;
    profilePicture?: string;
    profileImage?: string;
}

interface ResumePreview {
    _id: string;
    name: string;
    templateId: string;
    version: number;
    content?: {
        personalInfo?: {
            name?: string;
            email?: string;
            phone?: string;
            linkedin?: string;
            github?: string;
            portfolio?: string;
        };
        education?: Array<{
            institution?: string;
            branch?: string;
            cgpa?: number;
            startYear?: number;
            endYear?: number;
        }>;
        experience?: Array<{
            company?: string;
            role?: string;
            startDate?: string;
            endDate?: string;
            bullets?: string[];
        }>;
        projects?: Array<{
            title?: string;
            techStack?: string[];
            description?: string;
            bullets?: string[];
            link?: string;
        }>;
        skills?: {
            languages?: string[];
            frameworks?: string[];
            tools?: string[];
            databases?: string[];
        };
        achievements?: Array<{
            title?: string;
            description?: string;
            date?: string;
        }>;
        certifications?: Array<{
            name?: string;
            issuer?: string;
            date?: string;
            link?: string;
        }>;
        pors?: Array<{
            position?: string;
            organization?: string;
            duration?: string;
            description?: string;
        }>;
    };
    createdAt: string;
    updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function UserManagement() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'admin' | 'google' | 'has_resumes'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    // Resume viewer state
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userResumes, setUserResumes] = useState<ResumePreview[]>([]);
    const [isLoadingResumes, setIsLoadingResumes] = useState(false);
    const [showResumePanel, setShowResumePanel] = useState(false);
    const [expandedResumeId, setExpandedResumeId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (!token || !user) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(user);
        if (userData.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        fetchUsers(token);
    }, [router]);

    useEffect(() => {
        let result = users;

        // Apply search filter
        if (searchQuery) {
            result = result.filter(u =>
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply role/auth filter
        if (filter === 'admin') {
            result = result.filter(u => u.role === 'admin');
        } else if (filter === 'google') {
            result = result.filter(u => u.authProvider === 'google');
        } else if (filter === 'has_resumes') {
            result = result.filter(u => (u.resumeCount || 0) > 0);
        }

        setFilteredUsers(result);
        setCurrentPage(1);
    }, [searchQuery, filter, users]);

    const fetchUsers = async (token: string) => {
        try {
            const res = await fetch(`${API_URL}/api/stats/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
                setFilteredUsers(data.users || []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const viewUserResumes = async (user: User) => {
        setSelectedUser(user);
        setShowResumePanel(true);
        setIsLoadingResumes(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/stats/users/${user._id}/resumes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUserResumes(data.resumes || []);
            }
        } catch (error) {
            console.error('Failed to fetch user resumes:', error);
        } finally {
            setIsLoadingResumes(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const displayedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

    // Summary stats
    const totalUsersCount = users.length;
    const totalResumesCount = users.reduce((sum, u) => sum + (u.resumeCount || 0), 0);
    const googleUsersCount = users.filter(u => u.authProvider === 'google').length;
    const usersWithResumes = users.filter(u => (u.resumeCount || 0) > 0).length;

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined animate-spin text-4xl text-[#1152d4]">progress_activity</span>
                    <p className="text-[#4c669a]">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f6f6f8] dark:bg-[#101622] font-['Inter',sans-serif]">
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12">
                    <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
                        {/* Page Heading & Actions */}
                        <div className="flex flex-wrap justify-between items-end gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-[#0d121b] dark:text-white text-3xl font-bold tracking-tight">User Management</h1>
                                <p className="text-[#4c669a] text-sm font-normal">View all registered users, their resumes, and manage access.</p>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-[#1a2233] p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                                <p className="text-[#4c669a] text-xs font-medium mb-1">Total Users</p>
                                <p className="text-2xl font-bold text-[#0d121b] dark:text-white">{totalUsersCount}</p>
                            </div>
                            <div className="bg-white dark:bg-[#1a2233] p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                                <p className="text-[#4c669a] text-xs font-medium mb-1">Total Resumes</p>
                                <p className="text-2xl font-bold text-[#0d121b] dark:text-white">{totalResumesCount}</p>
                            </div>
                            <div className="bg-white dark:bg-[#1a2233] p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                                <p className="text-[#4c669a] text-xs font-medium mb-1">Google Auth Users</p>
                                <p className="text-2xl font-bold text-[#0d121b] dark:text-white">{googleUsersCount}</p>
                            </div>
                            <div className="bg-white dark:bg-[#1a2233] p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                                <p className="text-[#4c669a] text-xs font-medium mb-1">Users with Resumes</p>
                                <p className="text-2xl font-bold text-[#0d121b] dark:text-white">{usersWithResumes}</p>
                            </div>
                        </div>

                        {/* Search & Controls */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-[#1a2233] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                            <div className="relative w-full sm:w-96">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[#4c669a] text-[20px]">search</span>
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full rounded-lg border-0 py-2.5 pl-10 text-[#0d121b] dark:text-white bg-gray-50 dark:bg-gray-800/50 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-[#4c669a] focus:ring-2 focus:ring-inset focus:ring-[#1152d4] sm:text-sm sm:leading-6"
                                    placeholder="Search by name or email..."
                                />
                            </div>
                            <div className="flex gap-2 text-sm text-[#4c669a]">
                                {(['all', 'has_resumes', 'admin', 'google'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${filter === f ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                        {f === 'all' ? 'All Users' : f === 'has_resumes' ? '📄 Has Resumes' : f === 'admin' ? 'Admins' : 'Google Auth'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white dark:bg-[#1a2233] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                                            <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase tracking-wider w-28">Role</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase tracking-wider w-28">Auth</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase tracking-wider text-center w-28">Resumes</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase tracking-wider text-center w-28">Analyses</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase tracking-wider text-center w-24">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {displayedUsers.length > 0 ? displayedUsers.map((user) => (
                                            <tr key={user._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {(user.profilePicture || user.profileImage) ? (
                                                            <div
                                                                className="size-9 rounded-full bg-cover bg-center flex-shrink-0"
                                                                style={{ backgroundImage: `url("${user.profilePicture || user.profileImage}")` }}
                                                            />
                                                        ) : (
                                                            <div className="size-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                                {getInitials(user.name)}
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-semibold text-[#0d121b] dark:text-white">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-[#4c669a] dark:text-gray-400">{user.email}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${user.role === 'admin' ? 'bg-[#1152d4]/10 text-[#1152d4] ring-[#1152d4]/20' : 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-500/20'}`}>
                                                        {user.role === 'admin' ? '🛡️ Admin' : 'User'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-[#0d121b] dark:text-gray-300">
                                                        <span className="text-[16px] material-symbols-outlined text-[#4c669a]">
                                                            {user.authProvider === 'google' ? 'account_circle' : 'mail'}
                                                        </span>
                                                        {user.authProvider === 'google' ? 'Google' : 'Email'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {(user.resumeCount || 0) > 0 ? (
                                                        <button
                                                            onClick={() => viewUserResumes(user)}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">description</span>
                                                            {user.resumeCount}
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">0</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-sm font-medium text-[#0d121b] dark:text-white">{user.analysisCount || 0}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-[#4c669a] dark:text-gray-400">{formatDate(user.createdAt)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => viewUserResumes(user)}
                                                            className="p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[#1152d4] transition-colors"
                                                            title="View Resumes"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">folder_open</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-12 text-center text-[#4c669a]">
                                                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">person_off</span>
                                                    <p>No users found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 px-4 py-3 sm:px-6">
                                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-[#4c669a]">
                                                Showing <span className="font-medium text-[#0d121b] dark:text-white">{startIndex + 1}</span> to <span className="font-medium text-[#0d121b] dark:text-white">{Math.min(startIndex + usersPerPage, filteredUsers.length)}</span> of <span className="font-medium text-[#0d121b] dark:text-white">{filteredUsers.length}</span> results
                                            </p>
                                        </div>
                                        <div>
                                            <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                                                </button>
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 dark:ring-gray-700 ${currentPage === page ? 'z-10 bg-[#1152d4] text-white' : 'text-[#0d121b] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Resume Viewer Slide Panel */}
            {showResumePanel && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
                        onClick={() => { setShowResumePanel(false); setExpandedResumeId(null); }}
                    />

                    {/* Slide Panel */}
                    <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-[#1a2233] shadow-2xl z-50 flex flex-col" style={{ animation: 'slideIn 0.25s ease-out' }}>
                        {/* Panel Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                {selectedUser && (
                                    <>
                                        <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                            {getInitials(selectedUser.name)}
                                        </div>
                                        <div>
                                            <h3 className="text-[#0d121b] dark:text-white font-bold text-lg">{selectedUser.name}&apos;s Resumes</h3>
                                            <p className="text-[#4c669a] text-xs">{selectedUser.email}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={() => { setShowResumePanel(false); setExpandedResumeId(null); }}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-[#4c669a] transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {isLoadingResumes ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <span className="material-symbols-outlined animate-spin text-3xl text-[#1152d4]">progress_activity</span>
                                    <p className="text-[#4c669a] text-sm">Loading resumes...</p>
                                </div>
                            ) : userResumes.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    <p className="text-sm text-[#4c669a] font-medium">{userResumes.length} saved resume{userResumes.length !== 1 ? 's' : ''} — click to expand</p>
                                    {userResumes.map((resume) => {
                                        const isExpanded = expandedResumeId === resume._id;
                                        const c = resume.content;
                                        return (
                                            <div
                                                key={resume._id}
                                                className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl border transition-all ${isExpanded ? 'border-[#1152d4]/40 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-[#1152d4]/20'}`}
                                            >
                                                {/* Resume Header — always visible */}
                                                <button
                                                    onClick={() => setExpandedResumeId(isExpanded ? null : resume._id)}
                                                    className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-[#1152d4] text-xl">description</span>
                                                        <div>
                                                            <h4 className="text-[#0d121b] dark:text-white font-semibold">{resume.name}</h4>
                                                            <p className="text-xs text-[#4c669a] mt-0.5">
                                                                {resume.templateId === 'mnit_resume' ? 'MNIT Template' : 'Generic ATS'} · v{resume.version} · Updated {formatDate(resume.updatedAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`material-symbols-outlined text-[#4c669a] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                        expand_more
                                                    </span>
                                                </button>

                                                {/* Full Resume Content — shown when expanded */}
                                                {isExpanded && c && (
                                                    <div className="px-5 pb-5 border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col gap-5">

                                                        {/* Personal Info */}
                                                        {c.personalInfo && (
                                                            <div>
                                                                <h5 className="text-xs font-bold text-[#1152d4] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                                    <span className="material-symbols-outlined text-[14px]">person</span>
                                                                    Personal Information
                                                                </h5>
                                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                                    {c.personalInfo.name && <div><span className="text-[#4c669a]">Name:</span> <span className="text-[#0d121b] dark:text-white font-medium">{c.personalInfo.name}</span></div>}
                                                                    {c.personalInfo.email && <div><span className="text-[#4c669a]">Email:</span> <span className="text-[#0d121b] dark:text-white font-medium">{c.personalInfo.email}</span></div>}
                                                                    {c.personalInfo.phone && <div><span className="text-[#4c669a]">Phone:</span> <span className="text-[#0d121b] dark:text-white font-medium">{c.personalInfo.phone}</span></div>}
                                                                    {c.personalInfo.linkedin && <div><span className="text-[#4c669a]">LinkedIn:</span> <span className="text-[#0d121b] dark:text-white font-medium">{c.personalInfo.linkedin}</span></div>}
                                                                    {c.personalInfo.github && <div><span className="text-[#4c669a]">GitHub:</span> <span className="text-[#0d121b] dark:text-white font-medium">{c.personalInfo.github}</span></div>}
                                                                    {c.personalInfo.portfolio && <div><span className="text-[#4c669a]">Portfolio:</span> <span className="text-[#0d121b] dark:text-white font-medium">{c.personalInfo.portfolio}</span></div>}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Education */}
                                                        {c.education && c.education.length > 0 && (
                                                            <div>
                                                                <h5 className="text-xs font-bold text-[#1152d4] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                                    <span className="material-symbols-outlined text-[14px]">school</span>
                                                                    Education
                                                                </h5>
                                                                <div className="flex flex-col gap-2">
                                                                    {c.education.map((edu, i) => (
                                                                        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                                                            <p className="text-sm font-semibold text-[#0d121b] dark:text-white">{edu.institution}</p>
                                                                            <p className="text-xs text-[#4c669a]">{edu.branch}</p>
                                                                            <div className="flex gap-3 mt-1 text-xs text-[#4c669a]">
                                                                                {edu.cgpa != null && <span>CGPA: <span className="font-semibold text-[#0d121b] dark:text-white">{edu.cgpa}</span></span>}
                                                                                {edu.startYear && edu.endYear && <span>{edu.startYear} — {edu.endYear}</span>}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Experience */}
                                                        {c.experience && c.experience.length > 0 && (
                                                            <div>
                                                                <h5 className="text-xs font-bold text-[#1152d4] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                                    <span className="material-symbols-outlined text-[14px]">work</span>
                                                                    Experience
                                                                </h5>
                                                                <div className="flex flex-col gap-2">
                                                                    {c.experience.map((exp, i) => (
                                                                        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                                                            <p className="text-sm font-semibold text-[#0d121b] dark:text-white">{exp.role}</p>
                                                                            <p className="text-xs text-[#4c669a]">{exp.company} · {exp.startDate} — {exp.endDate}</p>
                                                                            {exp.bullets && exp.bullets.length > 0 && (
                                                                                <ul className="mt-2 space-y-1">
                                                                                    {exp.bullets.map((b, j) => (
                                                                                        <li key={j} className="text-xs text-[#0d121b] dark:text-gray-300 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-[#1152d4]">{b}</li>
                                                                                    ))}
                                                                                </ul>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Projects */}
                                                        {c.projects && c.projects.length > 0 && (
                                                            <div>
                                                                <h5 className="text-xs font-bold text-[#1152d4] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                                    <span className="material-symbols-outlined text-[14px]">code</span>
                                                                    Projects
                                                                </h5>
                                                                <div className="flex flex-col gap-2">
                                                                    {c.projects.map((proj, i) => (
                                                                        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                                                            <div className="flex items-center gap-2">
                                                                                <p className="text-sm font-semibold text-[#0d121b] dark:text-white">{proj.title}</p>
                                                                                {proj.link && (
                                                                                    <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-[#1152d4] hover:underline text-xs">↗ Link</a>
                                                                                )}
                                                                            </div>
                                                                            {proj.description && <p className="text-xs text-[#4c669a] mt-0.5">{proj.description}</p>}
                                                                            {proj.techStack && proj.techStack.length > 0 && (
                                                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                                                    {proj.techStack.map((t, j) => (
                                                                                        <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium">{t}</span>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                            {proj.bullets && proj.bullets.length > 0 && (
                                                                                <ul className="mt-2 space-y-1">
                                                                                    {proj.bullets.map((b, j) => (
                                                                                        <li key={j} className="text-xs text-[#0d121b] dark:text-gray-300 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-[#1152d4]">{b}</li>
                                                                                    ))}
                                                                                </ul>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Technical Skills */}
                                                        {c.skills && (
                                                            <div>
                                                                <h5 className="text-xs font-bold text-[#1152d4] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                                    <span className="material-symbols-outlined text-[14px]">build</span>
                                                                    Technical Skills
                                                                </h5>
                                                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                                                                    {c.skills.languages && c.skills.languages.length > 0 && (
                                                                        <div className="text-xs"><span className="text-[#4c669a] font-medium">Languages:</span> <span className="text-[#0d121b] dark:text-gray-300">{c.skills.languages.join(', ')}</span></div>
                                                                    )}
                                                                    {c.skills.frameworks && c.skills.frameworks.length > 0 && (
                                                                        <div className="text-xs"><span className="text-[#4c669a] font-medium">Frameworks:</span> <span className="text-[#0d121b] dark:text-gray-300">{c.skills.frameworks.join(', ')}</span></div>
                                                                    )}
                                                                    {c.skills.tools && c.skills.tools.length > 0 && (
                                                                        <div className="text-xs"><span className="text-[#4c669a] font-medium">Tools:</span> <span className="text-[#0d121b] dark:text-gray-300">{c.skills.tools.join(', ')}</span></div>
                                                                    )}
                                                                    {c.skills.databases && c.skills.databases.length > 0 && (
                                                                        <div className="text-xs"><span className="text-[#4c669a] font-medium">Databases:</span> <span className="text-[#0d121b] dark:text-gray-300">{c.skills.databases.join(', ')}</span></div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Achievements */}
                                                        {c.achievements && c.achievements.length > 0 && (
                                                            <div>
                                                                <h5 className="text-xs font-bold text-[#1152d4] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                                    <span className="material-symbols-outlined text-[14px]">emoji_events</span>
                                                                    Achievements
                                                                </h5>
                                                                <div className="flex flex-col gap-1.5">
                                                                    {c.achievements.map((ach, i) => (
                                                                        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                                                            <p className="text-sm font-semibold text-[#0d121b] dark:text-white">{ach.title}</p>
                                                                            {ach.description && <p className="text-xs text-[#4c669a] mt-0.5">{ach.description}</p>}
                                                                            {ach.date && <p className="text-xs text-[#4c669a] mt-0.5">{ach.date}</p>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Certifications */}
                                                        {c.certifications && c.certifications.length > 0 && (
                                                            <div>
                                                                <h5 className="text-xs font-bold text-[#1152d4] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                                    <span className="material-symbols-outlined text-[14px]">verified</span>
                                                                    Certifications
                                                                </h5>
                                                                <div className="flex flex-col gap-1.5">
                                                                    {c.certifications.map((cert, i) => (
                                                                        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-[#0d121b] dark:text-white">{cert.name}</p>
                                                                                <p className="text-xs text-[#4c669a]">{cert.issuer} {cert.date && `· ${cert.date}`}</p>
                                                                            </div>
                                                                            {cert.link && (
                                                                                <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-[#1152d4] text-xs hover:underline">View ↗</a>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Positions of Responsibility */}
                                                        {c.pors && c.pors.length > 0 && (
                                                            <div>
                                                                <h5 className="text-xs font-bold text-[#1152d4] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                                    <span className="material-symbols-outlined text-[14px]">groups</span>
                                                                    Positions of Responsibility
                                                                </h5>
                                                                <div className="flex flex-col gap-1.5">
                                                                    {c.pors.map((por, i) => (
                                                                        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                                                            <p className="text-sm font-semibold text-[#0d121b] dark:text-white">{por.position}</p>
                                                                            <p className="text-xs text-[#4c669a]">{por.organization} {por.duration && `· ${por.duration}`}</p>
                                                                            {por.description && <p className="text-xs text-[#0d121b] dark:text-gray-300 mt-1">{por.description}</p>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* No content fallback */}
                                                        {!c.personalInfo && !c.education?.length && !c.experience?.length && !c.projects?.length && !c.skills && !c.achievements?.length && (
                                                            <p className="text-sm text-[#4c669a] text-center py-4">No content data saved for this resume.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-[#4c669a]">
                                    <span className="material-symbols-outlined text-5xl mb-3 opacity-40">description</span>
                                    <p className="font-medium">No saved resumes</p>
                                    <p className="text-sm mt-1">This user hasn&apos;t created any resumes yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <style jsx>{`
                        @keyframes slideIn {
                            from { transform: translateX(100%); }
                            to { transform: translateX(0); }
                        }
                    `}</style>
                </>
            )}
        </div>
    );
}
