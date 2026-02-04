"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { contestApi } from '@/lib/api';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

// Contest type labels and colors
const contestTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
    coding_contest: { label: 'Coding Contest', color: 'bg-purple-500', icon: 'code' },
    workshop: { label: 'Workshop', color: 'bg-blue-500', icon: 'school' },
    hackathon: { label: 'Hackathon', color: 'bg-orange-500', icon: 'rocket_launch' },
    meeting: { label: 'Meeting', color: 'bg-green-500', icon: 'groups' },
    seminar: { label: 'Seminar', color: 'bg-teal-500', icon: 'mic' },
    other: { label: 'Event', color: 'bg-gray-500', icon: 'event' },
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
            const data = await contestApi.getContestByToken(token);

            if (data.success) {
                setContest(data.contest);
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
            const checkResult = await contestApi.checkAttendance(token, email);
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

            const result = await contestApi.markAttendance(token, attendanceData);

            if (result.success) {
                setSuccess(result.message);
                setStep('success');
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
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] via-[#f8fafc] to-[#e8f0fe] dark:from-[#0a0f1a] dark:via-[#0d1320] dark:to-[#0d1525] font-['Inter',sans-serif]">
            {/* Background Pattern */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-30 dark:opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #1152d4 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Header */}
            <header className="relative z-10 w-full px-4 py-4 sm:py-5 bg-white/70 dark:bg-[#1a202c]/70 backdrop-blur-md border-b border-white/50 dark:border-[#2d3748]/50">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="size-7 sm:size-8 text-[#1152d4] flex items-center justify-center">
                            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor" />
                            </svg>
                        </div>
                        <h1 className="text-base sm:text-lg font-bold text-[#0d121b] dark:text-white">C2C Club</h1>
                    </Link>
                    <span className="text-xs sm:text-sm text-[#4c669a] dark:text-[#a0aec0] font-medium">Attendance</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 px-4 py-6 sm:py-8">
                <div className="max-w-lg mx-auto">
                    {/* Loading State */}
                    {step === 'loading' && (
                        <div className="bg-white/90 dark:bg-[#1a202c]/95 backdrop-blur-xl rounded-2xl shadow-xl p-8 text-center">
                            <div className="w-12 h-12 border-4 border-[#1152d4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-[#4c669a] dark:text-[#a0aec0]">Loading event details...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {step === 'error' && (
                        <div className="bg-white/90 dark:bg-[#1a202c]/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-red-500 text-3xl sm:text-4xl">error</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-[#0d121b] dark:text-white mb-2">Oops!</h2>
                            <p className="text-[#4c669a] dark:text-[#a0aec0] mb-6">{error}</p>
                            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1152d4] text-white rounded-lg font-semibold hover:bg-[#0d3fa8] transition-colors">
                                <span className="material-symbols-outlined text-lg">home</span>
                                Go Home
                            </Link>
                        </div>
                    )}

                    {/* Success State */}
                    {step === 'success' && (
                        <div className="bg-white/90 dark:bg-[#1a202c]/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 text-center">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <span className="material-symbols-outlined text-green-500 text-4xl sm:text-5xl">check_circle</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-[#0d121b] dark:text-white mb-2">Success!</h2>
                            <p className="text-[#4c669a] dark:text-[#a0aec0] mb-2">{success}</p>
                            {contest && (
                                <p className="text-sm text-[#64748b] dark:text-[#718096]">
                                    Event: <span className="font-medium">{contest.title}</span>
                                </p>
                            )}
                            <div className="mt-6 pt-6 border-t border-[#e7ebf3] dark:border-[#2d3748]">
                                <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1152d4] text-white rounded-lg font-semibold hover:bg-[#0d3fa8] transition-colors">
                                    <span className="material-symbols-outlined text-lg">home</span>
                                    Go to Dashboard
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Login Step */}
                    {step === 'login' && contest && (
                        <div className="space-y-4 sm:space-y-5">
                            {/* Contest Card */}
                            <div className="bg-white/90 dark:bg-[#1a202c]/95 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
                                {/* Type Badge Banner */}
                                <div className={`${typeConfig.color} px-4 py-2.5 sm:py-3 flex items-center gap-2 text-white`}>
                                    <span className="material-symbols-outlined text-lg sm:text-xl">{typeConfig.icon}</span>
                                    <span className="font-semibold text-sm sm:text-base">{typeConfig.label}</span>
                                </div>

                                <div className="p-5 sm:p-6">
                                    <h2 className="text-xl sm:text-2xl font-bold text-[#0d121b] dark:text-white mb-2">{contest.title}</h2>
                                    {contest.description && (
                                        <p className="text-[#4c669a] dark:text-[#a0aec0] text-sm mb-4">{contest.description}</p>
                                    )}

                                    <div className="space-y-2.5 sm:space-y-3">
                                        <div className="flex items-center gap-2.5 text-[#4c669a] dark:text-[#a0aec0]">
                                            <span className="material-symbols-outlined text-lg">calendar_today</span>
                                            <span className="text-sm">{formatDate(contest.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-[#4c669a] dark:text-[#a0aec0]">
                                            <span className="material-symbols-outlined text-lg">schedule</span>
                                            <span className="text-sm">{contest.startTime} - {contest.endTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-[#4c669a] dark:text-[#a0aec0]">
                                            <span className="material-symbols-outlined text-lg">location_on</span>
                                            <span className="text-sm">{contest.venue}</span>
                                        </div>
                                        {contest.requiresGPS && (
                                            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                                                <span className="material-symbols-outlined text-lg">my_location</span>
                                                <span className="text-sm font-medium">Location verification required</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Login Card */}
                            <div className="bg-white/90 dark:bg-[#1a202c]/95 backdrop-blur-xl rounded-2xl shadow-xl p-5 sm:p-6">
                                <div className="text-center mb-5">
                                    <h3 className="text-lg sm:text-xl font-bold text-[#0d121b] dark:text-white mb-1">Mark Your Attendance</h3>
                                    <p className="text-[#4c669a] dark:text-[#a0aec0] text-sm">Sign in with your MNIT email to continue</p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2.5 rounded-lg mb-4 text-xs sm:text-sm flex items-start gap-2">
                                        <span className="material-symbols-outlined text-base mt-0.5 flex-shrink-0">error</span>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="flex justify-center">
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

                                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3.5">
                                    <div className="flex items-start gap-2.5">
                                        <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">info</span>
                                        <div>
                                            <p className="text-blue-700 dark:text-blue-300 text-xs font-medium">MNIT Email Required</p>
                                            <p className="text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs mt-0.5">
                                                Use your official MNIT email (e.g., 2022ucp1234@mnit.ac.in)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Step */}
                    {step === 'form' && contest && (
                        <div className="bg-white/90 dark:bg-[#1a202c]/95 backdrop-blur-xl rounded-2xl shadow-xl">
                            {/* Header */}
                            <div className={`${typeConfig.color} px-4 py-3 flex items-center gap-2 text-white`}>
                                <span className="material-symbols-outlined">{typeConfig.icon}</span>
                                <span className="font-semibold text-sm">{contest.title}</span>
                            </div>

                            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
                                <div className="text-center mb-4">
                                    <h3 className="text-lg font-bold text-[#0d121b] dark:text-white mb-1">Complete Your Details</h3>
                                    <p className="text-[#4c669a] dark:text-[#a0aec0] text-sm">
                                        Signed in as <span className="font-medium text-[#1152d4]">{userEmail}</span>
                                    </p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2.5 rounded-lg text-xs sm:text-sm flex items-start gap-2">
                                        <span className="material-symbols-outlined text-base mt-0.5">error</span>
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-1.5">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50"
                                        placeholder="Your full name"
                                        required
                                    />
                                </div>

                                {/* Student ID */}
                                <div>
                                    <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-1.5">
                                        Student ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.studentId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value.toUpperCase() }))}
                                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50"
                                        placeholder="e.g., 2022UCP1234"
                                        required
                                    />
                                </div>

                                {/* Branch */}
                                <div>
                                    <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-1.5">
                                        Branch <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.branch}
                                        onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50"
                                        required
                                    >
                                        <option value="">Select your branch</option>
                                        {branchOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Phone (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium text-[#0d121b] dark:text-white mb-1.5">
                                        Phone Number <span className="text-[#94a3b8] text-xs">(Optional)</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748] text-[#0d121b] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1152d4]/50"
                                        placeholder="10-digit mobile number"
                                    />
                                </div>

                                {/* Location Status */}
                                {contest.requiresGPS && (
                                    <div className={`p-3.5 rounded-lg ${location ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : locationError ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'}`}>
                                        <div className="flex items-start gap-2.5">
                                            <span className={`material-symbols-outlined text-lg mt-0.5 ${location ? 'text-green-500' : locationError ? 'text-red-500' : 'text-amber-500'}`}>
                                                {location ? 'check_circle' : gettingLocation ? 'sync' : 'my_location'}
                                            </span>
                                            <div className="flex-1">
                                                <p className={`text-xs font-medium ${location ? 'text-green-700 dark:text-green-300' : locationError ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}>
                                                    {gettingLocation ? 'Getting your location...' : location ? 'Location verified' : locationError || 'Location required'}
                                                </p>
                                                {location && (
                                                    <p className="text-[10px] text-green-600 dark:text-green-400 mt-0.5">
                                                        Accuracy: ±{Math.round(location.accuracy)}m
                                                    </p>
                                                )}
                                                {!location && !gettingLocation && (
                                                    <button
                                                        type="button"
                                                        onClick={getLocation}
                                                        className="text-xs text-[#1152d4] font-medium mt-1 hover:underline"
                                                    >
                                                        Try again
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={submitting || (contest.requiresGPS && !location)}
                                    className="w-full mt-2 py-3 bg-gradient-to-r from-[#1152d4] to-[#4285F4] text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Marking Attendance...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">how_to_reg</span>
                                            <span>Mark Attendance</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-4 text-center">
                <p className="text-xs text-[#4c669a] dark:text-[#64748b]">© 2026 C2C Club MNIT</p>
            </footer>
        </div>
    );
}

export default function AttendancePage() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AttendancePageContent />
        </GoogleOAuthProvider>
    );
}
