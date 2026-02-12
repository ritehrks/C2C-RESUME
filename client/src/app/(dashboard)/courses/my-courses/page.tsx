"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { eventApi } from '@/lib/api';

const categoryConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    'programming': { label: 'Programming', icon: 'code', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    'web-dev': { label: 'Web Dev', icon: 'language', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    'data-science': { label: 'Data Science', icon: 'bar_chart', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    'ai-ml': { label: 'AI / ML', icon: 'psychology', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20' },
    'design': { label: 'Design', icon: 'palette', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    'dsa': { label: 'DSA', icon: 'data_object', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    'other': { label: 'Other', icon: 'school', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800' },
};

interface CourseItem {
    _id: string;
    title: string;
    instructor: string;
    category: string;
    schedule: { day: string; time: string; venue: string }[];
    startDate: string;
    endDate: string;
    enrolledCount: number;
}

export default function MyEnrollmentsPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        fetchEnrollments(token);
    }, [router]);

    const fetchEnrollments = async (token: string) => {
        try {
            setIsLoading(true);
            const data = await eventApi.getMyEnrollments(token);
            if (data.success) {
                setCourses(data.events);
            } else {
                setError(data.error || 'Failed to load enrollments');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const getCatConfig = (cat: string) => categoryConfig[cat] || categoryConfig.other;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                    <p className="text-slate-500 dark:text-slate-400">Loading your courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        My Enrollments
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Courses you&apos;re currently enrolled in.</p>
                </div>
                <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 bg-app-primary hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-lg shadow-app-primary/20 text-sm whitespace-nowrap"
                >
                    <span className="material-symbols-outlined text-[20px]">explore</span>
                    Explore More
                </Link>
            </header>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {courses.length === 0 ? (
                <div className="bg-white dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4 block">bookmark_border</span>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Enrollments Yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                        You haven&apos;t enrolled in any courses yet. Browse available courses to get started.
                    </p>
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 bg-app-primary hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors text-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">explore</span>
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => {
                        const catConf = getCatConfig(course.category);

                        return (
                            <Link
                                key={course._id}
                                href={`/courses/${course._id}`}
                                className="group bg-white dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-lg hover:border-app-primary/40 transition-all duration-300"
                            >
                                <div className={`h-28 ${catConf.bg} relative flex items-center justify-center overflow-hidden`}>
                                    <span className={`material-symbols-outlined text-5xl ${catConf.color} opacity-30 group-hover:scale-110 transition-transform duration-300`}>{catConf.icon}</span>
                                    <div className="absolute top-3 left-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${catConf.bg} ${catConf.color}`}>
                                            {categoryConfig[course.category]?.label || 'Other'}
                                        </span>
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500 text-white">ENROLLED</span>
                                    </div>
                                </div>

                                <div className="p-4 space-y-2">
                                    <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-app-primary transition-colors line-clamp-1">
                                        {course.title}
                                    </h3>
                                    {course.instructor && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[14px]">person</span>
                                            {course.instructor}
                                        </div>
                                    )}
                                    {course.schedule && course.schedule.length > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                                            {course.schedule.map(s => s.day).join(', ')}
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
                                        {course.startDate && course.endDate ? `${formatDate(course.startDate)} — ${formatDate(course.endDate)}` : 'Date TBD'}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
