"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { contestApi } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';

// Contest type configuration
const contestTypes: Record<string, { label: string; icon: string; color: string }> = {
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
    qrToken: string;
    attendanceCount: number;
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
    const [searchQuery, setSearchQuery] = useState('');

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

            // Fetch contest
            const contestData = await contestApi.getContest(authToken, contestId);
            if (contestData.success) {
                setContest(contestData.contest);
            }

            // Fetch attendance
            const attendanceData = await contestApi.getContestAttendance(authToken, contestId, sortBy, sortOrder);
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
            const data = await contestApi.getContestAttendance(token, contestId, sortBy, sortOrder);
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
            const result = await contestApi.deleteAttendanceRecord(token, contestId, attendanceId);
            if (result.success) {
                fetchAttendance();
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleExportCSV = () => {
        // Create download link with auth
        const url = `${API_URL}/api/contests/${contestId}/attendance/export`;

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
                return <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded">Present</span>;
            case 'late':
                return <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium rounded">Late</span>;
            case 'invalid_location':
                return <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded">Invalid Location</span>;
            default:
                return <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded">{status}</span>;
        }
    };

    // Filter attendance by search
    const filteredAttendance = attendance.filter(record => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            record.name.toLowerCase().includes(query) ||
            record.studentId.toLowerCase().includes(query) ||
            record.email.toLowerCase().includes(query) ||
            record.branch.toLowerCase().includes(query)
        );
    });

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
                    <div className="px-6 md:px-8 py-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 text-sm">
                            <Link href="/admin/contests" className="text-[#4c669a] hover:text-[#1152d4]">Contests</Link>
                            <span className="text-[#4c669a]">/</span>
                            <span className="text-[#0d121b] dark:text-white font-medium">{contest.title}</span>
                        </div>
                    </div>

                    {/* Contest Info */}
                    <div className="px-6 md:px-8 py-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 ${typeConfig.color} text-white text-xs font-medium rounded-full mb-2`}>
                                    <span className="material-symbols-outlined text-sm">{typeConfig.icon}</span>
                                    {typeConfig.label}
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
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowQRModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#1152d4]/10 text-[#1152d4] rounded-lg font-medium hover:bg-[#1152d4]/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">qr_code</span>
                                    QR Code
                                </button>
                                <button
                                    onClick={handleExportCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">download</span>
                                    Export CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Stats Bar */}
                <div className="px-6 md:px-8 py-4 bg-white dark:bg-[#1a2233] border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-[#1152d4]/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#1152d4]">groups</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#0d121b] dark:text-white">{attendance.length}</p>
                            <p className="text-xs text-[#4c669a]">Total Attendees</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#0d121b] dark:text-white">
                                {attendance.filter(a => a.status === 'present').length}
                            </p>
                            <p className="text-xs text-[#4c669a]">On Time</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-600">schedule</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#0d121b] dark:text-white">
                                {attendance.filter(a => a.status === 'late').length}
                            </p>
                            <p className="text-xs text-[#4c669a]">Late</p>
                        </div>
                    </div>
                    <div className={`ml-auto px-3 py-1.5 rounded-full text-sm font-medium ${contest.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                        {contest.isActive ? '● Active' : '○ Inactive'}
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="px-6 md:px-8 py-3 bg-[#f8f9fc] dark:bg-[#1a2233]/50 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex flex-wrap items-center gap-4">
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
                        <span className="text-sm text-[#4c669a]">
                            Showing {filteredAttendance.length} of {attendance.length} records
                        </span>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full min-w-[700px]">
                        <thead className="bg-[#f8f9fc] dark:bg-[#2d3748] sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#4c669a] uppercase tracking-wider">#</th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-semibold text-[#4c669a] uppercase tracking-wider cursor-pointer hover:text-[#1152d4]"
                                    onClick={() => toggleSort('name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Name
                                        {sortBy === 'name' && (
                                            <span className="material-symbols-outlined text-sm">
                                                {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-semibold text-[#4c669a] uppercase tracking-wider cursor-pointer hover:text-[#1152d4]"
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
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#4c669a] uppercase tracking-wider">Branch</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#4c669a] uppercase tracking-wider">Year</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#4c669a] uppercase tracking-wider">Status</th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-semibold text-[#4c669a] uppercase tracking-wider cursor-pointer hover:text-[#1152d4]"
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
                                <th className="px-6 py-3 text-right text-xs font-semibold text-[#4c669a] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[#1a2233] divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredAttendance.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <span className="material-symbols-outlined text-5xl text-[#4c669a]/30 mb-3 block">inbox</span>
                                        <p className="text-[#4c669a]">
                                            {searchQuery ? 'No matching records found' : 'No attendance records yet'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAttendance.map((record, idx) => (
                                    <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-[#4c669a]">{idx + 1}</td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-[#0d121b] dark:text-white">{record.name}</p>
                                                <p className="text-xs text-[#4c669a]">{record.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-[#0d121b] dark:text-white">{record.studentId}</td>
                                        <td className="px-6 py-4 text-sm text-[#0d121b] dark:text-white">{record.branch}</td>
                                        <td className="px-6 py-4 text-sm text-[#0d121b] dark:text-white">{record.year || '-'}</td>
                                        <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                                        <td className="px-6 py-4 text-sm text-[#4c669a]">{formatTime(record.markedAt)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteAttendance(record._id, record.name)}
                                                className="p-1.5 text-[#4c669a] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                title="Remove attendance"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
