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

interface AnalysisStats {
    byType: { simple: number; deep: number };
    byRole: Record<string, number>;
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
    const [analysisStats, setAnalysisStats] = useState<AnalysisStats | null>(null);

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

            // Fetch analysis stats
            const analysisRes = await fetch(`${API_URL}/stats/analysis`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (analysisRes.ok) {
                const data = await analysisRes.json();
                setAnalysisStats(data);
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

    // Calculate role percentages for bar chart
    const roleData = analysisStats?.byRole ? Object.entries(analysisStats.byRole)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([role, count]) => ({
            role,
            count,
            percentage: Math.round((count / Object.values(analysisStats.byRole).reduce((a, b) => a + b, 0)) * 100)
        })) : [];

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
                        <button className="p-2 text-[#4c669a] hover:text-[#1152d4] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2233]"></span>
                        </button>
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

                        {/* Main Content Split */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left Column: Recent Activity */}
                            <div className="lg:col-span-7 flex flex-col gap-4">
                                <div className="bg-white dark:bg-[#1a2233] rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm flex-1">
                                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">Recent Activity</h3>
                                        <button className="text-[#1152d4] text-sm font-medium hover:underline">View All</button>
                                    </div>
                                    <div className="flex flex-col">
                                        {activities.length > 0 ? activities.slice(0, 5).map((activity, idx) => {
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

                            {/* Right Column: Charts */}
                            <div className="lg:col-span-5 flex flex-col gap-6">
                                {/* Pie Chart: Analysis Types */}
                                <div className="bg-white dark:bg-[#1a2233] rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                                    <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-6">Analysis Types</h3>
                                    <div className="flex items-center justify-between gap-6">
                                        <div
                                            className="size-32 rounded-full flex-shrink-0 relative shadow-inner"
                                            style={{
                                                background: `conic-gradient(
                                                    #1152d4 0% ${analysisStats?.byType ? Math.round((analysisStats.byType.simple / (analysisStats.byType.simple + analysisStats.byType.deep)) * 100) : 70}%, 
                                                    #3b82f6 ${analysisStats?.byType ? Math.round((analysisStats.byType.simple / (analysisStats.byType.simple + analysisStats.byType.deep)) * 100) : 70}% 100%
                                                )`
                                            }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="bg-white dark:bg-[#1a2233] rounded-full size-20 flex items-center justify-center shadow-sm">
                                                    <span className="text-xs font-bold text-[#4c669a]">Distribution</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 flex-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-3 rounded-full bg-[#1152d4]"></div>
                                                    <span className="text-[#4c669a]">Simple</span>
                                                </div>
                                                <span className="font-bold text-[#0d121b] dark:text-white">
                                                    {analysisStats?.byType?.simple || 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-3 rounded-full bg-[#3b82f6]"></div>
                                                    <span className="text-[#4c669a]">Deep (AI)</span>
                                                </div>
                                                <span className="font-bold text-[#0d121b] dark:text-white">
                                                    {analysisStats?.byType?.deep || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bar Chart: Target Roles */}
                                <div className="bg-white dark:bg-[#1a2233] rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex-1">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">Target Roles</h3>
                                    </div>
                                    <div className="flex flex-col gap-5">
                                        {roleData.length > 0 ? roleData.map((item, idx) => (
                                            <div key={item.role} className="flex flex-col gap-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-[#0d121b] dark:text-white font-medium">{item.role}</span>
                                                    <span className="text-[#4c669a]">{item.percentage}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${idx === 0 ? 'bg-[#1152d4]' : idx === 1 ? 'bg-blue-400' : idx === 2 ? 'bg-blue-300' : 'bg-blue-200'}`}
                                                        style={{ width: `${item.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center text-[#4c669a] py-4">
                                                <p>No role data available</p>
                                            </div>
                                        )}
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
