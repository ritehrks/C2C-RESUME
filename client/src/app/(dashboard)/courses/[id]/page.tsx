"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
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

interface ScheduleItem {
    day: string;
    time: string;
    venue: string;
}

interface CourseDetail {
    _id: string;
    title: string;
    description: string;
    instructor: string;
    category: string;
    schedule: ScheduleItem[];
    startDate: string;
    endDate: string;
    maxStudents: number;
    enrolledCount: number;
    enrolledStudents?: string[];
    isEnrolled: boolean;
    isPublished: boolean;
    createdBy?: { name: string; email: string };
}

export default function CourseDetailPage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.id as string;

    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const data = await eventApi.getCourseById(courseId, token || undefined);
            if (data.success) {
                setCourse(data.event);
            } else {
                setError(data.error || 'Course not found');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnroll = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        try {
            setIsEnrolling(true);
            setError('');
            const data = await eventApi.enrollInCourse(courseId, token);
            if (data.success) {
                setSuccessMsg('Successfully enrolled! 🎉');
                setCourse(prev => prev ? { ...prev, isEnrolled: true, enrolledCount: data.enrolledCount } : null);
            } else {
                setError(data.error || 'Failed to enroll');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleUnenroll = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            setIsEnrolling(true);
            setError('');
            const data = await eventApi.unenrollFromCourse(courseId, token);
            if (data.success) {
                setSuccessMsg('Successfully unenrolled');
                setCourse(prev => prev ? { ...prev, isEnrolled: false, enrolledCount: data.enrolledCount } : null);
            } else {
                setError(data.error || 'Failed to unenroll');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setIsEnrolling(false);
        }
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                    <p className="text-slate-500 dark:text-slate-400">Loading course...</p>
                </div>
            </div>
        );
    }

    if (error && !course) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 px-6 py-8 rounded-xl text-center">
                    <span className="material-symbols-outlined text-4xl mb-2 block">error</span>
                    <p className="font-medium">{error}</p>
                    <Link href="/courses" className="text-sm text-app-primary hover:underline mt-3 inline-block">
                        ← Back to Courses
                    </Link>
                </div>
            </div>
        );
    }

    if (!course) return null;

    const catConf = categoryConfig[course.category] || categoryConfig.other;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
            {/* Back Button */}
            <Link
                href="/courses"
                className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-app-primary transition-colors"
            >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back to Courses
            </Link>

            {/* Hero Header */}
            <div className={`rounded-2xl ${catConf.bg} p-6 sm:p-8 relative overflow-hidden`}>
                <div className="absolute top-4 right-4 opacity-10">
                    <span className={`material-symbols-outlined text-[120px] ${catConf.color}`}>{catConf.icon}</span>
                </div>
                <div className="relative z-10 space-y-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${catConf.bg} ${catConf.color} border border-current/10`}>
                        <span className="material-symbols-outlined text-[14px]">{catConf.icon}</span>
                        {catConf.label}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                        {course.instructor && (
                            <div className="flex items-center gap-1.5">
                                <div className="w-8 h-8 rounded-full bg-app-primary/20 flex items-center justify-center">
                                    <span className="text-sm font-bold text-app-primary">{course.instructor.charAt(0).toUpperCase()}</span>
                                </div>
                                <span className="font-medium">{course.instructor}</span>
                            </div>
                        )}
                        {course.startDate && course.endDate && (
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                {formatDate(course.startDate)} — {formatDate(course.endDate)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 px-4 py-3 rounded-xl text-sm">
                    {successMsg}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-white dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-app-primary">description</span>
                            About This Course
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                            {course.description}
                        </p>
                    </div>

                    {/* Schedule */}
                    <div className="bg-white dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-app-primary">schedule</span>
                            Class Schedule
                        </h2>
                        {course.schedule && course.schedule.length > 0 ? (
                            <div className="space-y-3">
                                {course.schedule.map((s, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-app-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-app-primary">{s.day.slice(0, 2)}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{s.day}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{s.time}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                                            {s.venue}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400 italic">Schedule not yet posted.</p>
                        )}
                    </div>
                </div>

                {/* Sidebar (1 col) */}
                <div className="space-y-6">
                    {/* Enrollment Card */}
                    <div className="bg-white dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 sticky top-24">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Enrollment</h3>

                        {/* Enrolled Count */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-app-primary/5 dark:bg-app-primary/10 border border-app-primary/20">
                            <span className="material-symbols-outlined text-app-primary text-[28px]">group</span>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{course.enrolledCount || 0}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">enrolled</p>
                            </div>
                        </div>

                        {/* Enrolled Students List */}
                        {course.enrolledStudents && course.enrolledStudents.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Participants</p>
                                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                    {course.enrolledStudents.map((email: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm">
                                            <div className="w-6 h-6 rounded-full bg-app-primary/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-[10px] font-bold text-app-primary">{email.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <span className="text-slate-700 dark:text-slate-300 truncate">{email}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Enroll / Unenroll Button */}
                        {course.isEnrolled ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                                    <span className="text-sm font-medium text-green-700 dark:text-green-400">You&apos;re enrolled!</span>
                                </div>
                                <button
                                    onClick={handleUnenroll}
                                    disabled={isEnrolling}
                                    className="w-full py-2.5 px-4 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                >
                                    {isEnrolling ? 'Processing...' : 'Unenroll'}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleEnroll}
                                disabled={isEnrolling}
                                className="w-full py-3 px-4 rounded-lg text-sm font-semibold bg-app-primary hover:bg-blue-700 text-white shadow-lg shadow-app-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isEnrolling ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                        Enrolling...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                                        Enroll Now
                                    </>
                                )}
                            </button>
                        )}

                        {/* Quick Stats */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-sm">
                            {course.startDate && course.endDate && (
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Duration</p>
                                        <p className="text-xs">{formatDate(course.startDate)} — {formatDate(course.endDate)}</p>
                                    </div>
                                </div>
                            )}
                            {course.schedule && (
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-[20px]">event_repeat</span>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Classes per week</p>
                                        <p className="text-xs">{course.schedule.length} session{course.schedule.length !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                            )}
                            {course.createdBy && (
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Created by</p>
                                        <p className="text-xs">{course.createdBy.name}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
