"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { eventApi } from '@/lib/api';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

// Contest type labels and colors
const contestTypeConfig: Record<string, { label: string; color: string; icon: string; bg: string }> = {
    coding_contest: { label: 'Coding Contest', color: 'text-blue-600', icon: 'code', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    workshop: { label: 'Workshop', color: 'text-purple-600', icon: 'build', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    hackathon: { label: 'Hackathon', color: 'text-orange-600', icon: 'terminal', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    meeting: { label: 'Meeting', color: 'text-green-600', icon: 'groups', bg: 'bg-green-50 dark:bg-green-900/20' },
    seminar: { label: 'Seminar', color: 'text-teal-600', icon: 'mic', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    other: { label: 'Event', color: 'text-gray-600', icon: 'event', bg: 'bg-gray-50 dark:bg-gray-900/20' },
};

// Branch options
const branchOptions = [
    { value: 'UCP', label: 'CSE (UCP)' },
    { value: 'UCE', label: 'Civil (UCE)' },
    { value: 'UEC', label: 'ECE (UEC)' },
    { value: 'UEE', label: 'EE (UEE)' },
    { value: 'UME', label: 'Mech (UME)' },
    { value: 'UMT', label: 'Meta (UMT)' },
    { value: 'UCH', label: 'Chemical (UCH)' },
    { value: 'UAR', label: 'Arch (UAR)' },
    { value: 'OTHER', label: 'Other' },
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
    requiresGPS: boolean;
    isActive: boolean;
}

function AttendancePageContent() {
    const params = useParams();
    const router = useRouter();
    const token = params?.token as string;

    const [contest, setContest] = useState<Contest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [step, setStep] = useState<'loading' | 'login' | 'form' | 'success' | 'error'>('loading');
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        branch: '',
        phone: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
    const [locationError, setLocationError] = useState('');
    const [gettingLocation, setGettingLocation] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid QR code');
            setStep('error');
            setLoading(false);
            return;
        }
        fetchContest();
    }, [token]);

    const fetchContest = async () => {
        try {
            const data = await eventApi.getContestByToken(token);
            if (data.success) {
                setContest(data.event);
                const savedUser = localStorage.getItem('attendanceUser');
                if (savedUser) {
                    try {
                        const parsed = JSON.parse(savedUser);
                        if (parsed.email && parsed.name) {
                            const checkResult = await eventApi.checkAttendance(token, parsed.email);
                            if (checkResult.alreadyMarked) {
                                setSuccess(`Already marked at ${new Date(checkResult.attendance.markedAt).toLocaleString()}`);
                                setStep('success');
                                setLoading(false);
                                return;
                            }
                            setUserEmail(parsed.email);
                            setUserName(parsed.name);
                            setFormData(prev => ({
                                ...prev,
                                name: parsed.name,
                                studentId: parsed.studentId || prev.studentId,
                                branch: parsed.branch || prev.branch,
                                phone: parsed.phone || prev.phone,
                            }));
                            setStep('form');
                            if (data.event.requiresGPS) getLocation();
                            setLoading(false);
                            return;
                        }
                    } catch { /* invalid JSON */ }
                }
                setStep('login');
            } else {
                setError(data.error || 'Contest not found');
                setStep('error');
            }
        } catch (err) {
            setError('Failed to load event. Please try again.');
            setStep('error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const base64Url = credentialResponse.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            const email = decoded.email?.toLowerCase() || '';
            const name = decoded.name || '';

            if (!email.endsWith('@mnit.ac.in')) {
                setError('Only @mnit.ac.in emails allowed');
                return;
            }

            const checkResult = await eventApi.checkAttendance(token, email);
            if (checkResult.alreadyMarked) {
                setSuccess(`Already marked at ${new Date(checkResult.attendance.markedAt).toLocaleString()}`);
                setStep('success');
                return;
            }

            setUserEmail(email);
            setUserName(name);
            setFormData(prev => ({ ...prev, name }));

            const emailMatch = email.match(/^(\d{4}[a-z]{2,3}\d+)@mnit\.ac\.in$/i);
            if (emailMatch) {
                const extractedId = emailMatch[1].toUpperCase();
                const branchMatch = extractedId.match(/\d{4}([A-Z]{2,3})/);
                setFormData(prev => ({
                    ...prev,
                    studentId: extractedId,
                    branch: branchMatch ? branchMatch[1] : '',
                }));
            }

            setStep('form');
            localStorage.setItem('attendanceUser', JSON.stringify({
                email, name,
                studentId: formData.studentId,
                branch: formData.branch,
            }));

            if (contest?.requiresGPS) getLocation();
        } catch (err) {
            setError('Login failed. Please try again.');
        }
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation not supported');
            return;
        }
        setGettingLocation(true);
        setLocationError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
                setGettingLocation(false);
            },
            () => {
                setLocationError('Enable GPS and try again');
                setGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            if (!formData.name || !formData.studentId || !formData.branch) {
                setError('Fill all required fields');
                setSubmitting(false);
                return;
            }
            if (contest?.requiresGPS && !location) {
                setError('Location required. Enable GPS.');
                setSubmitting(false);
                return;
            }
            const result = await eventApi.markAttendance(token, {
                name: formData.name,
                email: userEmail,
                studentId: formData.studentId,
                branch: formData.branch,
                phone: formData.phone || undefined,
                latitude: location?.lat,
                longitude: location?.lng,
                locationAccuracy: location?.accuracy,
            });
            if (result.success) {
                setSuccess(result.message);
                setStep('success');
                localStorage.setItem('attendanceUser', JSON.stringify({
                    email: userEmail,
                    name: formData.name,
                    studentId: formData.studentId,
                    branch: formData.branch,
                    phone: formData.phone,
                }));
            } else {
                setError(result.error || 'Failed to mark attendance');
            }
        } catch (err) {
            setError('Something went wrong. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const typeConfig = contest ? contestTypeConfig[contest.type] || contestTypeConfig.other : contestTypeConfig.other;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'short', month: 'short', day: 'numeric',
        });
    };

    const formatTime = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    // ─── LOADING ───
    if (step === 'loading') {
        return (
            <div className="min-h-[100dvh] bg-white dark:bg-[#0f172a] flex items-center justify-center font-['Inter',sans-serif]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-[3px] border-[#1152d4] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-slate-400">Loading event...</p>
                </div>
            </div>
        );
    }

    // ─── ERROR ───
    if (step === 'error') {
        return (
            <div className="min-h-[100dvh] bg-white dark:bg-[#0f172a] flex items-center justify-center font-['Inter',sans-serif] p-5">
                <div className="w-full max-w-sm text-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Something went wrong</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{error}</p>
                    <Link href="/" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1152d4] text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform">
                        <span className="material-symbols-outlined text-base">home</span>
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    // ─── SUCCESS ───
    if (step === 'success') {
        return (
            <div className="min-h-[100dvh] bg-white dark:bg-[#0f172a] flex items-center justify-center font-['Inter',sans-serif] p-5">
                <div className="w-full max-w-sm text-center">
                    <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4 relative">
                        <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
                        <span className="absolute inset-0 rounded-full border-2 border-green-200 dark:border-green-800 animate-ping opacity-30" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">You're all set!</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 leading-relaxed">{success}</p>
                    {contest && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            <span className="font-medium">{contest.title}</span> • {contest.venue}
                        </p>
                    )}
                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                        <Link href="/" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1152d4] text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform">
                            <span className="material-symbols-outlined text-base">home</span>
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ─── EVENT HEADER (reusable for login + form) ───
    const EventHeader = () => (
        <div className="px-5 pt-6 pb-4">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeConfig.bg} ${typeConfig.color}`}>
                    <span className="material-symbols-outlined text-xs">{typeConfig.icon}</span>
                    {typeConfig.label}
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">C2C Attendance</span>
            </div>

            {/* Event title */}
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-2">{contest!.title}</h1>
            {contest!.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{contest!.description}</p>
            )}

            {/* Info chips */}
            <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                    <span className="material-symbols-outlined text-[#1152d4] text-sm">calendar_today</span>
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{formatDate(contest!.date)}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                    <span className="material-symbols-outlined text-[#1152d4] text-sm">schedule</span>
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{formatTime(contest!.startTime)} – {formatTime(contest!.endTime)}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                    <span className="material-symbols-outlined text-[#1152d4] text-sm">place</span>
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{contest!.venue}</span>
                </div>
                {contest!.requiresGPS && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50">
                        <span className="material-symbols-outlined text-amber-500 text-sm">my_location</span>
                        <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">GPS Required</span>
                    </div>
                )}
            </div>
        </div>
    );

    // ─── LOGIN STATE ───
    if (step === 'login' && contest) {
        return (
            <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0f172a] font-['Inter',sans-serif] flex flex-col">
                {/* Gradient accent */}
                <div className="h-1 w-full bg-gradient-to-r from-[#1152d4] to-blue-400 flex-shrink-0" />

                <div className="flex-1 w-full max-w-lg mx-auto flex flex-col">
                    {/* Event info */}
                    <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                        <EventHeader />
                    </div>

                    {/* Login content */}
                    <div className="flex-1 flex flex-col px-5 py-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                            <div className="text-center mb-5">
                                <div className="w-12 h-12 rounded-full bg-[#1152d4]/10 flex items-center justify-center mx-auto mb-3">
                                    <span className="material-symbols-outlined text-[#1152d4] text-2xl">login</span>
                                </div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">Sign in to continue</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Use your MNIT Google account</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2.5 rounded-xl mb-4 text-xs flex items-start gap-2">
                                    <span className="material-symbols-outlined text-sm mt-px flex-shrink-0">error</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex justify-center mb-4">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Sign-in failed. Try again.')}
                                    theme="filled_blue"
                                    text="signin_with"
                                    shape="pill"
                                    size="large"
                                    width="280"
                                />
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3 flex items-start gap-2">
                                <span className="material-symbols-outlined text-blue-500 text-sm mt-px flex-shrink-0">info</span>
                                <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed">
                                    Only <span className="font-semibold">@mnit.ac.in</span> emails are accepted (e.g., 2022ucp1234@mnit.ac.in)
                                </p>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="mt-4 px-1">
                            <div className="flex flex-col gap-2.5">
                                {[
                                    { icon: 'verified_user', text: 'Sign in with your official MNIT email' },
                                    { icon: 'badge', text: 'Verify your Student ID matches records' },
                                    { icon: 'location_on', text: 'You must be physically at the venue' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                        <span className="material-symbols-outlined text-[#1152d4] text-sm">{item.icon}</span>
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <p className="text-center text-[10px] text-slate-400">© 2026 C2C Education Platform</p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── FORM STATE ───
    if (step === 'form' && contest) {
        return (
            <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0f172a] font-['Inter',sans-serif] flex flex-col">
                {/* Gradient accent */}
                <div className="h-1 w-full bg-gradient-to-r from-[#1152d4] to-blue-400 flex-shrink-0" />

                <div className="flex-1 w-full max-w-lg mx-auto flex flex-col">
                    {/* Event info */}
                    <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                        <EventHeader />
                    </div>

                    {/* Form content */}
                    <div className="flex-1 px-5 py-5">
                        {/* User bar */}
                        <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-3 mb-4 shadow-sm">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-[#1152d4]/10 flex items-center justify-center text-[#1152d4] font-bold text-xs flex-shrink-0">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{userName}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { localStorage.removeItem('attendanceUser'); setStep('login'); setError(''); }}
                                className="text-[10px] text-[#1152d4] font-semibold px-2.5 py-1 rounded-lg hover:bg-[#1152d4]/5 active:scale-95 transition-all flex-shrink-0"
                            >
                                Switch
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2.5 rounded-xl mb-4 text-xs flex items-start gap-2">
                                <span className="material-symbols-outlined text-sm mt-px flex-shrink-0">error</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm space-y-4">
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm text-[#1152d4]">edit_note</span>
                                    Your Details
                                </h3>

                                {/* Name - readonly */}
                                <div>
                                    <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">Full Name</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                                            <span className="material-symbols-outlined text-base">person</span>
                                        </span>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            readOnly
                                            className="pl-9 w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500">
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Email - readonly */}
                                <div>
                                    <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">Email</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                                            <span className="material-symbols-outlined text-base">mail</span>
                                        </span>
                                        <input
                                            type="email"
                                            value={userEmail}
                                            readOnly
                                            className="pl-9 w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500">
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Student ID */}
                                <div>
                                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                        Student ID <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <span className="material-symbols-outlined text-base">tag</span>
                                        </span>
                                        <input
                                            type="text"
                                            value={formData.studentId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value.toUpperCase() }))}
                                            className="pl-9 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs focus:border-[#1152d4] focus:ring-1 focus:ring-[#1152d4] transition-all"
                                            placeholder="e.g. 2022UCP1234"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Branch */}
                                <div>
                                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                        Branch <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <span className="material-symbols-outlined text-base">school</span>
                                        </span>
                                        <select
                                            value={formData.branch}
                                            onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                                            className="pl-9 pr-8 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs focus:border-[#1152d4] focus:ring-1 focus:ring-[#1152d4] appearance-none transition-all"
                                            required
                                        >
                                            <option disabled value="">Select branch</option>
                                            {branchOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                            <span className="material-symbols-outlined text-sm">expand_more</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                                        Phone <span className="text-slate-300 font-normal">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <span className="material-symbols-outlined text-base">phone</span>
                                        </span>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="pl-9 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs focus:border-[#1152d4] focus:ring-1 focus:ring-[#1152d4] transition-all"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* GPS Status */}
                            {contest.requiresGPS && (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
                                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                        <span className="material-symbols-outlined text-sm text-[#1152d4]">my_location</span>
                                        Location
                                    </h3>
                                    {location ? (
                                        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-3">
                                            <div className="relative flex-shrink-0">
                                                <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-green-800 dark:text-green-300">Location verified</p>
                                                <p className="text-[10px] text-green-600 dark:text-green-400">Accuracy: ±{Math.round(location.accuracy)}m</p>
                                            </div>
                                        </div>
                                    ) : gettingLocation ? (
                                        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-3">
                                            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Getting location...</p>
                                                <p className="text-[10px] text-amber-600 dark:text-amber-400">Allow GPS access when prompted</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-3">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-red-500 text-lg flex-shrink-0">location_off</span>
                                                <div>
                                                    <p className="text-xs font-semibold text-red-800 dark:text-red-300">{locationError || 'Location needed'}</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={getLocation} className="text-[10px] font-bold text-[#1152d4] px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 active:scale-95 transition-transform flex-shrink-0">
                                                Retry
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting || (contest.requiresGPS && !location)}
                                className="w-full flex justify-center items-center gap-2 h-12 rounded-2xl text-sm font-bold text-white bg-[#1152d4] hover:bg-[#0e43ad] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#1152d4]/20"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Marking...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                        <span>Mark Attendance</span>
                                    </>
                                )}
                            </button>

                            <p className="text-center text-[10px] text-slate-400 leading-relaxed">
                                By marking attendance you confirm your physical presence at the venue.
                            </p>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto">
                        <p className="text-center text-[10px] text-slate-400">© 2026 C2C Education Platform</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

export default function AttendancePage() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AttendancePageContent />
        </GoogleOAuthProvider>
    );
}
