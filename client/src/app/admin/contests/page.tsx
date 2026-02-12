"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { eventApi } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';

// Contest type configuration
const contestTypes = [
    { value: 'contest', label: 'Contest', icon: 'emoji_events', color: 'bg-amber-500', gradient: 'from-amber-500/10 to-yellow-500/10', textColor: 'text-amber-600' },
    { value: 'course', label: 'Course', icon: 'menu_book', color: 'bg-indigo-500', gradient: 'from-indigo-500/10 to-blue-500/10', textColor: 'text-indigo-600' },
    { value: 'coding_contest', label: 'Coding Contest', icon: 'code', color: 'bg-purple-500', gradient: 'from-purple-500/10 to-indigo-500/10', textColor: 'text-purple-600' },
    { value: 'workshop', label: 'Workshop', icon: 'school', color: 'bg-blue-500', gradient: 'from-blue-500/10 to-cyan-500/10', textColor: 'text-blue-600' },
    { value: 'hackathon', label: 'Hackathon', icon: 'rocket_launch', color: 'bg-orange-500', gradient: 'from-orange-500/10 to-red-500/10', textColor: 'text-orange-600' },
    { value: 'meeting', label: 'Meeting', icon: 'groups', color: 'bg-green-500', gradient: 'from-green-500/10 to-teal-500/10', textColor: 'text-green-600' },
    { value: 'seminar', label: 'Seminar', icon: 'mic', color: 'bg-teal-500', gradient: 'from-teal-500/10 to-cyan-500/10', textColor: 'text-teal-600' },
    { value: 'other', label: 'Other Event', icon: 'event', color: 'bg-gray-500', gradient: 'from-gray-500/10 to-slate-500/10', textColor: 'text-gray-600' },
];

interface Contest {
    _id: string;
    title: string;
    description?: string;
    type: string;
    venue: string;
    date: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    requiresGPS: boolean;
    venueLatitude?: number;
    venueLongitude?: number;
    gpsRadius: number;
    qrToken: string;
    attendanceCount: number;
    attendanceUrl: string;
    createdAt: string;
}

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

export default function AdminContestsPage() {
    const router = useRouter();
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [contests, setContests] = useState<Contest[]>([]);
    const [filter, setFilter] = useState({ status: 'all', type: 'all' });
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
    const [editingContest, setEditingContest] = useState<Contest | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'other',
        venue: '',
        date: '',
        startTime: '',
        endTime: '',
        maxParticipants: '',
        link: '',
        requiresGPS: false,
        venueLatitude: '',
        venueLongitude: '',
        gpsRadius: '100',
    });
    const [formError, setFormError] = useState('');
    const [formSubmitting, setFormSubmitting] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (!storedToken || !user) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(user);
        if (userData.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        setToken(storedToken);
        fetchContests(storedToken);
    }, [router]);

    const fetchContests = async (authToken: string) => {
        try {
            setIsLoading(true);
            const data = await eventApi.getAllContests(authToken, {
                status: filter.status !== 'all' ? filter.status : undefined,
                type: filter.type !== 'all' ? filter.type : undefined,
            });

            if (data.success) {
                setContests(data.events);
            }
        } catch (error) {
            console.error('Failed to fetch contests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchContests(token);
        }
    }, [filter, token]);

    // Form handlers
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'other',
            venue: '',
            date: '',
            startTime: '',
            endTime: '',
            maxParticipants: '',
            link: '',
            requiresGPS: false,
            venueLatitude: '',
            venueLongitude: '',
            gpsRadius: '100',
        });
        setFormError('');
        setEditingContest(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const openEditModal = (contest: Contest) => {
        setEditingContest(contest);
        setFormData({
            title: contest.title,
            description: contest.description || '',
            type: contest.type,
            venue: contest.venue,
            date: new Date(contest.date).toISOString().split('T')[0],
            startTime: contest.startTime,
            endTime: contest.endTime,
            maxParticipants: '',
            link: (contest as any).link || '',
            requiresGPS: contest.requiresGPS,
            venueLatitude: contest.venueLatitude?.toString() || '',
            venueLongitude: contest.venueLongitude?.toString() || '',
            gpsRadius: contest.gpsRadius.toString(),
        });
        setShowCreateModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormSubmitting(true);

        try {
            const payload = {
                ...formData,
                category: formData.type,
                link: formData.link || undefined,
                isPublished: true,
                maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
                venueLatitude: formData.venueLatitude ? parseFloat(formData.venueLatitude) : undefined,
                venueLongitude: formData.venueLongitude ? parseFloat(formData.venueLongitude) : undefined,
                gpsRadius: parseInt(formData.gpsRadius),
            };

            let result;
            if (editingContest) {
                result = await eventApi.updateContest(token, editingContest._id, payload);
            } else {
                result = await eventApi.createContest(token, payload);
            }

            if (result.success) {
                setShowCreateModal(false);
                resetForm();
                fetchContests(token);
            } else {
                setFormError(result.error || 'Failed to save contest');
            }
        } catch (error) {
            setFormError('Failed to save contest');
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleDelete = async (contest: Contest) => {
        if (!confirm(`Are you sure you want to delete "${contest.title}"? This will also delete all attendance records.`)) {
            return;
        }

        try {
            const result = await eventApi.deleteContest(token, contest._id);
            if (result.success) {
                fetchContests(token);
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleToggleStatus = async (contest: Contest) => {
        try {
            const result = await eventApi.toggleContestStatus(token, contest._id);
            if (result.success) {
                fetchContests(token);
            }
        } catch (error) {
            console.error('Toggle status failed:', error);
        }
    };

    const showQR = (contest: Contest) => {
        setSelectedContest(contest);
        setShowQRModal(true);
    };

    const getTypeConfig = (type: string) => {
        return contestTypes.find(t => t.value === type) || contestTypes[5];
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const downloadQR = () => {
        if (!selectedContest) return;
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');

            const downloadLink = document.createElement('a');
            downloadLink.download = `${selectedContest.title.replace(/[^a-z0-9]/gi, '_')}_QR.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    // Determine contest status label
    const getStatusLabel = (contest: Contest) => {
        const now = new Date();
        const eventDate = new Date(contest.date);
        if (!contest.isActive) return { label: 'Draft', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' };
        if (eventDate < now && eventDate.toDateString() !== now.toDateString()) return { label: 'Past', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' };
        return { label: 'Active', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' };
    };

    // Filter contests by search
    const filteredContests = contests.filter(c => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return c.title.toLowerCase().includes(q) || c.venue.toLowerCase().includes(q);
    });

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined animate-spin text-4xl text-[#1152d4]">progress_activity</span>
                    <p className="text-[#4c669a]">Loading contests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f6f6f8] dark:bg-[#101622] font-['Inter',sans-serif]">
            <AdminSidebar />

            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Sticky Toolbar */}
                <header className="flex-shrink-0 bg-white/80 dark:bg-[#1a2233]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
                    <div className="px-6 md:px-8 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">Contests & Events</h2>
                                <p className="text-sm text-[#4c669a]">Manage C2C club events and attendance</p>
                            </div>
                            <button
                                onClick={openCreateModal}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#1152d4] text-white rounded-xl font-semibold hover:bg-[#0d3fa8] transition-all shadow-lg shadow-[#1152d4]/20 hover:shadow-xl hover:shadow-[#1152d4]/30 hover:-translate-y-0.5"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                Create New
                            </button>
                        </div>

                        {/* Search + Filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative flex-1 min-w-[200px] max-w-sm">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c669a] text-lg">search</span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search events..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50"
                                />
                            </div>
                            <select
                                value={filter.status}
                                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <select
                                value={filter.type}
                                onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm"
                            >
                                <option value="all">All Types</option>
                                {contestTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                            <span className="text-xs text-[#4c669a] ml-auto">
                                {filteredContests.length} event{filteredContests.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Contest List */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {filteredContests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <span className="material-symbols-outlined text-6xl text-[#4c669a]/50 mb-4">event</span>
                            <h3 className="text-xl font-semibold text-[#0d121b] dark:text-white mb-2">No Events Found</h3>
                            <p className="text-[#4c669a] mb-6">Create your first event to get started</p>
                            <button
                                onClick={openCreateModal}
                                className="flex items-center gap-2 px-6 py-3 bg-[#1152d4] text-white rounded-xl font-semibold hover:bg-[#0d3fa8] transition-colors shadow-lg shadow-[#1152d4]/20"
                            >
                                <span className="material-symbols-outlined">add</span>
                                Create Event
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredContests.map(contest => {
                                const typeConfig = getTypeConfig(contest.type);
                                const status = getStatusLabel(contest);
                                const isPast = status.label === 'Past';
                                return (
                                    <div
                                        key={contest._id}
                                        className={`bg-white dark:bg-[#1a2233] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-lg transition-all group ${isPast ? 'opacity-75 hover:opacity-100' : ''}`}
                                    >
                                        {/* Gradient Header */}
                                        <div className={`relative h-32 bg-gradient-to-br ${typeConfig.gradient} p-4 flex flex-col justify-between`}>
                                            {/* Status Badge */}
                                            <div className="flex justify-end">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            {/* Type Badge */}
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig.color} text-white`}>
                                                    <span className="material-symbols-outlined text-sm">{typeConfig.icon}</span>
                                                    {typeConfig.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-2 line-clamp-1">{contest.title}</h3>

                                            <div className="space-y-1.5 mb-4">
                                                <div className="flex items-center gap-2 text-sm text-[#4c669a] dark:text-[#a0aec0]">
                                                    <span className="material-symbols-outlined text-base">calendar_today</span>
                                                    <span>{formatDate(contest.date)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-[#4c669a] dark:text-[#a0aec0]">
                                                    <span className="material-symbols-outlined text-base">schedule</span>
                                                    <span>{contest.startTime} - {contest.endTime}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-[#4c669a] dark:text-[#a0aec0]">
                                                    <span className="material-symbols-outlined text-base">location_on</span>
                                                    <span className="line-clamp-1">{contest.venue}</span>
                                                </div>
                                            </div>

                                            {/* Attendance + Toggle Row */}
                                            <div className="flex items-center justify-between py-3 px-3 bg-[#f8f9fc] dark:bg-[#2d3748] rounded-lg mb-4">
                                                <div className="flex items-center gap-2">
                                                    {/* Avatar Stack */}
                                                    <div className="flex -space-x-2">
                                                        {[...Array(Math.min(3, contest.attendanceCount))].map((_, i) => (
                                                            <div key={i} className={`w-7 h-7 rounded-full border-2 border-white dark:border-[#2d3748] flex items-center justify-center text-xs font-bold text-white ${['bg-blue-500', 'bg-purple-500', 'bg-green-500'][i]}`}>
                                                                <span className="material-symbols-outlined text-xs">person</span>
                                                            </div>
                                                        ))}
                                                        {contest.attendanceCount > 3 && (
                                                            <div className="w-7 h-7 rounded-full border-2 border-white dark:border-[#2d3748] bg-[#1152d4] flex items-center justify-center text-xs font-bold text-white">
                                                                +{contest.attendanceCount - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-semibold text-[#0d121b] dark:text-white">{contest.attendanceCount}</span>
                                                    <span className="text-xs text-[#4c669a]">attendees</span>
                                                </div>
                                                {/* Toggle Switch */}
                                                <button
                                                    onClick={() => handleToggleStatus(contest)}
                                                    className={`w-11 h-6 rounded-full transition-colors flex items-center ${contest.isActive ? 'bg-[#1152d4]' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                    title={contest.isActive ? 'Click to deactivate' : 'Click to activate'}
                                                >
                                                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${contest.isActive ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                                                </button>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(contest)}
                                                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-100 dark:bg-gray-800 text-[#4c669a] dark:text-[#a0aec0] rounded-lg font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-base">edit</span>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => showQR(contest)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#1152d4]/10 text-[#1152d4] rounded-lg font-medium text-sm hover:bg-[#1152d4]/20 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-base">qr_code</span>
                                                    Show QR
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/admin/contests/${contest._id}`)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg font-medium text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-base">visibility</span>
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(contest)}
                                                    className="p-2 text-[#4c669a] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete event"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1a2233] rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#1a2233]">
                            <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">
                                {editingContest ? 'Edit Event' : 'Create New Event'}
                            </h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1 text-[#4c669a] hover:text-[#0d121b] dark:hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {formError && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 px-3 py-2 rounded-lg text-sm">
                                    {formError}
                                </div>
                            )}

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-1.5">
                                    Event Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50"
                                    placeholder="e.g., Weekly Coding Contest #5"
                                    required
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-1.5">
                                    Event Type <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {contestTypes.map(type => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                                            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg border-2 transition-all ${formData.type === type.value ? 'border-[#1152d4] bg-[#1152d4]/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                                        >
                                            <span className={`material-symbols-outlined text-lg ${formData.type === type.value ? 'text-[#1152d4]' : 'text-[#4c669a]'}`}>{type.icon}</span>
                                            <span className={`text-xs font-medium ${formData.type === type.value ? 'text-[#1152d4]' : 'text-[#4c669a]'}`}>{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Venue */}
                            <div>
                                <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-1.5">
                                    Venue <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.venue}
                                    onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50"
                                    placeholder="e.g., Computer Lab 01, MNIT"
                                    required
                                />
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-1.5">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-1.5">
                                        Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-1.5">
                                        End Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-1.5">
                                    Description <span className="text-[#4c669a] text-xs">(Optional)</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50 resize-none h-20"
                                    placeholder="Brief description of the event..."
                                />
                            </div>

                            {/* External Link */}
                            <div>
                                <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-1.5">
                                    External Link <span className="text-[#4c669a] text-xs">(Optional)</span>
                                </label>
                                <input
                                    type="url"
                                    value={formData.link}
                                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50"
                                    placeholder="https://contest-link.com/participate"
                                />
                                <p className="text-xs text-[#4c669a] mt-1">Add an external URL for contest/course participation</p>
                            </div>

                            {/* GPS Toggle */}
                            <div className="flex items-center justify-between py-3 px-4 bg-[#f8f9fc] dark:bg-[#2d3748] rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-[#0d121b] dark:text-white">Location Verification</p>
                                    <p className="text-xs text-[#4c669a]">Require GPS location to mark attendance</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, requiresGPS: !prev.requiresGPS }))}
                                    className={`w-12 h-6 rounded-full transition-colors ${formData.requiresGPS ? 'bg-[#1152d4]' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${formData.requiresGPS ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            {/* GPS Settings */}
                            {formData.requiresGPS && (
                                <div className="space-y-3 p-4 border border-[#1152d4]/30 rounded-lg bg-[#1152d4]/5">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-[#4c669a] mb-1">Venue Latitude</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={formData.venueLatitude}
                                                onChange={(e) => setFormData(prev => ({ ...prev, venueLatitude: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm"
                                                placeholder="e.g., 26.8587"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-[#4c669a] mb-1">Venue Longitude</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={formData.venueLongitude}
                                                onChange={(e) => setFormData(prev => ({ ...prev, venueLongitude: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm"
                                                placeholder="e.g., 75.7956"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[#4c669a] mb-1">GPS Radius (meters)</label>
                                        <input
                                            type="number"
                                            value={formData.gpsRadius}
                                            onChange={(e) => setFormData(prev => ({ ...prev, gpsRadius: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm"
                                            placeholder="100"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Submit */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-[#4c669a] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formSubmitting}
                                    className="flex-1 py-2.5 bg-[#1152d4] text-white rounded-lg font-semibold hover:bg-[#0d3fa8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {formSubmitting ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">{editingContest ? 'save' : 'add'}</span>
                                            {editingContest ? 'Save Changes' : 'Create Event'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {showQRModal && selectedContest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowQRModal(false)}>
                    <div className="bg-white dark:bg-[#1a2233] rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#1a2233] z-10">
                            <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">QR Code</h3>
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="p-1 text-[#4c669a] hover:text-[#0d121b] dark:hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Event Info + QR */}
                            <div className="text-center">
                                <h4 className="text-lg font-semibold text-[#0d121b] dark:text-white mb-2">{selectedContest.title}</h4>
                                <p className="text-sm text-[#4c669a] mb-6">{formatDate(selectedContest.date)} • {selectedContest.venue}</p>

                                <div className="bg-white p-4 rounded-xl inline-block mb-4 shadow-inner">
                                    <QRCodeSVG
                                        id="qr-code-svg"
                                        value={`${BASE_URL}/attend/${selectedContest.qrToken}`}
                                        size={200}
                                        level="H"
                                        includeMargin={true}
                                    />
                                </div>

                                <p className="text-xs text-[#4c669a] mb-4 break-all">
                                    {BASE_URL}/attend/{selectedContest.qrToken}
                                </p>

                                <div className="flex gap-3 mb-6">
                                    <button
                                        onClick={downloadQR}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1152d4] text-white rounded-lg font-medium hover:bg-[#0d3fa8] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">download</span>
                                        Download
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${BASE_URL}/attend/${selectedContest.qrToken}`);
                                            alert('Link copied!');
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-gray-700 text-[#4c669a] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">content_copy</span>
                                        Copy Link
                                    </button>
                                </div>
                            </div>

                            {/* GPS Settings Section */}
                            <div className="border-t border-gray-200 dark:border-gray-800 pt-5 space-y-4">
                                <h4 className="text-sm font-semibold text-[#0d121b] dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">my_location</span>
                                    GPS Settings
                                </h4>

                                {/* GPS Toggle */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-[#0d121b] dark:text-white">Require GPS</p>
                                        <p className="text-xs text-[#4c669a]">Students must be near venue</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const newVal = !selectedContest.requiresGPS;
                                            try {
                                                await eventApi.updateContest(token, selectedContest._id, { requiresGPS: newVal });
                                                setSelectedContest({ ...selectedContest, requiresGPS: newVal });
                                                setContests(prev => prev.map(c => c._id === selectedContest._id ? { ...c, requiresGPS: newVal } : c));
                                            } catch (err) { console.error(err); }
                                        }}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${selectedContest.requiresGPS ? 'bg-[#1152d4]' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${selectedContest.requiresGPS ? 'translate-x-6' : ''}`} />
                                    </button>
                                </div>

                                {selectedContest.requiresGPS && (
                                    <>
                                        {/* Venue Location */}
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-[#0d121b] dark:text-white">Venue Location</p>
                                            {selectedContest.venueLatitude && selectedContest.venueLongitude ? (
                                                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                                    <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-green-700 dark:text-green-300">Location Set</p>
                                                        <p className="text-[10px] text-green-600 dark:text-green-400 truncate">
                                                            {selectedContest.venueLatitude.toFixed(6)}, {selectedContest.venueLongitude.toFixed(6)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await eventApi.updateContest(token, selectedContest._id, { venueLatitude: null, venueLongitude: null });
                                                                setSelectedContest({ ...selectedContest, venueLatitude: undefined, venueLongitude: undefined });
                                                                setContests(prev => prev.map(c => c._id === selectedContest._id ? { ...c, venueLatitude: undefined, venueLongitude: undefined } : c));
                                                            } catch (err) { console.error(err); }
                                                        }}
                                                        className="text-xs text-red-500 hover:text-red-700 font-medium whitespace-nowrap"
                                                    >
                                                        Reset
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                                    <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">No location set. Set it to your current position.</p>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={async () => {
                                                        if (!navigator.geolocation) {
                                                            alert('Geolocation not supported');
                                                            return;
                                                        }
                                                        navigator.geolocation.getCurrentPosition(
                                                            async (pos) => {
                                                                const lat = pos.coords.latitude;
                                                                const lng = pos.coords.longitude;
                                                                try {
                                                                    await eventApi.updateContest(token, selectedContest._id, { venueLatitude: lat, venueLongitude: lng });
                                                                    setSelectedContest({ ...selectedContest, venueLatitude: lat, venueLongitude: lng });
                                                                    setContests(prev => prev.map(c => c._id === selectedContest._id ? { ...c, venueLatitude: lat, venueLongitude: lng } : c));
                                                                } catch (err) { console.error(err); }
                                                            },
                                                            (err) => { alert('Failed to get location: ' + err.message); },
                                                            { enableHighAccuracy: true, timeout: 10000 }
                                                        );
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#1152d4]/10 text-[#1152d4] rounded-lg text-sm font-medium hover:bg-[#1152d4]/20 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-base">my_location</span>
                                                    {selectedContest.venueLatitude ? 'Update Location' : 'Set My Location'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* GPS Radius */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-[#0d121b] dark:text-white">GPS Radius</p>
                                                <span className="text-sm font-bold text-[#1152d4]">{selectedContest.gpsRadius || 100}m</span>
                                            </div>

                                            {/* Preset buttons */}
                                            <div className="flex gap-2 flex-wrap">
                                                {[50, 100, 200, 500, 1000].map(r => (
                                                    <button
                                                        key={r}
                                                        onClick={async () => {
                                                            try {
                                                                await eventApi.updateContest(token, selectedContest._id, { gpsRadius: r });
                                                                setSelectedContest({ ...selectedContest, gpsRadius: r });
                                                                setContests(prev => prev.map(c => c._id === selectedContest._id ? { ...c, gpsRadius: r } : c));
                                                            } catch (err) { console.error(err); }
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${(selectedContest.gpsRadius || 100) === r
                                                            ? 'bg-[#1152d4] text-white'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-[#4c669a] hover:bg-[#1152d4]/10 hover:text-[#1152d4]'
                                                            }`}
                                                    >
                                                        {r}m
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Range slider */}
                                            <input
                                                type="range"
                                                min="10"
                                                max="2000"
                                                step="10"
                                                value={selectedContest.gpsRadius || 100}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    setSelectedContest({ ...selectedContest, gpsRadius: val });
                                                }}
                                                onMouseUp={async (e) => {
                                                    const val = parseInt((e.target as HTMLInputElement).value);
                                                    try {
                                                        await eventApi.updateContest(token, selectedContest._id, { gpsRadius: val });
                                                        setContests(prev => prev.map(c => c._id === selectedContest._id ? { ...c, gpsRadius: val } : c));
                                                    } catch (err) { console.error(err); }
                                                }}
                                                onTouchEnd={async (e) => {
                                                    const val = parseInt((e.target as HTMLInputElement).value);
                                                    try {
                                                        await eventApi.updateContest(token, selectedContest._id, { gpsRadius: val });
                                                        setContests(prev => prev.map(c => c._id === selectedContest._id ? { ...c, gpsRadius: val } : c));
                                                    } catch (err) { console.error(err); }
                                                }}
                                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#1152d4]"
                                            />
                                            <div className="flex justify-between text-[10px] text-[#4c669a]">
                                                <span>10m</span>
                                                <span>500m</span>
                                                <span>1km</span>
                                                <span>2km</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
