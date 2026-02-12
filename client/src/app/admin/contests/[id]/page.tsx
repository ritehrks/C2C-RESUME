"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { eventApi } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';

// Contest type configuration
const contestTypes: Record<string, { label: string; icon: string; color: string }> = {
    contest: { label: 'Contest', icon: 'emoji_events', color: 'bg-amber-500' },
    course: { label: 'Course', icon: 'menu_book', color: 'bg-indigo-500' },
    coding_contest: { label: 'Coding Contest', icon: 'code', color: 'bg-purple-500' },
    workshop: { label: 'Workshop', icon: 'school', color: 'bg-blue-500' },
    hackathon: { label: 'Hackathon', icon: 'rocket_launch', color: 'bg-orange-500' },
    meeting: { label: 'Meeting', icon: 'groups', color: 'bg-green-500' },
    seminar: { label: 'Seminar', icon: 'mic', color: 'bg-teal-500' },
    other: { label: 'Event', icon: 'event', color: 'bg-gray-500' },
};

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
    gpsRadius?: number;
    qrToken: string;
    attendanceCount: number;
    enrolledStudents?: string[];
    enrolledCount?: number;
    createdAt: string;
}

interface AttendanceRecord {
    _id: string;
    name: string;
    email: string;
    studentId: string;
    branch: string;
    year?: number;
    phone?: string;
    status: 'present' | 'late' | 'invalid_location';
    markedAt: string;
    distanceFromVenue?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

// Color map for avatars
const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-teal-500', 'bg-pink-500', 'bg-indigo-500', 'bg-amber-500'];

const ITEMS_PER_PAGE = 15;

export default function ContestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const contestId = params?.id as string;

    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [contest, setContest] = useState<Contest | null>(null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [sortBy, setSortBy] = useState('markedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [showQRModal, setShowQRModal] = useState(false);
    const [gpsRadius, setGpsRadius] = useState(100);
    const [isSettingLocation, setIsSettingLocation] = useState(false);
    const [locationMsg, setLocationMsg] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [branchFilter, setBranchFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

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
        fetchContestDetails(storedToken);
    }, [router, contestId]);

    const fetchContestDetails = async (authToken: string) => {
        try {
            setIsLoading(true);

            const contestData = await eventApi.getContest(authToken, contestId);
            if (contestData.event) {
                setGpsRadius(contestData.event.gpsRadius || 100);
                setContest(contestData.event);
            }

            const attendanceData = await eventApi.getContestAttendance(authToken, contestId, sortBy, sortOrder);
            if (attendanceData.success) {
                setAttendance(attendanceData.attendance);
            }
        } catch (error) {
            console.error('Failed to fetch contest:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchAttendance();
        }
    }, [sortBy, sortOrder, token]);

    const fetchAttendance = async () => {
        if (!token) return;
        try {
            const data = await eventApi.getContestAttendance(token, contestId, sortBy, sortOrder);
            if (data.success) {
                setAttendance(data.attendance);
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        }
    };

    const handleDeleteAttendance = async (attendanceId: string, name: string) => {
        if (!confirm(`Remove attendance record for "${name}"?`)) return;

        try {
            const result = await eventApi.deleteAttendanceRecord(token, contestId, attendanceId);
            if (result.success) {
                fetchAttendance();
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleExportCSV = () => {
        const url = `${API_URL}/api/events/${contestId}/attendance/export`;

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${contest?.title.replace(/[^a-z0-9]/gi, '_')}_attendance.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            });
    };

    const handleSetLocation = async () => {
        if (!navigator.geolocation) {
            setLocationMsg('Geolocation not supported by your browser');
            return;
        }
        setIsSettingLocation(true);
        setLocationMsg('');
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const result = await eventApi.updateContest(token, contestId, {
                        venueLatitude: position.coords.latitude,
                        venueLongitude: position.coords.longitude,
                    });
                    if (result.success) {
                        setContest(prev => prev ? { ...prev, venueLatitude: position.coords.latitude, venueLongitude: position.coords.longitude } : prev);
                        setLocationMsg('✅ Location set successfully!');
                    } else {
                        setLocationMsg('❌ Failed to save location');
                    }
                } catch { setLocationMsg('❌ Error saving location'); }
                setIsSettingLocation(false);
            },
            (error) => {
                setLocationMsg(`❌ GPS error: ${error.message}`);
                setIsSettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleResetLocation = async () => {
        try {
            const result = await eventApi.updateContest(token, contestId, {
                venueLatitude: null,
                venueLongitude: null,
            });
            if (result.success) {
                setContest(prev => prev ? { ...prev, venueLatitude: undefined, venueLongitude: undefined } : prev);
                setLocationMsg('✅ Location reset');
            }
        } catch { setLocationMsg('❌ Error resetting location'); }
    };

    const handleUpdateRadius = async () => {
        try {
            const result = await eventApi.updateContest(token, contestId, { gpsRadius });
            if (result.success) {
                setContest(prev => prev ? { ...prev, gpsRadius } : prev);
                setLocationMsg(`✅ Radius updated to ${gpsRadius}m`);
            }
        } catch { setLocationMsg('❌ Error updating radius'); }
    };

    const handleExportEnrolled = () => {

        if (!contest?.enrolledStudents || contest.enrolledStudents.length === 0) {
            alert('No enrolled students to export');
            return;
        }
        const csvHeader = 'S.No,Email\n';
        const csvRows = contest.enrolledStudents.map((email, i) => `${i + 1},${email}`).join('\n');
        const csvContent = csvHeader + csvRows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${contest.title.replace(/[^a-z0-9]/gi, '_')}_enrolled_students.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    };

    const handleToggleStatus = async () => {
        try {
            const result = await eventApi.toggleContestStatus(token, contestId);
            if (result.success) {
                setContest(prev => prev ? { ...prev, isActive: result.isActive } : prev);
            }
        } catch (error) {
            console.error('Toggle status failed:', error);
        }
    };


    const toggleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-md border border-green-200 dark:border-green-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Present
                </span>;
            case 'late':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-md border border-amber-200 dark:border-amber-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Late
                </span>;
            case 'invalid_location':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-md border border-red-200 dark:border-red-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Invalid Location
                </span>;
            default:
                return <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-md">{status}</span>;
        }
    };

    // Get avatar color
    const getAvatarColor = (name: string) => {
        let sum = 0;
        for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
        return avatarColors[sum % avatarColors.length];
    };

    // Filter attendance
    const filteredAttendance = attendance.filter(record => {
        if (statusFilter !== 'all' && record.status !== statusFilter) return false;
        if (branchFilter !== 'all' && record.branch !== branchFilter) return false;
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            record.name.toLowerCase().includes(query) ||
            record.studentId.toLowerCase().includes(query) ||
            record.email.toLowerCase().includes(query) ||
            record.branch.toLowerCase().includes(query)
        );
    });

    // Pagination
    const totalPages = Math.ceil(filteredAttendance.length / ITEMS_PER_PAGE);
    const paginatedAttendance = filteredAttendance.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, branchFilter]);

    // Get unique branches for filter
    const uniqueBranches = [...new Set(attendance.map(a => a.branch))].sort();

    // Stats
    const stats = {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        late: attendance.filter(a => a.status === 'late').length,
        suspicious: attendance.filter(a => a.status === 'invalid_location').length,
    };

    const typeConfig = contest ? contestTypes[contest.type] || contestTypes.other : contestTypes.other;

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined animate-spin text-4xl text-[#1152d4]">progress_activity</span>
                    <p className="text-[#4c669a]">Loading contest...</p>
                </div>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-[#4c669a]/50 mb-4 block">error</span>
                    <h2 className="text-xl font-bold text-[#0d121b] dark:text-white mb-2">Contest Not Found</h2>
                    <Link href="/admin/contests" className="text-[#1152d4] hover:underline">← Back to Contests</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f6f6f8] dark:bg-[#101622] font-['Inter',sans-serif]">
            <AdminSidebar />

            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a2233]">
                    {/* Breadcrumb */}
                    <nav className="px-6 md:px-8 py-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 text-sm">
                            <Link href="/admin/contests" className="text-[#4c669a] hover:text-[#1152d4] transition-colors">Contests</Link>
                            <span className="material-symbols-outlined text-[#4c669a] text-base">chevron_right</span>
                            <span className="text-[#0d121b] dark:text-white font-medium">{contest.title}</span>
                        </div>
                    </nav>

                    {/* Contest Info */}
                    <div className="px-6 md:px-8 py-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 ${typeConfig.color} text-white text-xs font-medium rounded-full`}>
                                        <span className="material-symbols-outlined text-sm">{typeConfig.icon}</span>
                                        {typeConfig.label}
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${contest.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                        {contest.isActive ? '● Active' : '○ Inactive'}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-[#0d121b] dark:text-white mb-1">{contest.title}</h2>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-[#4c669a]">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">calendar_today</span>
                                        {formatDate(contest.date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">schedule</span>
                                        {contest.startTime} - {contest.endTime}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">location_on</span>
                                        {contest.venue}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <button
                                    onClick={handleToggleStatus}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${contest.isActive
                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50'
                                            : 'bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-lg">{contest.isActive ? 'lock' : 'lock_open'}</span>
                                    <span className="hidden sm:inline">{contest.isActive ? 'Close Attendance' : 'Open Attendance'}</span>
                                    <span className="sm:hidden">{contest.isActive ? 'Close' : 'Open'}</span>
                                </button>
                                <button
                                    onClick={() => fetchContestDetails(token)}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-[#4c669a] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">refresh</span>
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>
                                <button
                                    onClick={() => setShowQRModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#1152d4]/10 text-[#1152d4] rounded-lg font-medium hover:bg-[#1152d4]/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">qr_code</span>
                                    <span className="hidden sm:inline">QR Code</span>
                                    <span className="sm:hidden">QR</span>
                                </button>
                                <button
                                    onClick={handleExportCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">download</span>
                                    <span className="hidden sm:inline">Export Attendance</span>
                                    <span className="sm:hidden">Attend.</span>
                                </button>
                                <button
                                    onClick={handleExportEnrolled}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">table_view</span>
                                    <span className="hidden sm:inline">Export Enrolled</span>
                                    <span className="sm:hidden">Enrolled</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content area (scrollable) */}
                <div className="flex-1 overflow-y-auto">
                    {/* Stats Cards */}
                    <div className="px-6 md:px-8 py-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-[#1a2233] rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3">
                                <div className="size-11 rounded-lg bg-[#1152d4]/10 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-[#1152d4]">groups</span>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#0d121b] dark:text-white">{stats.total}</p>
                                    <p className="text-xs text-[#4c669a]">Total Registered</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#1a2233] rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3">
                                <div className="size-11 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#0d121b] dark:text-white">{stats.present}</p>
                                    <p className="text-xs text-[#4c669a]">Present</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#1a2233] rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3">
                                <div className="size-11 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-amber-600">schedule</span>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#0d121b] dark:text-white">{stats.late}</p>
                                    <p className="text-xs text-[#4c669a]">Late Arrival</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#1a2233] rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3">
                                <div className="size-11 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-red-600">gpp_maybe</span>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#0d121b] dark:text-white">{stats.suspicious}</p>
                                    <p className="text-xs text-[#4c669a]">Suspicious</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="px-6 md:px-8 pb-6">
                        <div className="bg-white dark:bg-[#1a2233] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            {/* Table Toolbar */}
                            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c669a] text-lg">search</span>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by name, ID, email..."
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50"
                                        />
                                    </div>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="present">Present</option>
                                        <option value="late">Late</option>
                                        <option value="invalid_location">Invalid Location</option>
                                    </select>
                                    <select
                                        value={branchFilter}
                                        onChange={(e) => setBranchFilter(e.target.value)}
                                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm"
                                    >
                                        <option value="all">All Branches</option>
                                        {uniqueBranches.map(b => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                    <span className="text-xs text-[#4c669a] ml-auto">
                                        {filteredAttendance.length} of {attendance.length} records
                                    </span>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead className="bg-[#f8f9fc] dark:bg-[#2d3748]">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-[#4c669a] uppercase tracking-wider w-12">#</th>
                                            <th
                                                className="px-5 py-3 text-left text-xs font-semibold text-[#4c669a] uppercase tracking-wider cursor-pointer hover:text-[#1152d4]"
                                                onClick={() => toggleSort('name')}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Student
                                                    {sortBy === 'name' && (
                                                        <span className="material-symbols-outlined text-sm">
                                                            {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                className="px-5 py-3 text-left text-xs font-semibold text-[#4c669a] uppercase tracking-wider cursor-pointer hover:text-[#1152d4]"
                                                onClick={() => toggleSort('studentId')}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Student ID
                                                    {sortBy === 'studentId' && (
                                                        <span className="material-symbols-outlined text-sm">
                                                            {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-[#4c669a] uppercase tracking-wider">Branch</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-[#4c669a] uppercase tracking-wider">Status</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-[#4c669a] uppercase tracking-wider">Distance</th>
                                            <th
                                                className="px-5 py-3 text-left text-xs font-semibold text-[#4c669a] uppercase tracking-wider cursor-pointer hover:text-[#1152d4]"
                                                onClick={() => toggleSort('markedAt')}
                                            >
                                                <div className="flex items-center gap-1">
                                                    Marked At
                                                    {sortBy === 'markedAt' && (
                                                        <span className="material-symbols-outlined text-sm">
                                                            {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-5 py-3 text-right text-xs font-semibold text-[#4c669a] uppercase tracking-wider w-16">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {paginatedAttendance.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-12 text-center">
                                                    <span className="material-symbols-outlined text-5xl text-[#4c669a]/30 mb-3 block">inbox</span>
                                                    <p className="text-[#4c669a]">
                                                        {searchQuery || statusFilter !== 'all' || branchFilter !== 'all' ? 'No matching records found' : 'No attendance records yet'}
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedAttendance.map((record, idx) => (
                                                <tr
                                                    key={record._id}
                                                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${record.status === 'invalid_location' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
                                                >
                                                    <td className="px-5 py-3.5 text-sm text-[#4c669a]">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full ${getAvatarColor(record.name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                                                {record.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-[#0d121b] dark:text-white">{record.name}</p>
                                                                <p className="text-xs text-[#4c669a]">{record.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="text-sm font-mono text-[#1152d4] font-medium">{record.studentId}</span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-sm text-[#0d121b] dark:text-white">{record.branch}</td>
                                                    <td className="px-5 py-3.5">{getStatusBadge(record.status)}</td>
                                                    <td className="px-5 py-3.5 text-sm font-mono text-[#4c669a]">
                                                        {record.distanceFromVenue !== undefined ? `${Math.round(record.distanceFromVenue)}m` : '—'}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-sm text-[#4c669a]">{formatTime(record.markedAt)}</td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        {record.status === 'invalid_location' ? (
                                                            <button
                                                                onClick={() => handleDeleteAttendance(record._id, record.name)}
                                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                                title="Flag / Remove"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">flag</span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleDeleteAttendance(record._id, record.name)}
                                                                className="p-1.5 text-[#4c669a] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                                title="Remove attendance"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">delete</span>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <p className="text-xs text-[#4c669a] hidden sm:block">
                                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredAttendance.length)} of {filteredAttendance.length}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-[#4c669a] hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Previous
                                        </button>
                                        {[...Array(totalPages)].map((_, i) => {
                                            const page = i + 1;
                                            // Show first, last, and pages near current
                                            if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${currentPage === page ? 'bg-[#1152d4] text-white' : 'text-[#4c669a] hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            }
                                            // Show ellipsis
                                            if (Math.abs(page - currentPage) === 2) {
                                                return <span key={page} className="text-[#4c669a] px-1">…</span>;
                                            }
                                            return null;
                                        })}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-[#4c669a] hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* QR Code Modal */}
            {showQRModal && (
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
                            <h4 className="text-lg font-semibold text-[#0d121b] dark:text-white mb-2">{contest.title}</h4>
                            <p className="text-sm text-[#4c669a] mb-6">{formatDate(contest.date)} • {contest.venue}</p>

                            <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-inner">
                                <QRCodeSVG
                                    id="qr-code-svg"
                                    value={`${BASE_URL}/attend/${contest.qrToken}`}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>

                            <p className="text-xs text-[#4c669a] mb-4 break-all">
                                {BASE_URL}/attend/{contest.qrToken}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
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
                                            downloadLink.download = `${contest.title.replace(/[^a-z0-9]/gi, '_')}_QR.png`;
                                            downloadLink.href = pngFile;
                                            downloadLink.click();
                                        };
                                        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1152d4] text-white rounded-lg font-medium hover:bg-[#0d3fa8] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">download</span>
                                    Download
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${BASE_URL}/attend/${contest.qrToken}`);
                                        alert('Link copied!');
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-gray-700 text-[#4c669a] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">content_copy</span>
                                    Copy Link
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

                            {/* GPS Location Controls */}
                            <div className="text-left space-y-3">
                                <h4 className="text-sm font-semibold text-[#0d121b] dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">location_on</span>
                                    Venue GPS Location
                                </h4>
                                <div className="text-xs text-[#4c669a] bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                    {contest.venueLatitude && contest.venueLongitude ? (
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-green-500 text-base">check_circle</span>
                                            <span>Lat: {contest.venueLatitude.toFixed(6)}, Lng: {contest.venueLongitude.toFixed(6)}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-amber-500 text-base">warning</span>
                                            <span>No venue location set — GPS validation disabled</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSetLocation}
                                        disabled={isSettingLocation}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-sm">{isSettingLocation ? 'progress_activity' : 'my_location'}</span>
                                        {isSettingLocation ? 'Getting GPS...' : 'Set My Location'}
                                    </button>
                                    <button
                                        onClick={handleResetLocation}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">location_off</span>
                                        Reset Location
                                    </button>
                                </div>
                            </div>

                            {/* GPS Radius Slider */}
                            <div className="text-left space-y-3">
                                <h4 className="text-sm font-semibold text-[#0d121b] dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">radar</span>
                                    GPS Radius: <span className="text-app-primary">{gpsRadius}m</span>
                                </h4>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-[#4c669a] w-8">50m</span>
                                    <input
                                        type="range"
                                        min={50}
                                        max={500}
                                        step={10}
                                        value={gpsRadius}
                                        onChange={(e) => setGpsRadius(parseInt(e.target.value))}
                                        className="flex-1 accent-[#1152d4] h-2 rounded-lg cursor-pointer"
                                    />
                                    <span className="text-[10px] text-[#4c669a] w-10">500m</span>
                                </div>
                                <button
                                    onClick={handleUpdateRadius}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#1152d4]/10 text-[#1152d4] rounded-lg text-xs font-medium hover:bg-[#1152d4]/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">save</span>
                                    Update Radius
                                </button>
                            </div>

                            {/* Status Message */}
                            {locationMsg && (
                                <p className="text-xs text-center text-[#4c669a] mt-2">{locationMsg}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
