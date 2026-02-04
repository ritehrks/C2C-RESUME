"use client";

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

interface AnalyticsData {
    totalResumes: number;
    totalAnalyses: number;
    activeUsers: number;
    conversionRate: number;
    resumeGrowth: number;
    analysisGrowth: number;
    userGrowth: number;
    conversionGrowth: number;
}

export default function AdminAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
        totalResumes: 0,
        totalAnalyses: 0,
        activeUsers: 0,
        conversionRate: 0,
        resumeGrowth: 0,
        analysisGrowth: 0,
        userGrowth: 0,
        conversionGrowth: 0
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
                    conversionRate: 24.8,
                    resumeGrowth: 12.5,
                    analysisGrowth: 5.2,
                    userGrowth: 8.1,
                    conversionGrowth: 2.4
                });
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const branchData = [
        { name: 'CSE', value: 1240, height: 180 },
        { name: 'ECE', value: 980, height: 140 },
        { name: 'ME', value: 540, height: 90 },
        { name: 'CE', value: 320, height: 60 },
        { name: 'IT', value: 1100, height: 160 },
    ];

    const heatmapData = [
        { day: 'Mon', values: [20, 60, 100, 40] },
        { day: 'Tue', values: [30, 50, 90, 30] },
        { day: 'Wed', values: [40, 80, 100, 50] },
        { day: 'Thu', values: [30, 60, 80, 40] },
        { day: 'Fri', values: [20, 40, 50, 20] },
        { day: 'Sat', values: [5, 20, 30, 5] },
        { day: 'Sun', values: [5, 10, 40, 5] },
    ];

    const templateData = [
        { name: 'MNIT Official', category: 'Academic', uses: 4289, downloads: 3890, rate: 92 },
        { name: 'Generic ATS', category: 'Professional', uses: 2105, downloads: 1850, rate: 88 },
        { name: 'Minimalist Pro', category: 'General', uses: 1940, downloads: 1455, rate: 75 },
    ];

    return (
        <div className="flex h-screen w-full bg-[#f6f6f8] dark:bg-[#101622] overflow-hidden">
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="max-w-7xl mx-auto flex flex-col gap-8">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Detailed Analytics</h2>
                            <p className="text-slate-500 dark:text-slate-400">Insights into resume generation, ATS scans, and user engagement metrics.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all">
                                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                                <span>Last 30 Days</span>
                                <span className="material-symbols-outlined text-[18px]">expand_more</span>
                            </button>
                            <button className="flex items-center gap-2 bg-[#1152d4] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-500/20 transition-all">
                                <span className="material-symbols-outlined text-[20px]">download</span>
                                <span>Export Report</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                            <div className="flex justify-between items-start">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Resumes Generated</p>
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded">+{analyticsData.resumeGrowth}%</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                                {loading ? '...' : analyticsData.totalResumes.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                            <div className="flex justify-between items-start">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">ATS Analyses Run</p>
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded">+{analyticsData.analysisGrowth}%</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                                {loading ? '...' : analyticsData.totalAnalyses.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                            <div className="flex justify-between items-start">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Users</p>
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded">+{analyticsData.userGrowth}%</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                                {loading ? '...' : analyticsData.activeUsers.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                            <div className="flex justify-between items-start">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg. Conversion Rate</p>
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded">+{analyticsData.conversionGrowth}%</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{analyticsData.conversionRate}%</p>
                        </div>
                    </div>

                    {/* Activity Trends Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Activity Trends</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Daily breakdown of core system activities</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="size-3 rounded-full bg-[#1152d4]"></span>
                                    <span className="text-slate-600 dark:text-slate-300 font-medium">Resumes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="size-3 rounded-full bg-slate-300 dark:bg-slate-500"></span>
                                    <span className="text-slate-600 dark:text-slate-300 font-medium">ATS Scans</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full h-64 relative">
                            {/* Chart Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-full h-px bg-slate-100 dark:bg-slate-700/50"></div>
                                ))}
                            </div>
                            {/* SVG Chart */}
                            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#1152d4" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#1152d4" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d="M0,80 C10,75 20,85 30,70 C40,55 50,65 60,60 C70,55 80,65 90,50 L100,55" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                                <path d="M0,60 C10,50 20,55 30,30 C40,10 50,40 60,25 C70,15 80,35 90,20 L100,10" fill="none" stroke="#1152d4" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                                <path d="M0,60 C10,50 20,55 30,30 C40,10 50,40 60,25 C70,15 80,35 90,20 L100,10 V100 H0 Z" fill="url(#gradientPrimary)" style={{ opacity: 0.5 }} />
                            </svg>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-4 px-2">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map(month => (
                                <span key={month}>{month}</span>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Bar Chart: User Growth by Branch */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col h-full">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Growth by Branch</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">New signups segmented by academic discipline</p>
                            </div>
                            <div className="flex-1 flex items-end justify-between gap-4 px-2 min-h-[200px]">
                                {branchData.map((branch, idx) => (
                                    <div key={branch.name} className="flex flex-col items-center gap-2 group w-full">
                                        <div
                                            className="w-full max-w-[40px] bg-[#1152d4] rounded-t-lg relative transition-all hover:opacity-90"
                                            style={{ height: branch.height, opacity: 1 - idx * 0.15 }}
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap">
                                                {branch.value.toLocaleString()}
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{branch.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Heatmap: Peak Usage */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col">
                            <div className="mb-6 flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Peak Usage Times</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Heatmap of activity by day & time</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>Low</span>
                                    <div className="flex gap-0.5">
                                        <div className="size-3 bg-slate-100 dark:bg-slate-700 rounded-sm"></div>
                                        <div className="size-3 bg-[#1152d4]/30 rounded-sm"></div>
                                        <div className="size-3 bg-[#1152d4]/60 rounded-sm"></div>
                                        <div className="size-3 bg-[#1152d4] rounded-sm"></div>
                                    </div>
                                    <span>High</span>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="grid grid-cols-[auto_repeat(7,_1fr)] gap-2">
                                    <div className="flex flex-col justify-around text-[10px] text-slate-400 font-medium text-right pr-2 py-1">
                                        <span>Morning</span>
                                        <span>Afternoon</span>
                                        <span>Evening</span>
                                        <span>Night</span>
                                    </div>
                                    {heatmapData.map(day => (
                                        <div key={day.day} className="flex flex-col gap-2">
                                            {day.values.map((val, idx) => (
                                                <div
                                                    key={idx}
                                                    className="h-8 rounded-sm w-full"
                                                    style={{
                                                        backgroundColor: val < 10 ? '#e2e8f0' : `rgba(17, 82, 212, ${val / 100})`
                                                    }}
                                                ></div>
                                            ))}
                                            <div className="text-[10px] text-center text-slate-400 font-medium">{day.day}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Template Performance Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Performing Templates</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Templates with highest download and conversion rates</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4">Template Name</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Total Uses</th>
                                        <th className="px-6 py-4">Downloads</th>
                                        <th className="px-6 py-4">Conversion Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {templateData.map((template) => (
                                        <tr key={template.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                                <div className="size-8 rounded bg-[#1152d4]/10 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-[#1152d4] text-[16px]">description</span>
                                                </div>
                                                {template.name}
                                            </td>
                                            <td className="px-6 py-4">{template.category}</td>
                                            <td className="px-6 py-4">{template.uses.toLocaleString()}</td>
                                            <td className="px-6 py-4">{template.downloads.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                                                        <div
                                                            className={`h-1.5 rounded-full ${template.rate >= 85 ? 'bg-green-500' : template.rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                            style={{ width: `${template.rate}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`text-xs font-bold ${template.rate >= 85 ? 'text-green-600 dark:text-green-400' : template.rate >= 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {template.rate}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="h-20 w-full"></div>
            </main>
        </div>
    );
}
