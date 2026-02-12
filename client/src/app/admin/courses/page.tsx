"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { eventApi } from '@/lib/api';

const categoryOptions = [
    { value: 'programming', label: 'Programming' },
    { value: 'web-dev', label: 'Web Dev' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'ai-ml', label: 'AI / ML' },
    { value: 'design', label: 'Design' },
    { value: 'dsa', label: 'DSA' },
    { value: 'other', label: 'Other' },
];

interface ScheduleItem {
    day: string;
    time: string;
    venue: string;
}

interface CourseItem {
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
    isPublished: boolean;
}

const emptyForm = {
    title: '',
    description: '',
    instructor: '',
    category: 'other',
    startDate: '',
    endDate: '',
    maxStudents: 50,
    schedule: [] as ScheduleItem[],
};

export default function AdminCoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [isSaving, setIsSaving] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (!token || !user) { router.push('/login'); return; }
        const userData = JSON.parse(user);
        if (userData.role !== 'admin') { router.push('/dashboard'); return; }
        fetchCourses(token);
    }, [router]);

    const fetchCourses = async (token: string) => {
        try {
            setIsLoading(true);
            const data = await eventApi.getAllCourses(token);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            setIsSaving(true);
            setError('');

            let data;
            if (editingId) {
                data = await eventApi.updateCourse(token, editingId, form);
            } else {
                data = await eventApi.createCourse(token, { ...form, isPublished: true });
            }

            if (data.success) {
                resetForm();
                fetchCourses(token);
            } else {
                setError(data.error || 'Failed to save course');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (course: CourseItem) => {
        setForm({
            title: course.title,
            description: course.description,
            instructor: course.instructor,
            category: course.category,
            startDate: course.startDate?.split('T')[0] || '',
            endDate: course.endDate?.split('T')[0] || '',
            maxStudents: course.maxStudents,
            schedule: course.schedule || [],
        });
        setEditingId(course._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const data = await eventApi.deleteCourse(token, id);
            if (data.success) {
                setDeleteConfirmId(null);
                fetchCourses(token);
            } else {
                setError(data.error || 'Delete failed');
            }
        } catch {
            setError('Failed to delete');
        }
    };

    const handleTogglePublish = async (id: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const data = await eventApi.togglePublish(token, id);
            if (data.success) {
                setCourses(prev => prev.map(c =>
                    c._id === id ? { ...c, isPublished: data.isPublished } : c
                ));
            }
        } catch {
            setError('Failed to toggle publish');
        }
    };

    const resetForm = () => {
        setForm({ ...emptyForm });
        setEditingId(null);
        setShowForm(false);
    };

    const addScheduleItem = () => {
        setForm(f => ({ ...f, schedule: [...f.schedule, { day: 'Monday', time: '', venue: '' }] }));
    };

    const removeScheduleItem = (idx: number) => {
        setForm(f => ({ ...f, schedule: f.schedule.filter((_, i) => i !== idx) }));
    };

    const updateScheduleItem = (idx: number, field: keyof ScheduleItem, value: string) => {
        setForm(f => ({
            ...f,
            schedule: f.schedule.map((s, i) => i === idx ? { ...s, [field]: value } : s),
        }));
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f6f6f8] dark:bg-[#101622] font-['Inter',sans-serif]">
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Header */}
                <header className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a2233] flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">Manage Courses</h2>
                        <span className="text-sm text-[#4c669a]">Create and manage courses for students</span>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="flex items-center gap-2 bg-[#1152d4] hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-lg shadow-[#1152d4]/20 text-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        New Course
                    </button>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-5xl mx-auto flex flex-col gap-6">

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
                                <span>{error}</span>
                                <button onClick={() => setError('')} className="font-bold text-lg ml-4">×</button>
                            </div>
                        )}

                        {/* Create / Edit Form */}
                        {showForm && (
                            <div className="bg-white dark:bg-[#1a2233] rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                                <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#1152d4]">{editingId ? 'edit' : 'add_circle'}</span>
                                    {editingId ? 'Edit Course' : 'Create New Course'}
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Title */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-[#4c669a] mb-1">Course Title *</label>
                                            <input
                                                type="text"
                                                value={form.title}
                                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                                required
                                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#101622] text-[#0d121b] dark:text-white text-sm focus:ring-2 focus:ring-[#1152d4]/50 focus:border-[#1152d4] outline-none transition-all"
                                                placeholder="e.g., Data Structures & Algorithms"
                                            />
                                        </div>

                                        {/* Instructor */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#4c669a] mb-1">Instructor *</label>
                                            <input
                                                type="text"
                                                value={form.instructor}
                                                onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))}
                                                required
                                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#101622] text-[#0d121b] dark:text-white text-sm focus:ring-2 focus:ring-[#1152d4]/50 focus:border-[#1152d4] outline-none transition-all"
                                                placeholder="e.g., Prof. Sharma"
                                            />
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#4c669a] mb-1">Category</label>
                                            <select
                                                value={form.category}
                                                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#101622] text-[#0d121b] dark:text-white text-sm focus:ring-2 focus:ring-[#1152d4]/50 focus:border-[#1152d4] outline-none transition-all"
                                            >
                                                {categoryOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Dates */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#4c669a] mb-1">Start Date *</label>
                                            <input
                                                type="date"
                                                value={form.startDate}
                                                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                                                required
                                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#101622] text-[#0d121b] dark:text-white text-sm focus:ring-2 focus:ring-[#1152d4]/50 focus:border-[#1152d4] outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#4c669a] mb-1">End Date *</label>
                                            <input
                                                type="date"
                                                value={form.endDate}
                                                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                                                required
                                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#101622] text-[#0d121b] dark:text-white text-sm focus:ring-2 focus:ring-[#1152d4]/50 focus:border-[#1152d4] outline-none transition-all"
                                            />
                                        </div>

                                        {/* Max Students */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#4c669a] mb-1">Max Students</label>
                                            <input
                                                type="number"
                                                value={form.maxStudents}
                                                onChange={e => setForm(f => ({ ...f, maxStudents: Number(e.target.value) }))}
                                                min={1}
                                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#101622] text-[#0d121b] dark:text-white text-sm focus:ring-2 focus:ring-[#1152d4]/50 focus:border-[#1152d4] outline-none transition-all"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-[#4c669a] mb-1">Description *</label>
                                            <textarea
                                                value={form.description}
                                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                                required
                                                rows={4}
                                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#101622] text-[#0d121b] dark:text-white text-sm focus:ring-2 focus:ring-[#1152d4]/50 focus:border-[#1152d4] outline-none transition-all resize-y"
                                                placeholder="Describe what students will learn, prerequisites, etc."
                                            />
                                        </div>
                                    </div>

                                    {/* Schedule Builder */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium text-[#4c669a]">Class Schedule</label>
                                            <button
                                                type="button"
                                                onClick={addScheduleItem}
                                                className="text-xs text-[#1152d4] hover:underline font-medium flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">add</span>
                                                Add Session
                                            </button>
                                        </div>
                                        {form.schedule.length === 0 ? (
                                            <p className="text-sm text-[#4c669a] italic">No sessions added yet. Click &quot;Add Session&quot; above.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {form.schedule.map((s, i) => (
                                                    <div key={i} className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-[#f6f6f8] dark:bg-[#101622] border border-gray-100 dark:border-gray-700/50">
                                                        <select
                                                            value={s.day}
                                                            onChange={e => updateScheduleItem(i, 'day', e.target.value)}
                                                            className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-[#1a2233] text-sm text-[#0d121b] dark:text-white outline-none"
                                                        >
                                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                                                <option key={d} value={d}>{d}</option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="text"
                                                            value={s.time}
                                                            onChange={e => updateScheduleItem(i, 'time', e.target.value)}
                                                            placeholder="10:00 AM - 12:00 PM"
                                                            className="flex-1 min-w-[140px] px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-[#1a2233] text-sm text-[#0d121b] dark:text-white outline-none"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={s.venue}
                                                            onChange={e => updateScheduleItem(i, 'venue', e.target.value)}
                                                            placeholder="Room 101"
                                                            className="w-28 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-[#1a2233] text-sm text-[#0d121b] dark:text-white outline-none"
                                                        />
                                                        <button type="button" onClick={() => removeScheduleItem(i)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="flex items-center gap-2 bg-[#1152d4] hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm disabled:opacity-50"
                                        >
                                            {isSaving && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                                            {editingId ? 'Update Course' : 'Create Course'}
                                        </button>
                                        <button type="button" onClick={resetForm} className="text-sm text-[#4c669a] hover:text-[#0d121b] dark:hover:text-white font-medium">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Loading */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="flex flex-col items-center gap-4">
                                    <span className="material-symbols-outlined animate-spin text-4xl text-[#1152d4]">progress_activity</span>
                                    <p className="text-[#4c669a]">Loading courses...</p>
                                </div>
                            </div>
                        ) : courses.length === 0 && !showForm ? (
                            /* Empty State */
                            <div className="bg-white dark:bg-[#1a2233] rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
                                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">menu_book</span>
                                <h3 className="text-xl font-bold text-[#0d121b] dark:text-white mb-2">No Courses Yet</h3>
                                <p className="text-[#4c669a] mb-4">Create your first course to get started.</p>
                                <button
                                    onClick={() => { resetForm(); setShowForm(true); }}
                                    className="flex items-center gap-2 mx-auto bg-[#1152d4] hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors text-sm"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                    Create First Course
                                </button>
                            </div>
                        ) : (
                            /* Courses List */
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">All Courses ({courses.length})</h3>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {courses.map(course => (
                                        <div
                                            key={course._id}
                                            className="bg-white dark:bg-[#1a2233] rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-base font-semibold text-[#0d121b] dark:text-white truncate">{course.title}</h4>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${course.isPublished
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}>
                                                        {course.isPublished ? 'Published' : 'Draft'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-[#4c669a]">
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">person</span>
                                                        {course.instructor}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">group</span>
                                                        {course.enrolledCount}/{course.maxStudents}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                        {formatDate(course.startDate)} — {formatDate(course.endDate)}
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[#4c669a] font-medium">
                                                        {categoryOptions.find(c => c.value === course.category)?.label || 'Other'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => handleTogglePublish(course._id)}
                                                    className={`p-2 rounded-lg transition-colors ${course.isPublished
                                                        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                        : 'text-[#4c669a] hover:bg-gray-100 dark:hover:bg-gray-800'
                                                        }`}
                                                    title={course.isPublished ? 'Unpublish' : 'Publish'}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        {course.isPublished ? 'visibility' : 'visibility_off'}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(course)}
                                                    className="p-2 rounded-lg text-[#4c669a] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                {deleteConfirmId === course._id ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleDelete(course._id)}
                                                            className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            className="px-2 py-1 text-xs font-medium text-[#4c669a] hover:text-[#0d121b]"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirmId(course._id)}
                                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
