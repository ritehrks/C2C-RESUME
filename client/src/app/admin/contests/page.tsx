"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { contestApi } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';

// Contest type configuration
const contestTypes = [
    { value: 'coding_contest', label: 'Coding Contest', icon: 'code', color: 'bg-purple-500' },
    { value: 'workshop', label: 'Workshop', icon: 'school', color: 'bg-blue-500' },
    { value: 'hackathon', label: 'Hackathon', icon: 'rocket_launch', color: 'bg-orange-500' },
    { value: 'meeting', label: 'Meeting', icon: 'groups', color: 'bg-green-500' },
    { value: 'seminar', label: 'Seminar', icon: 'mic', color: 'bg-teal-500' },
    { value: 'other', label: 'Other Event', icon: 'event', color: 'bg-gray-500' },
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
            const data = await contestApi.getAllContests(authToken, {
                status: filter.status !== 'all' ? filter.status : undefined,
                type: filter.type !== 'all' ? filter.type : undefined,
            });

            if (data.success) {
                setContests(data.contests);
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
                maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
                venueLatitude: formData.venueLatitude ? parseFloat(formData.venueLatitude) : undefined,
                venueLongitude: formData.venueLongitude ? parseFloat(formData.venueLongitude) : undefined,
                gpsRadius: parseInt(formData.gpsRadius),
            };

            let result;
            if (editingContest) {
                result = await contestApi.updateContest(token, editingContest._id, payload);
            } else {
                result = await contestApi.createContest(token, payload);
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
            const result = await contestApi.deleteContest(token, contest._id);
            if (result.success) {
                fetchContests(token);
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleToggleStatus = async (contest: Contest) => {
        try {
            const result = await contestApi.toggleContestStatus(token, contest._id);
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
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a2233] flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">Contests & Events</h2>
                        <p className="text-sm text-[#4c669a]">Manage C2C club events and attendance</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1152d4] text-white rounded-lg font-semibold hover:bg-[#0d3fa8] transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Create Event
                    </button>
                </header>

                {/* Filters */}
                <div className="px-6 md:px-8 py-4 bg-white dark:bg-[#1a2233] border-b border-gray-200 dark:border-gray-800">
                    <div className="flex flex-wrap gap-4">
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
                    </div>
                </div>

                {/* Contest List */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {contests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <span className="material-symbols-outlined text-6xl text-[#4c669a]/50 mb-4">event</span>
                            <h3 className="text-xl font-semibold text-[#0d121b] dark:text-white mb-2">No Events Found</h3>
                            <p className="text-[#4c669a] mb-6">Create your first event to get started</p>
                            <button
                                onClick={openCreateModal}
                                className="flex items-center gap-2 px-6 py-3 bg-[#1152d4] text-white rounded-lg font-semibold hover:bg-[#0d3fa8] transition-colors"
                            >
                                <span className="material-symbols-outlined">add</span>
                                Create Event
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {contests.map(contest => {
                                const typeConfig = getTypeConfig(contest.type);
                                return (
                                    <div key={contest._id} className="bg-white dark:bg-[#1a2233] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Type Header */}
                                        <div className={`${typeConfig.color} px-4 py-2.5 flex items-center justify-between text-white`}>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">{typeConfig.icon}</span>
                                                <span className="font-medium text-sm">{typeConfig.label}</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${contest.isActive ? 'bg-white/20' : 'bg-black/20'}`}>
                                                {contest.isActive ? 'Active' : 'Inactive'}
                                            </span>
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

                                            {/* Attendance Count */}
                                            <div className="flex items-center justify-between py-3 px-3 bg-[#f8f9fc] dark:bg-[#2d3748] rounded-lg mb-4">
                                                <span className="text-sm text-[#4c669a] dark:text-[#a0aec0]">Attendance</span>
                                                <span className="text-lg font-bold text-[#1152d4]">{contest.attendanceCount}</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => showQR(contest)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#1152d4]/10 text-[#1152d4] rounded-lg font-medium text-sm hover:bg-[#1152d4]/20 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-base">qr_code</span>
                                                    QR Code
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/admin/contests/${contest._id}`)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg font-medium text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-base">visibility</span>
                                                    View
                                                </button>
                                                <div className="relative group">
                                                    <button className="p-2 text-[#4c669a] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                                        <span className="material-symbols-outlined text-lg">more_vert</span>
                                                    </button>
                                                    <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#2d3748] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                                        <button
                                                            onClick={() => openEditModal(contest)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#0d121b] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                            <span className="material-symbols-outlined text-base">edit</span>
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(contest)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#0d121b] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                            <span className="material-symbols-outlined text-base">{contest.isActive ? 'toggle_off' : 'toggle_on'}</span>
                                                            {contest.isActive ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(contest)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        >
                                                            <span className="material-symbols-outlined text-base">delete</span>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
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

                            {/* GPS Settings (if enabled) */}
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1a2233] rounded-2xl shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">QR Code</h3>
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="p-1 text-[#4c669a] hover:text-[#0d121b] dark:hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 text-center">
                            <h4 className="text-lg font-semibold text-[#0d121b] dark:text-white mb-2">{selectedContest.title}</h4>
                            <p className="text-sm text-[#4c669a] mb-6">{formatDate(selectedContest.date)} • {selectedContest.venue}</p>

                            <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-inner">
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

                            <div className="flex gap-3">
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
                    </div>
                </div>
            )}
        </div>
    );
}
