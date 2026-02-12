"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { eventApi } from '@/lib/api';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

// Contest type labels and colors
const contestTypeConfig: Record<string, { label: string; color: string; icon: string; gradient: string }> = {
    coding_contest: { label: 'Coding Contest', color: 'bg-blue-500', icon: 'code', gradient: 'from-blue-500/10 to-purple-500/10' },
    workshop: { label: 'Workshop', color: 'bg-purple-500', icon: 'build', gradient: 'from-purple-500/10 to-indigo-500/10' },
    hackathon: { label: 'Hackathon', color: 'bg-orange-500', icon: 'terminal', gradient: 'from-orange-500/10 to-red-500/10' },
    meeting: { label: 'Meeting', color: 'bg-green-500', icon: 'groups', gradient: 'from-green-500/10 to-teal-500/10' },
    seminar: { label: 'Seminar', color: 'bg-teal-500', icon: 'mic', gradient: 'from-teal-500/10 to-cyan-500/10' },
    other: { label: 'Event', color: 'bg-gray-500', icon: 'event', gradient: 'from-gray-500/10 to-slate-500/10' },
};

// Branch options
const branchOptions = [
    { value: 'UCP', label: 'Computer Science (UCP)' },
    { value: 'UCE', label: 'Civil Engineering (UCE)' },
    { value: 'UEC', label: 'Electronics & Comm (UEC)' },
    { value: 'UEE', label: 'Electrical Engineering (UEE)' },
    { value: 'UME', label: 'Mechanical Engineering (UME)' },
    { value: 'UMT', label: 'Metallurgical (UMT)' },
    { value: 'UCH', label: 'Chemical Engineering (UCH)' },
    { value: 'UAR', label: 'Architecture (UAR)' },
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

    // States
    const [contest, setContest] = useState<Contest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form states
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

    // Fetch contest details
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

                // Check if we have saved user details from a previous session
                const savedUser = localStorage.getItem('attendanceUser');
                if (savedUser) {
                    try {
                        const parsed = JSON.parse(savedUser);
                        if (parsed.email && parsed.name) {
                            // Check if already marked attendance
                            const checkResult = await eventApi.checkAttendance(token, parsed.email);
                            if (checkResult.alreadyMarked) {
                                setSuccess(`You have already marked attendance at ${new Date(checkResult.attendance.markedAt).toLocaleString()}`);
                                setStep('success');
                                setLoading(false);
                                return;
                            }

                            // Auto-fill and skip to form
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

                            // Get location if required
                            if (data.event.requiresGPS) {
                                getLocation();
                            }
                            setLoading(false);
                            return;
                        }
                    } catch { /* invalid JSON, fall through to login */ }
                }

                setStep('login');
            } else {
                setError(data.error || 'Contest not found');
                setStep('error');
            }
        } catch (err) {
            setError('Failed to load contest. Please try again.');
            setStep('error');
        } finally {
            setLoading(false);
        }
    };

    // Handle Google login success
    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            // Decode the JWT to get user info
            const base64Url = credentialResponse.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const decoded = JSON.parse(jsonPayload);
            const email = decoded.email?.toLowerCase() || '';
            const name = decoded.name || '';

            // Validate MNIT email
            if (!email.endsWith('@mnit.ac.in')) {
                setError('Only MNIT email addresses (@mnit.ac.in) are allowed. Please use your official MNIT email.');
                return;
            }

            // Check if already marked
            const checkResult = await eventApi.checkAttendance(token, email);
            if (checkResult.alreadyMarked) {
                setSuccess(`You have already marked attendance at ${new Date(checkResult.attendance.markedAt).toLocaleString()}`);
                setStep('success');
                return;
            }

            // Pre-fill form with Google data
            setUserEmail(email);
            setUserName(name);
            setFormData(prev => ({
                ...prev,
                name: name,
            }));

            // Try to extract student ID from email
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

            // Save user details to localStorage for future QR scans
            localStorage.setItem('attendanceUser', JSON.stringify({
                email,
                name,
                studentId: formData.studentId,
                branch: formData.branch,
            }));

            // Get location if required
            if (contest?.requiresGPS) {
                getLocation();
            }
        } catch (err) {
            console.error('Login decode error:', err);
            setError('Failed to process login. Please try again.');
        }
    };

    // Get user location
    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
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
            (err) => {
                setLocationError('Unable to get location. Please enable GPS and try again.');
                setGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            // Validate
            if (!formData.name || !formData.studentId || !formData.branch) {
                setError('Please fill all required fields');
                setSubmitting(false);
                return;
            }

            if (contest?.requiresGPS && !location) {
                setError('Location is required for this event. Please enable GPS.');
                setSubmitting(false);
                return;
            }

            const attendanceData = {
                name: formData.name,
                email: userEmail,
                studentId: formData.studentId,
                branch: formData.branch,
                phone: formData.phone || undefined,
                latitude: location?.lat,
                longitude: location?.lng,
                locationAccuracy: location?.accuracy,
            };

            const result = await eventApi.markAttendance(token, attendanceData);

            if (result.success) {
                setSuccess(result.message);
                setStep('success');

                // Update localStorage with latest form data
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
            setError('Failed to mark attendance. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Get contest type config
    const typeConfig = contest ? contestTypeConfig[contest.type] || contestTypeConfig.other : contestTypeConfig.other;

    // Format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Format time to readable
    const formatTime = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    // Loading State
    if (step === 'loading') {
        return (
            <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#0f172a] flex items-center justify-center font-['Inter',sans-serif]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#1152d4] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400">Loading event details...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (step === 'error') {
        return (
            <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#0f172a] flex items-center justify-center font-['Inter',sans-serif] p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-red-500 text-4xl">error</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Oops!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
                    <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1152d4] text-white rounded-xl font-semibold hover:bg-[#0e43ad] transition-colors shadow-lg shadow-[#1152d4]/20">
                        <span className="material-symbols-outlined text-lg">home</span>
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    // Success State
    if (step === 'success') {
        return (
            <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#0f172a] flex items-center justify-center font-['Inter',sans-serif] p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-slate-200 dark:border-slate-800">
                    <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-green-500 text-5xl">check_circle</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Success!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-2">{success}</p>
                    {contest && (
                        <p className="text-sm text-slate-400 dark:text-slate-500">
                            Event: <span className="font-medium">{contest.title}</span>
                        </p>
                    )}
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1152d4] text-white rounded-xl font-semibold hover:bg-[#0e43ad] transition-colors shadow-lg shadow-[#1152d4]/20">
                            <span className="material-symbols-outlined text-lg">home</span>
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Login State
    if (step === 'login' && contest) {
        return (
            <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#0f172a] font-['Inter',sans-serif]">
                {/* Header */}
                <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-[#1152d4] to-blue-400" />
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#1152d4]/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 relative z-10">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1152d4] dark:bg-[#1152d4]/20 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1152d4] mr-2 animate-pulse" />
                                    {typeConfig.label}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">C2C Attendance Portal</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">{contest.title}</h1>
                            {contest.description && (
                                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">{contest.description}</p>
                            )}
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                        {/* Session Details */}
                        <div className="lg:col-span-5 space-y-8">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Session Details</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                        <div className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-lg mr-4 text-[#1152d4] dark:text-blue-300">
                                            <span className="material-symbols-outlined text-xl">place</span>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-slate-900 dark:text-white">Venue</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{contest.venue}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                        <div className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-lg mr-4 text-[#1152d4] dark:text-blue-300">
                                            <span className="material-symbols-outlined text-xl">schedule</span>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-slate-900 dark:text-white">Date & Time</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(contest.date)}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatTime(contest.startTime)} - {formatTime(contest.endTime)}</p>
                                        </div>
                                    </div>
                                    {contest.requiresGPS && (
                                        <div className="flex items-start bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                            <div className="bg-amber-50 dark:bg-amber-900/30 p-2.5 rounded-lg mr-4 text-amber-600 dark:text-amber-300">
                                                <span className="material-symbols-outlined text-xl">my_location</span>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-900 dark:text-white">GPS Required</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Location verification is enabled for this event</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Instructions</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-[#1152d4] text-base mr-2 mt-0.5">check</span>
                                        Use your official MNIT email (@mnit.ac.in) to sign in.
                                    </li>
                                    <li className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-[#1152d4] text-base mr-2 mt-0.5">check</span>
                                        Verify your student ID matches your registration.
                                    </li>
                                    <li className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-[#1152d4] text-base mr-2 mt-0.5">check</span>
                                        You must be physically present at the venue.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Login Card */}
                        <div className="lg:col-span-7">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Mark Attendance</h2>
                                    <p className="text-slate-600 dark:text-slate-400">Sign in with your MNIT Google account to continue.</p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2">
                                        <span className="material-symbols-outlined text-base mt-0.5 flex-shrink-0">error</span>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="flex justify-center mb-6">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => setError('Google Sign-In failed. Please try again.')}
                                        theme="filled_blue"
                                        text="signin_with"
                                        shape="rectangular"
                                        size="large"
                                        width="300"
                                    />
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                    <div className="flex items-start gap-2.5">
                                        <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">info</span>
                                        <div>
                                            <p className="text-blue-700 dark:text-blue-300 text-xs font-medium">MNIT Email Required</p>
                                            <p className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">
                                                Use your official MNIT email (e.g., 2022ucp1234@mnit.ac.in)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="md:flex md:items-center md:justify-between">
                            <div className="flex justify-center md:justify-start space-x-6 md:order-2">
                                <span className="text-sm text-slate-400">Privacy</span>
                                <span className="text-sm text-slate-400">Help Center</span>
                            </div>
                            <div className="mt-4 md:mt-0 md:order-1">
                                <p className="text-center md:text-left text-xs text-slate-400">© 2026 C2C Education Platform. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }

    // Form State (after Google login)
    if (step === 'form' && contest) {
        return (
            <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#0f172a] font-['Inter',sans-serif]">
                {/* Header */}
                <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-[#1152d4] to-blue-400" />
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#1152d4]/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 relative z-10">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1152d4] dark:bg-[#1152d4]/20 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1152d4] mr-2 animate-pulse" />
                                    {typeConfig.label}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">C2C Attendance Portal</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">{contest.title}</h1>
                            {contest.description && (
                                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">{contest.description}</p>
                            )}
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                        {/* Session Details */}
                        <div className="lg:col-span-5 space-y-8">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Session Details</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                        <div className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-lg mr-4 text-[#1152d4] dark:text-blue-300">
                                            <span className="material-symbols-outlined text-xl">place</span>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-slate-900 dark:text-white">Venue</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{contest.venue}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                        <div className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-lg mr-4 text-[#1152d4] dark:text-blue-300">
                                            <span className="material-symbols-outlined text-xl">schedule</span>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-slate-900 dark:text-white">Date & Time</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(contest.date)}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatTime(contest.startTime)} - {formatTime(contest.endTime)}</p>
                                        </div>
                                    </div>
                                    {contest.requiresGPS && (
                                        <div className="flex items-start bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                            <div className="bg-amber-50 dark:bg-amber-900/30 p-2.5 rounded-lg mr-4 text-amber-600 dark:text-amber-300">
                                                <span className="material-symbols-outlined text-xl">my_location</span>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-900 dark:text-white">GPS Required</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Location verification is enabled</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Instructions</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-[#1152d4] text-base mr-2 mt-0.5">check</span>
                                        Ensure you are connected to the campus Wi-Fi.
                                    </li>
                                    <li className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-[#1152d4] text-base mr-2 mt-0.5">check</span>
                                        Verify your student ID matches your registration.
                                    </li>
                                    <li className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-[#1152d4] text-base mr-2 mt-0.5">check</span>
                                        You must be physically present inside the venue.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="lg:col-span-7">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Mark Attendance</h2>
                                    <p className="text-slate-600 dark:text-slate-400">Please verify your details below to confirm your presence.</p>
                                </div>

                                {/* Signed-in User Bar */}
                                <div className="mb-8 p-4 bg-blue-50/50 dark:bg-[#1152d4]/5 rounded-xl border border-blue-100 dark:border-[#1152d4]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#1152d4]/10 flex items-center justify-center text-[#1152d4] font-bold text-sm border border-slate-200 dark:border-slate-700">
                                            {userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">Signed in as</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{userEmail}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { localStorage.removeItem('attendanceUser'); setStep('login'); setError(''); }}
                                        className="text-sm text-[#1152d4] hover:text-blue-700 font-medium hover:underline transition-colors whitespace-nowrap"
                                    >
                                        Switch Account
                                    </button>
                                </div>

                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2">
                                        <span className="material-symbols-outlined text-base mt-0.5 flex-shrink-0">error</span>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Name (readonly) */}
                                        <div className="relative group">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="name">Full Name</label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                    <span className="material-symbols-outlined text-lg">badge</span>
                                                </span>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    value={formData.name}
                                                    readOnly
                                                    className="pl-10 block w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 sm:text-sm cursor-not-allowed select-none shadow-sm h-10"
                                                />
                                                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-green-500">
                                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Email (readonly) */}
                                        <div className="relative group">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="email">Email Address</label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                    <span className="material-symbols-outlined text-lg">mail</span>
                                                </span>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={userEmail}
                                                    readOnly
                                                    className="pl-10 block w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 sm:text-sm cursor-not-allowed select-none shadow-sm h-10"
                                                />
                                                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-green-500">
                                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Student ID */}
                                        <div className="relative group">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="student_id">
                                                Student ID <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1152d4] transition-colors">
                                                    <span className="material-symbols-outlined text-lg">grid_3x3</span>
                                                </span>
                                                <input
                                                    id="student_id"
                                                    type="text"
                                                    value={formData.studentId}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value.toUpperCase() }))}
                                                    className="pl-10 block w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-[#1152d4] focus:ring-[#1152d4] sm:text-sm transition-shadow h-10"
                                                    placeholder="e.g. 2022UCP1234"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Branch */}
                                        <div className="relative group">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="branch">
                                                Branch <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1152d4] transition-colors">
                                                    <span className="material-symbols-outlined text-lg">school</span>
                                                </span>
                                                <select
                                                    id="branch"
                                                    value={formData.branch}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                                                    className="pl-10 block w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-[#1152d4] focus:ring-[#1152d4] sm:text-sm appearance-none transition-shadow h-10"
                                                    required
                                                >
                                                    <option disabled value="">Select your branch</option>
                                                    {branchOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                                    <span className="material-symbols-outlined text-lg">expand_more</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div className="relative group col-span-1 md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="phone">
                                                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1152d4] transition-colors">
                                                    <span className="material-symbols-outlined text-lg">phone</span>
                                                </span>
                                                <input
                                                    id="phone"
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                    className="pl-10 block w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-[#1152d4] focus:ring-[#1152d4] sm:text-sm transition-shadow h-10"
                                                    placeholder="+91 98765 43210"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* GPS Location Status */}
                                    {contest.requiresGPS && (
                                        <div className="mt-8">
                                            {location ? (
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
                                                    <div className="bg-green-100 dark:bg-green-900/40 rounded-full p-1.5 flex-shrink-0 mt-0.5">
                                                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-lg">my_location</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">Location Verified</h3>
                                                        <p className="text-xs text-green-700 dark:text-green-400 mt-1 leading-relaxed">
                                                            GPS signal acquired with accuracy (±{Math.round(location.accuracy)}m). We have confirmed your location.
                                                        </p>
                                                    </div>
                                                    <div className="ml-auto flex items-center h-full pt-1">
                                                        <span className="flex h-3 w-3 relative">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : gettingLocation ? (
                                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                                                    <div className="bg-amber-100 dark:bg-amber-900/40 rounded-full p-1.5 flex-shrink-0 mt-0.5">
                                                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg animate-spin">sync</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Getting Your Location...</h3>
                                                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Please allow location access when prompted.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                                                    <div className="bg-red-100 dark:bg-red-900/40 rounded-full p-1.5 flex-shrink-0 mt-0.5">
                                                        <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-lg">location_off</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">{locationError || 'Location Required'}</h3>
                                                        <button type="button" onClick={getLocation} className="text-xs text-[#1152d4] font-medium mt-1 hover:underline">
                                                            Try again
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                                        <button
                                            type="submit"
                                            disabled={submitting || (contest.requiresGPS && !location)}
                                            className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg shadow-[#1152d4]/20 text-base font-semibold text-white bg-[#1152d4] hover:bg-[#0e43ad] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1152d4] transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                    Marking Attendance...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-xl mr-2">check_circle_outline</span>
                                                    Mark Attendance
                                                </>
                                            )}
                                        </button>
                                        <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
                                            By marking attendance, you certify that you are present for the entire duration of the session.
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="md:flex md:items-center md:justify-between">
                            <div className="flex justify-center md:justify-start space-x-6 md:order-2">
                                <span className="text-sm text-slate-400">Privacy</span>
                                <span className="text-sm text-slate-400">Help Center</span>
                            </div>
                            <div className="mt-4 md:mt-0 md:order-1">
                                <p className="text-center md:text-left text-xs text-slate-400">© 2026 C2C Education Platform. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </footer>
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
