"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

// Get Google Client ID from environment
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

function LoginContent() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Admin login handler (email/password)
    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                if (data.user.role === 'admin') {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Google Sign-In success handler
    const handleGoogleSuccess = async (credentialResponse: any) => {
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: credentialResponse.credential }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                if (data.isNewUser) {
                    console.log('🎉 Welcome new user:', data.user.name);
                }

                if (data.user.role === 'admin') {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            } else {
                setError(data.message || 'Login failed. Only @mnit.ac.in emails are allowed.');
            }
        } catch (err: any) {
            console.error('Google login error:', err);
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google Sign-In failed. Please try again.');
    };

    return (
        <div className="bg-gradient-to-br from-[#f0f4ff] via-[#f6f6f8] to-[#e8f0fe] dark:from-[#0a0f1a] dark:via-[#101622] dark:to-[#0d1525] font-['Inter',sans-serif] text-[#0d121b] dark:text-white flex flex-col min-h-screen overflow-hidden transition-colors duration-200">
            {/* Animated Background Pattern */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #1152d4 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Gradient Orbs */}
            <div className="absolute top-0 left-1/4 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 w-full px-4 py-4 sm:px-6 sm:py-6 md:px-10 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 sm:gap-3">
                    <div className="size-7 sm:size-8 text-[#1152d4] flex items-center justify-center">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor" />
                            <path clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" fillRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-[#0d121b] dark:text-white text-base sm:text-lg font-bold leading-tight tracking-[-0.015em]">C2C Resume</h2>
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center p-3 sm:p-4 relative z-10 pb-16 sm:pb-20">
                {/* Login Card */}
                <div className="w-full max-w-[400px] sm:max-w-[440px] flex flex-col bg-white/90 dark:bg-[#1a202c]/95 backdrop-blur-xl rounded-2xl sm:rounded-xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] border border-white/50 dark:border-[#2d3748]/80 p-5 sm:p-8 md:p-10 transition-all">
                    {/* Card Header */}
                    <div className="flex flex-col gap-1.5 sm:gap-2 mb-6 sm:mb-8 text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0d121b] dark:text-white">Welcome to C2C</h1>
                        <p className="text-[#4c669a] dark:text-[#a0aec0] text-sm sm:text-base font-normal">Sign in with your MNIT email to continue</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 sm:mb-6 text-xs sm:text-sm flex items-start gap-2">
                            <span className="material-symbols-outlined text-base sm:text-lg mt-0.5 flex-shrink-0">error</span>
                            <span className="leading-relaxed">{error}</span>
                        </div>
                    )}

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-3 sm:py-4 mb-3 sm:mb-4">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 sm:border-4 border-[#1152d4] border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-2 sm:ml-3 text-sm sm:text-base text-[#4c669a] dark:text-[#a0aec0]">Signing you in...</span>
                        </div>
                    )}

                    {/* Google Sign-In Button */}
                    {!isLoading && (
                        <div className="flex flex-col gap-4 sm:gap-5">
                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    useOneTap
                                    theme="filled_blue"
                                    text="signin_with"
                                    shape="rectangular"
                                    size="large"
                                    width="320"
                                    logo_alignment="left"
                                />
                            </div>

                            {/* MNIT Email Notice */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/80 dark:border-blue-800/60 rounded-xl p-3.5 sm:p-4 mt-1 sm:mt-2">
                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg sm:text-xl">verified</span>
                                    </div>
                                    <div>
                                        <p className="text-blue-800 dark:text-blue-200 font-semibold text-xs sm:text-sm">MNIT Email Required</p>
                                        <p className="text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs mt-0.5 sm:mt-1 leading-relaxed">
                                            Only official MNIT email addresses are allowed.<br className="hidden sm:block" />
                                            Example: <strong className="font-semibold">yourname@mnit.ac.in</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="relative flex py-2 sm:py-3 items-center">
                                <div className="flex-grow border-t border-[#e7ebf3] dark:border-[#4a5568]"></div>
                                <span className="flex-shrink-0 mx-3 sm:mx-4 text-[10px] sm:text-xs font-semibold text-[#4c669a] dark:text-[#a0aec0] uppercase tracking-wider">Admin Only</span>
                                <div className="flex-grow border-t border-[#e7ebf3] dark:border-[#4a5568]"></div>
                            </div>

                            {/* Admin Login Form (Collapsible) */}
                            <details className="group">
                                <summary className="flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-[#4c669a] dark:text-[#a0aec0] text-xs sm:text-sm hover:text-[#1152d4] transition-colors list-none">
                                    <span className="material-symbols-outlined text-base sm:text-lg group-open:rotate-180 transition-transform">expand_more</span>
                                    Admin Login
                                </summary>
                                <form onSubmit={handleAdminLogin} className="flex flex-col gap-3 sm:gap-4 mt-3 sm:mt-4">
                                    {/* Email Field */}
                                    <div className="flex flex-col gap-1.5 sm:gap-2">
                                        <label className="text-[#0d121b] dark:text-[#e2e8f0] text-xs sm:text-sm font-medium">Email</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="flex w-full rounded-lg text-[#0d121b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#1152d4]/50 focus:border-[#1152d4] border border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748] h-10 sm:h-12 placeholder:text-[#94a3b8] px-3 sm:px-4 pr-10 sm:pr-12 text-sm sm:text-base font-normal transition-all"
                                                placeholder="admin@c2c.internal"
                                                required
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 sm:pr-3 pointer-events-none text-[#94a3b8]">
                                                <span className="material-symbols-outlined text-[16px] sm:text-[20px]">mail</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div className="flex flex-col gap-1.5 sm:gap-2">
                                        <label className="text-[#0d121b] dark:text-[#e2e8f0] text-xs sm:text-sm font-medium">Password</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="flex w-full rounded-lg text-[#0d121b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#1152d4]/50 focus:border-[#1152d4] border border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748] h-10 sm:h-12 placeholder:text-[#94a3b8] px-3 sm:px-4 pr-10 sm:pr-12 text-sm sm:text-base font-normal transition-all"
                                                placeholder="Enter password"
                                                required
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 sm:pr-3 pointer-events-none text-[#94a3b8]">
                                                <span className="material-symbols-outlined text-[16px] sm:text-[20px]">lock</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin Login Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 sm:h-11 px-4 bg-[#374151] hover:bg-[#4b5563] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] shadow-sm transition-all active:scale-[0.98]"
                                    >
                                        {isLoading ? 'Signing in...' : 'Admin Login'}
                                    </button>
                                </form>
                            </details>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-4 sm:py-6 text-center">
                <p className="text-xs sm:text-sm text-[#4c669a] dark:text-[#a0aec0]">
                    © 2026 C2C Club MNIT. Built for MNIT students.
                </p>
            </footer>
        </div>
    );
}

export default function LoginPage() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <LoginContent />
        </GoogleOAuthProvider>
    );
}
