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
    createdAt: string;
    profilePicture?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function UserManagement() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'admin' | 'google'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

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
        }

        setFilteredUsers(result);
        setCurrentPage(1);
    }, [searchQuery, filter, users]);

    const fetchUsers = async (token: string) => {
        try {
            const res = await fetch(`${API_URL}/stats/users`, {
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
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
                        {/* Page Heading & Actions */}
                        <div className="flex flex-wrap justify-between items-end gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-[#0d121b] dark:text-white text-3xl font-bold tracking-tight">User Management</h1>
                                <p className="text-[#4c669a] text-sm font-normal">Manage user access, roles, and view activity statistics.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-4 h-10 bg-white dark:bg-[#1a2233] border border-gray-200 dark:border-gray-700 rounded-lg text-[#0d121b] dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                    Filters
                                </button>
                                <button className="flex cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-5 bg-[#1152d4] hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    <span>Download CSV</span>
                                </button>
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
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${filter === 'all' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    All Users
                                </button>
                                <button
                                    onClick={() => setFilter('admin')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${filter === 'admin' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    Admins Only
                                </button>
                                <button
                                    onClick={() => setFilter('google')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${filter === 'google' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    Google Auth
                                </button>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white dark:bg-[#1a2233] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                                            <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase tracking-wider w-32">Role</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase tracking-wider w-40">Auth Provider</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase tracking-wider text-right">Analysis Count</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase tracking-wider">Joined Date</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-[#4c669a] uppercase tracking-wider text-center w-24">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {displayedUsers.length > 0 ? displayedUsers.map((user) => (
                                            <tr key={user._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {user.profilePicture ? (
                                                            <div
                                                                className="size-8 rounded-full bg-cover bg-center"
                                                                style={{ backgroundImage: `url("${user.profilePicture}")` }}
                                                            />
                                                        ) : (
                                                            <div className="size-8 rounded-full bg-[#1152d4]/10 flex items-center justify-center text-[#1152d4] text-xs font-bold">
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
                                                        {user.role === 'admin' ? 'Admin' : 'User'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-[#0d121b] dark:text-gray-300">
                                                        <span className="text-[18px] material-symbols-outlined text-[#4c669a]">
                                                            {user.authProvider === 'google' ? 'account_circle' : 'mail'}
                                                        </span>
                                                        {user.authProvider === 'google' ? 'Google' : 'Email'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-medium text-[#0d121b] dark:text-white">{user.analysisCount || 0}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-[#4c669a] dark:text-gray-400">{formatDate(user.createdAt)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-[#4c669a]" title="View Details">
                                                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                        </button>
                                                        <button className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[#1152d4]" title="Promote to Admin">
                                                            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                                                        </button>
                                                        <button className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" title="Delete">
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-[#4c669a]">
                                                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">person_off</span>
                                                    <p>No users found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
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
                                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                                            </button>
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:z-20 focus:outline-offset-0 ${currentPage === page ? 'z-10 bg-[#1152d4] text-white focus-visible:outline-[#1152d4]' : 'text-[#0d121b] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            {totalPages > 5 && (
                                                <>
                                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700">...</span>
                                                    <button
                                                        onClick={() => setCurrentPage(totalPages)}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? 'z-10 bg-[#1152d4] text-white' : 'text-[#0d121b] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                                    >
                                                        {totalPages}
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
