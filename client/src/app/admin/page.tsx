"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

interface OverviewStats {
    totalUsers: number;
    totalResumes: number;
    totalAnalyses: number;
    todaySignups: number;
    deepAnalysesToday: number;
}

interface ActivityItem {
    id: string;
    type: 'signup' | 'analysis' | 'upgrade' | 'alert' | 'edit';
    title: string;
    subtitle: string;
    time: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<OverviewStats>({
        totalUsers: 0,
        totalResumes: 0,
        totalAnalyses: 0,
        todaySignups: 0,
        deepAnalysesToday: 0
    });
    const [activities, setActivities] = useState<ActivityItem[]>([]);

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

        fetchDashboardData(token);
    }, [router]);

    const fetchDashboardData = async (token: string) => {
        try {
            // Fetch overview stats
            const overviewRes = await fetch(`${API_URL}/stats/overview`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (overviewRes.ok) {
                const data = await overviewRes.json();
                setStats({
                    totalUsers: data.totalUsers || 0,
                    totalResumes: data.totalResumes || 0,
                    totalAnalyses: data.totalAnalyses || 0,
                    todaySignups: data.todaySignups || 0,
                    deepAnalysesToday: data.deepAnalysesToday || 0
                });
            }

            // Fetch activity
            const activityRes = await fetch(`${API_URL}/stats/activity`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (activityRes.ok) {
                const data = await activityRes.json();
                setActivities(data.activities || []);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'signup': return { icon: 'person_add', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-[#1152d4]' };
            case 'analysis': return { icon: 'check_circle', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600' };
            case 'upgrade': return { icon: 'star', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600' };
            case 'alert': return { icon: 'warning', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600' };
            default: return { icon: 'edit', bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600' };
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined animate-spin text-4xl text-[#1152d4]">progress_activity</span>
                    <p className="text-[#4c669a]">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f6f6f8] dark:bg-[#101622] font-['Inter',sans-serif]">
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Header */}
                <header className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a2233] flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">Admin Dashboard</h2>
                    </div>
                    <div className="flex items-center gap-4">
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-7xl mx-auto flex flex-col gap-6">
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {/* Stat Card: Total Users */}
                            <div className="bg-white dark:bg-[#1a2233] p-5 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-[#4c669a] text-sm font-medium">Total Users</p>
                                    <span className="material-symbols-outlined text-[#1152d4] bg-[#1152d4]/10 p-1 rounded-md text-lg">group</span>
                                </div>
                                <p className="text-2xl font-bold text-[#0d121b] dark:text-white mb-1">{stats.totalUsers.toLocaleString()}</p>
                                <div className="flex items-center text-green-600 text-xs font-medium">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    <span className="ml-1">Active</span>
                                </div>
                            </div>

                            {/* Stat Card: Total Resumes */}
                            <div className="bg-white dark:bg-[#1a2233] p-5 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-[#4c669a] text-sm font-medium">Total Resumes</p>
                                    <span className="material-symbols-outlined text-[#1152d4] bg-[#1152d4]/10 p-1 rounded-md text-lg">description</span>
                                </div>
                                <p className="text-2xl font-bold text-[#0d121b] dark:text-white mb-1">{stats.totalResumes.toLocaleString()}</p>
                                <div className="flex items-center text-green-600 text-xs font-medium">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    <span className="ml-1">Uploaded</span>
                                </div>
                            </div>

                            {/* Stat Card: Total Analyses */}
                            <div className="bg-white dark:bg-[#1a2233] p-5 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-[#4c669a] text-sm font-medium">Total Analyses</p>
                                    <span className="material-symbols-outlined text-[#1152d4] bg-[#1152d4]/10 p-1 rounded-md text-lg">analytics</span>
                                </div>
                                <p className="text-2xl font-bold text-[#0d121b] dark:text-white mb-1">{stats.totalAnalyses.toLocaleString()}</p>
                                <div className="flex items-center text-green-600 text-xs font-medium">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    <span className="ml-1">All time</span>
                                </div>
                            </div>

                            {/* Stat Card: Today's Signups */}
                            <div className="bg-white dark:bg-[#1a2233] p-5 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-[#4c669a] text-sm font-medium">Today's Signups</p>
                                    <span className="material-symbols-outlined text-[#1152d4] bg-[#1152d4]/10 p-1 rounded-md text-lg">person_add</span>
                                </div>
                                <p className="text-2xl font-bold text-[#0d121b] dark:text-white mb-1">{stats.todaySignups}</p>
                                <div className="flex items-center text-green-600 text-xs font-medium">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    <span className="ml-1">Today</span>
                                </div>
                            </div>

                            {/* Stat Card: Deep Analyses */}
                            <div className="bg-white dark:bg-[#1a2233] p-5 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-[#4c669a] text-sm font-medium">Deep Analyses</p>
                                    <span className="material-symbols-outlined text-[#1152d4] bg-[#1152d4]/10 p-1 rounded-md text-lg">psychology</span>
                                </div>
                                <p className="text-2xl font-bold text-[#0d121b] dark:text-white mb-1">{stats.deepAnalysesToday}</p>
                                <div className="flex items-center text-green-600 text-xs font-medium">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    <span className="ml-1">Today</span>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="grid grid-cols-1 gap-6">
                            {/* Recent Activity */}
                            <div className="bg-white dark:bg-[#1a2233] rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">Recent Activity</h3>
                                </div>
                                <div className="flex flex-col">
                                    {activities.length > 0 ? activities.slice(0, 8).map((activity, idx) => {
                                        const iconStyle = getActivityIcon(activity.type);
                                        return (
                                            <div key={activity.id || idx} className="group flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
                                                <div className={`size-10 rounded-full ${iconStyle.bg} ${iconStyle.text} flex items-center justify-center flex-shrink-0`}>
                                                    <span className="material-symbols-outlined text-xl">{iconStyle.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[#0d121b] dark:text-white font-medium truncate">{activity.title}</p>
                                                    <p className="text-[#4c669a] text-sm">{activity.subtitle}</p>
                                                </div>
                                                <p className="text-[#4c669a] text-xs whitespace-nowrap">{activity.time}</p>
                                            </div>
                                        );
                                    }) : (
                                        <div className="px-6 py-8 text-center text-[#4c669a]">
                                            <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">inbox</span>
                                            <p>No recent activity</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
