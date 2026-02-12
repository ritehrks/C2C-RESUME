"use client";

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

interface AnalyticsData {
    totalResumes: number;
    totalAnalyses: number;
    activeUsers: number;
}

export default function AdminAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
        totalResumes: 0,
        totalAnalyses: 0,
        activeUsers: 0,
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/overview`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAnalyticsData({
                    totalResumes: data.resumeCount || 0,
                    totalAnalyses: data.analysisCount || 0,
                    activeUsers: data.userCount || 0,
                });
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#f6f6f8] dark:bg-[#101622] overflow-hidden">
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="max-w-7xl mx-auto flex flex-col gap-8">
                    {/* Page Header */}
                    <div className="flex flex-col gap-1">
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Analytics</h2>
                        <p className="text-slate-500 dark:text-slate-400">Overview of platform usage and engagement.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">description</span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Resumes</p>
                            </div>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                {loading ? '...' : analyticsData.totalResumes.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl">analytics</span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">ATS Analyses</p>
                            </div>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                {loading ? '...' : analyticsData.totalAnalyses.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-violet-600 dark:text-violet-400 text-xl">group</span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Users</p>
                            </div>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                {loading ? '...' : analyticsData.activeUsers.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Info Notice */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 flex items-start gap-4">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl mt-0.5">info</span>
                        <div>
                            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Analytics Overview</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                This page shows real-time platform statistics fetched from the server.
                                For detailed user activity and management, visit the <a href="/admin/users" className="underline font-medium hover:text-blue-900 dark:hover:text-blue-100">User Management</a> section.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="h-20 w-full"></div>
            </main>
        </div>
    );
}
