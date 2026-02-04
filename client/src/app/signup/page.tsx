"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

// Get Google Client ID from environment
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

function SignupContent() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

                router.push('/dashboard');
            } else {
                setError(data.message || 'Sign up failed. Only @mnit.ac.in emails are allowed.');
            }
        } catch (err: any) {
            console.error('Google signup error:', err);
            setError('Sign up failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google Sign-In failed. Please try again.');
    };

    return (
        <div className="bg-gradient-to-br from-[#f0f4ff] via-[#f6f6f8] to-[#e8f0fe] dark:from-[#0a0f1a] dark:via-[#101622] dark:to-[#0d1525] text-[#0d121b] dark:text-white min-h-screen flex flex-col font-['Inter',sans-serif]">
            {/* Animated Background Pattern */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #1152d4 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Gradient Orbs */}
            <div className="absolute top-1/4 right-0 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-0 w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Top Navigation */}
            <header className="relative z-10 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-white/50 dark:border-b-[#2d3748]/50 px-4 py-3 sm:px-6 lg:px-40 bg-white/60 dark:bg-[#1a202c]/60 backdrop-blur-md">
                <Link href="/" className="flex items-center gap-2 sm:gap-4 text-[#0d121b] dark:text-white">
                    <div className="size-6 sm:size-8 text-[#1152d4]">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor" />
                            <path clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" fillRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-sm sm:text-lg font-bold leading-tight tracking-[-0.015em]">C2C Resume</h2>
                </Link>
                <Link
                    href="/login"
                    className="flex min-w-[60px] sm:min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 sm:h-9 px-3 sm:px-4 bg-[#1152d4]/10 text-[#1152d4] hover:bg-[#1152d4]/20 transition-colors text-xs sm:text-sm font-bold leading-normal tracking-[0.015em]"
                >
                    <span className="truncate">Login</span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
                {/* Signup Card */}
                <div className="bg-white/90 dark:bg-[#1a202c]/95 backdrop-blur-xl rounded-2xl sm:rounded-xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] border border-white/50 dark:border-[#2d3748]/80 w-full max-w-[400px] sm:max-w-[460px] overflow-hidden">
                    {/* Card Header */}
                    <div className="pt-6 pb-3 sm:pt-8 sm:pb-4 px-5 sm:px-8 text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-[#1152d4] to-[#4285F4] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="material-symbols-outlined text-white text-2xl sm:text-3xl">school</span>
                        </div>
                        <h1 className="text-[#0d121b] dark:text-white text-2xl sm:text-3xl font-black leading-tight tracking-[-0.033em] mb-1.5 sm:mb-2">Join C2C</h1>
                        <p className="text-[#4c669a] dark:text-[#94a3b8] text-sm sm:text-base font-normal leading-normal">Sign up with your MNIT email to get started</p>
                    </div>

                    {/* Form Container */}
                    <div className="px-5 pb-6 sm:px-8 sm:pb-8 pt-1 sm:pt-2 flex flex-col gap-4 sm:gap-5">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm flex items-start gap-2">
                                <span className="material-symbols-outlined text-base sm:text-lg mt-0.5 flex-shrink-0">error</span>
                                <span className="leading-relaxed">{error}</span>
                            </div>
                        )}

                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-4 sm:py-6">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 sm:border-4 border-[#1152d4] border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-2 sm:ml-3 text-sm sm:text-base text-[#4c669a] dark:text-[#a0aec0]">Creating your account...</span>
                            </div>
                        )}

                        {/* Google Sign-In Button */}
                        {!isLoading && (
                            <>
                                <div className="flex justify-center">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={handleGoogleError}
                                        useOneTap
                                        theme="filled_blue"
                                        text="signup_with"
                                        shape="rectangular"
                                        size="large"
                                        width="320"
                                        logo_alignment="left"
                                    />
                                </div>

                                {/* MNIT Email Notice */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/80 dark:border-blue-800/60 rounded-xl p-4 sm:p-5 mt-1 sm:mt-2">
                                    <div className="flex items-start gap-2.5 sm:gap-3">
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg sm:text-xl">verified</span>
                                        </div>
                                        <div>
                                            <p className="text-blue-800 dark:text-blue-200 font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1">MNIT Email Required</p>
                                            <p className="text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs leading-relaxed">
                                                This platform is exclusively for MNIT students. Please use your official email address.
                                            </p>
                                            <div className="mt-2 sm:mt-2.5">
                                                <span className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-0.5 sm:py-1 rounded">@mnit.ac.in</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Benefits Section */}
                                <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-1 sm:mt-2">
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-[#4c669a] dark:text-[#a0aec0]">
                                        <span className="material-symbols-outlined text-green-500 text-sm sm:text-base">check_circle</span>
                                        <span className="text-[10px] sm:text-xs">ATS-Optimized Resumes</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-[#4c669a] dark:text-[#a0aec0]">
                                        <span className="material-symbols-outlined text-green-500 text-sm sm:text-base">check_circle</span>
                                        <span className="text-[10px] sm:text-xs">AI-Powered Analysis</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-[#4c669a] dark:text-[#a0aec0]">
                                        <span className="material-symbols-outlined text-green-500 text-sm sm:text-base">check_circle</span>
                                        <span className="text-[10px] sm:text-xs">Multiple Templates</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-[#4c669a] dark:text-[#a0aec0]">
                                        <span className="material-symbols-outlined text-green-500 text-sm sm:text-base">check_circle</span>
                                        <span className="text-[10px] sm:text-xs">Free for MNIT Students</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Footer Link */}
                        <div className="text-center pt-3 sm:pt-4 border-t border-[#e7ebf3] dark:border-[#2d3748] mt-1 sm:mt-2">
                            <p className="text-[#4c669a] dark:text-[#a0aec0] text-xs sm:text-sm">
                                Already have an account?
                                <Link href="/login" className="text-[#1152d4] font-bold hover:underline ml-1">Login</Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-6 sm:mt-8 text-center max-w-xs sm:max-w-sm px-4">
                    <p className="text-[#94a3b8] dark:text-[#64748b] text-[10px] sm:text-xs leading-relaxed">
                        By signing up, you agree to our <a className="underline hover:text-[#4c669a]" href="#">Terms of Service</a> and <a className="underline hover:text-[#4c669a]" href="#">Privacy Policy</a>.
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-4 sm:py-6 text-center">
                <p className="text-[10px] sm:text-sm text-[#4c669a] dark:text-[#a0aec0]">
                    © 2026 C2C Club MNIT. Built for MNIT students.
                </p>
            </footer>
        </div>
    );
}

export default function SignupPage() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <SignupContent />
        </GoogleOAuthProvider>
    );
}
