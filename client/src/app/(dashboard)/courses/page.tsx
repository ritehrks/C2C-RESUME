"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { eventApi } from '@/lib/api';

const categoryConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    'contest': { label: 'Contest', icon: 'emoji_events', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    'course': { label: 'Course', icon: 'menu_book', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    'coding_contest': { label: 'Coding Contest', icon: 'code', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    'workshop': { label: 'Workshop', icon: 'construction', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    'hackathon': { label: 'Hackathon', icon: 'rocket_launch', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    'meeting': { label: 'Meeting', icon: 'groups', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    'seminar': { label: 'Seminar', icon: 'school', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20' },
    'other': { label: 'Other', icon: 'event', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800' },
};

const categories = [
    { key: 'all', label: 'All Events', icon: 'apps' },
    { key: 'contest', label: 'Contest', icon: 'emoji_events' },
    { key: 'course', label: 'Course', icon: 'menu_book' },
    { key: 'coding_contest', label: 'Coding Contest', icon: 'code' },
    { key: 'workshop', label: 'Workshop', icon: 'construction' },
    { key: 'hackathon', label: 'Hackathon', icon: 'rocket_launch' },
    { key: 'meeting', label: 'Meeting', icon: 'groups' },
    { key: 'seminar', label: 'Seminar', icon: 'school' },
    { key: 'other', label: 'Other', icon: 'event' },
];

interface CourseItem {
    _id: string;
    title: string;
    description: string;
    instructor: string;
    category: string;
    thumbnail?: string;
    schedule: { day: string; time: string; venue: string }[];
    startDate: string;
    endDate: string;
    maxStudents: number;
    enrolledCount: number;
}

export default function ExploreCourses() {
    const router = useRouter();
    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchDebounce, setSearchDebounce] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setSearchDebounce(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchCourses();
    }, [activeCategory, searchDebounce]);

    const fetchCourses = async () => {
        try {
            setIsLoading(true);
            const data = await eventApi.getPublishedCourses(activeCategory, searchDebounce);
            if (data.success) {
                setCourses(data.events);
            } else {
                setError(data.error || 'Failed to load courses');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getCatConfig = (cat: string) => categoryConfig[cat] || categoryConfig.other;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Explore Events
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Browse and enroll in events offered by your institution.
                    </p>
                </div>
                <Link
                    href="/courses/my-courses"
                    className="inline-flex items-center gap-2 bg-app-primary hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-lg shadow-app-primary/20 text-sm whitespace-nowrap"
                >
                    <span className="material-symbols-outlined text-[20px]">bookmark</span>
                    My Enrollments
                </Link>
            </header>

            {/* Search + Category Filter */}
            <div className="space-y-4">
                {/* Search */}
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400">search</span>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search events, instructors..."
                        className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#151c2c] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-app-primary/50 focus:border-app-primary text-sm transition-all"
                    />
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.key
                                ? 'bg-app-primary text-white shadow-md shadow-app-primary/30'
                                : 'bg-white dark:bg-[#151c2c] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-app-primary/50 hover:text-app-primary'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Courses Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                        <p className="text-slate-500 dark:text-slate-400">Loading events...</p>
                    </div>
                </div>
            ) : courses.length === 0 ? (
                <div className="bg-white dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4 block">event</span>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Events Available</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        {searchQuery || activeCategory !== 'all'
                            ? 'No events match your filter. Try a different category or search term.'
                            : 'New events will appear here once they are published.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => {
                        const catConf = getCatConfig(course.category);


                        return (
                            <Link
                                key={course._id}
                                href={`/courses/${course._id}`}
                                className="group bg-white dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-lg hover:border-app-primary/40 transition-all duration-300"
                            >
                                {/* Thumbnail / Color Header */}
                                <div className={`h-36 ${catConf.bg} relative flex items-center justify-center overflow-hidden`}>
                                    <span className={`material-symbols-outlined text-6xl ${catConf.color} opacity-30 group-hover:scale-110 transition-transform duration-300`}>
                                        {catConf.icon}
                                    </span>
                                    {/* Category badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${catConf.bg} ${catConf.color} backdrop-blur-sm border border-white/20`}>
                                            <span className="material-symbols-outlined text-[14px]">{catConf.icon}</span>
                                            {categoryConfig[course.category]?.label || 'Other'}
                                        </span>
                                    </div>

                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-app-primary transition-colors line-clamp-1">
                                            {course.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                            {course.description}
                                        </p>
                                    </div>

                                    {/* Instructor */}
                                    {course.instructor && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-app-primary/10 flex items-center justify-center">
                                                <span className="text-xs font-bold text-app-primary">{course.instructor.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{course.instructor}</span>
                                        </div>
                                    )}

                                    {/* Schedule preview */}
                                    {course.schedule && course.schedule.length > 0 && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                                            {course.schedule.slice(0, 2).map(s => s.day).join(', ')}
                                            {course.schedule.length > 2 && ` +${course.schedule.length - 2} more`}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">group</span>
                                            <span>{course.enrolledCount || 0} enrolled</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                            <span>{course.startDate ? formatDate(course.startDate) : 'TBD'}</span>
                                        </div>
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
