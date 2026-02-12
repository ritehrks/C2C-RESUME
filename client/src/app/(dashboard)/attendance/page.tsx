"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { contestApi } from '@/lib/api';

// Event type config for icon + colors
const eventTypeConfig: Record<string, { icon: string; bgLight: string; bgDark: string; text: string; textDark: string }> = {
    coding_contest: { icon: 'code', bgLight: 'bg-purple-50', bgDark: 'dark:bg-purple-900/20', text: 'text-purple-600', textDark: 'dark:text-purple-400' },
    workshop: { icon: 'terminal', bgLight: 'bg-blue-50', bgDark: 'dark:bg-blue-900/20', text: 'text-primary', textDark: 'dark:text-blue-400' },
    hackathon: { icon: 'rocket_launch', bgLight: 'bg-orange-50', bgDark: 'dark:bg-orange-900/20', text: 'text-orange-600', textDark: 'dark:text-orange-400' },
    meeting: { icon: 'groups', bgLight: 'bg-green-50', bgDark: 'dark:bg-green-900/20', text: 'text-green-600', textDark: 'dark:text-green-400' },
    seminar: { icon: 'school', bgLight: 'bg-pink-50', bgDark: 'dark:bg-pink-900/20', text: 'text-pink-600', textDark: 'dark:text-pink-400' },
    other: { icon: 'event', bgLight: 'bg-slate-50', bgDark: 'dark:bg-slate-800', text: 'text-slate-600', textDark: 'dark:text-slate-400' },
};

const typeLabels: Record<string, string> = {
    coding_contest: 'Contest',
    workshop: 'Workshop',
    hackathon: 'Hackathon',
    meeting: 'Meeting',
    seminar: 'Seminar',
    other: 'Event',
};

interface AttendanceRecord {
    _id: string;
    eventTitle: string;
    eventType: string;
    venue: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    status: 'present' | 'late' | 'invalid_location';
    markedAt: string;
    distanceFromVenue?: number;
}

interface Stats {
    total: number;
    present: number;
    late: number;
    locationIssue: number;
}

const ITEMS_PER_PAGE = 10;

export default function MyAttendancePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, present: 0, late: 0, locationIssue: 0 });
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchAttendance(token);
    }, [router]);

    const fetchAttendance = async (token: string) => {
        try {
            setIsLoading(true);
            const data = await contestApi.getMyAttendance(token);
            if (data.success) {
                setAttendance(data.attendance);
                setStats(data.stats);
            } else {
                setError(data.error || 'Failed to load attendance');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatTimeRange = (start: string, end: string) => {
        // Convert 24h "HH:MM" to 12h display
        const to12h = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
        };
        return `${to12h(start)} - ${to12h(end)}`;
    };

    const getTypeConfig = (type: string) => {
        return eventTypeConfig[type] || eventTypeConfig.other;
    };

    const punctualityRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

    const visibleRecords = attendance.slice(0, visibleCount);
    const hasMore = visibleCount < attendance.length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                    <p className="text-slate-500 dark:text-slate-400">Loading your attendance...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Attendance</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track your event participation history and punctuality.</p>
                </div>
            </header>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stat 1: Total Events */}
                <div className="bg-white dark:bg-[#151c2c] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Events Attended</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.total}</h3>
                        {stats.total > 0 && (
                            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1 font-medium">
                                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                Keep it going!
                            </p>
                        )}
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">event_available</span>
                    </div>
                </div>

                {/* Stat 2: On Time */}
                <div className="bg-white dark:bg-[#151c2c] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">On Time Arrivals</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.present}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{punctualityRate}% Punctuality Rate</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                        <span className="material-symbols-outlined">check_circle</span>
                    </div>
                </div>

                {/* Stat 3: Late */}
                <div className="bg-white dark:bg-[#151c2c] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Late Arrivals</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.late}</h3>
                        {stats.locationIssue > 0 && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{stats.locationIssue} location issue{stats.locationIssue > 1 ? 's' : ''}</p>
                        )}
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <span className="material-symbols-outlined">history_toggle_off</span>
                    </div>
                </div>
            </div>

            {/* Attendance List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Activity</h2>
                    {attendance.length > 0 && (
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Showing {Math.min(visibleCount, attendance.length)} of {attendance.length}
                        </div>
                    )}
                </div>

                {attendance.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
                        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4 block">event_available</span>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Attendance Records Yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            Your event attendance will appear here after you scan a QR code at a C2C event.
                        </p>
                    </div>
                ) : (
                    <>
                        {visibleRecords.map(record => {
                            const typeConfig = getTypeConfig(record.eventType);
                            const isPresent = record.status === 'present';
                            const isLate = record.status === 'late';
                            const isLocationIssue = record.status === 'invalid_location';

                            // Hover border color
                            const hoverBorder = isPresent
                                ? 'hover:border-primary/50'
                                : isLate
                                    ? 'hover:border-amber-400/50'
                                    : 'hover:border-red-400/50';

                            return (
                                <div
                                    key={record._id}
                                    className={`bg-white dark:bg-[#151c2c] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group ${hoverBorder} transition-colors`}
                                >
                                    <div className="p-5 flex flex-col sm:flex-row gap-5">
                                        {/* Icon */}
                                        <div className="flex-shrink-0">
                                            <div className={`w-12 h-12 rounded-full ${typeConfig.bgLight} ${typeConfig.bgDark} flex items-center justify-center ${typeConfig.text} ${typeConfig.textDark}`}>
                                                <span className="material-symbols-outlined">{typeConfig.icon}</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">{record.eventTitle}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {/* Type badge */}
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                            {typeLabels[record.eventType] || 'Event'}
                                                        </span>
                                                        {/* Status badge */}
                                                        {isPresent && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                                                                Present
                                                            </span>
                                                        )}
                                                        {isLate && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                                                                Late
                                                            </span>
                                                        )}
                                                        {isLocationIssue && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
                                                                Location Issue
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right sm:text-right text-sm">
                                                    <p className="font-medium text-slate-900 dark:text-white">{formatDate(record.eventDate)}</p>
                                                    <p className="text-slate-500 dark:text-slate-400">{formatTimeRange(record.startTime, record.endTime)}</p>
                                                </div>
                                            </div>

                                            {/* Venue */}
                                            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-4">
                                                <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                <span>{record.venue}</span>
                                            </div>

                                            {/* Footer Meta */}
                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1.5" title="Time you scanned in">
                                                    <span className={`material-symbols-outlined text-[16px] ${isPresent ? 'text-primary' : isLate ? 'text-amber-500' : 'text-red-500'}`}>
                                                        {isLocationIssue ? 'error' : 'qr_code_scanner'}
                                                    </span>
                                                    <span>
                                                        {isLocationIssue ? 'Attempted' : 'Marked'} at{' '}
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{formatTime(record.markedAt)}</span>
                                                    </span>
                                                </div>
                                                {record.distanceFromVenue !== undefined && (
                                                    <div className="flex items-center gap-1.5" title="Distance from event geofence">
                                                        <span className="material-symbols-outlined text-[16px] text-slate-400">near_me</span>
                                                        <span>
                                                            GPS Deviation:{' '}
                                                            <span className={`font-semibold ${record.distanceFromVenue > 200 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                                {Math.round(record.distanceFromVenue)}m
                                                            </span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Load More */}
                        {hasMore && (
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                                    className="text-sm font-medium text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                                >
                                    Load More History
                                    <span className="material-symbols-outlined text-lg">expand_more</span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
