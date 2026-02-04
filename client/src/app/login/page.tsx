"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await authApi.login(email, password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            if (data.user.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Redirect to backend Google OAuth endpoint
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
    };

    return (
        <div className="bg-[#f6f6f8] dark:bg-[#101622] font-['Inter',sans-serif] text-[#0d121b] dark:text-white flex flex-col min-h-screen overflow-hidden transition-colors duration-200">
            {/* Dot Grid Background Pattern */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-50"
                style={{
                    backgroundImage: 'radial-gradient(#cfd7e7 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}
            />
            <div
                className="absolute inset-0 z-0 pointer-events-none dark:block hidden opacity-30"
                style={{
                    backgroundImage: 'radial-gradient(#2a3441 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}
            />

            {/* Header */}
            <header className="relative z-10 w-full px-6 py-6 md:px-10 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <div className="size-8 text-[#1152d4] flex items-center justify-center">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor" />
                            <path clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" fillRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-[#0d121b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">C2C Resume Platform</h2>
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center p-4 relative z-10 pb-20">
                {/* Login Card */}
                <div className="w-full max-w-[440px] flex flex-col bg-white dark:bg-[#1a202c] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-transparent dark:border-[#2d3748] p-8 md:p-10 transition-all">
                    {/* Card Header */}
                    <div className="flex flex-col gap-2 mb-8 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-[#0d121b] dark:text-white">Welcome Back</h1>
                        <p className="text-[#4c669a] dark:text-[#a0aec0] text-base font-normal">Please enter your details to sign in.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    {/* Form Fields */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Email Field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#0d121b] dark:text-[#e2e8f0] text-sm font-medium leading-normal">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex w-full rounded-lg text-[#0d121b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#1152d4]/50 focus:border-[#1152d4] border border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748] h-12 placeholder:text-[#94a3b8] px-4 pr-12 text-base font-normal leading-normal transition-all"
                                    placeholder="name@example.com"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#94a3b8]">
                                    <span className="material-symbols-outlined text-[20px]">mail</span>
                                </div>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[#0d121b] dark:text-[#e2e8f0] text-sm font-medium leading-normal">Password</label>
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex w-full rounded-lg text-[#0d121b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#1152d4]/50 focus:border-[#1152d4] border border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#2d3748] h-12 placeholder:text-[#94a3b8] px-4 pr-12 text-base font-normal leading-normal transition-all"
                                    placeholder="Enter your password"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#94a3b8]">
                                    <span className="material-symbols-outlined text-[20px]">lock</span>
                                </div>
                            </div>
                            {/* Forgot Password Link */}
                            <div className="flex justify-end pt-1">
                                <a className="text-[#1152d4] text-sm font-medium hover:text-blue-700 hover:underline transition-colors cursor-pointer">Forgot Password?</a>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[#1152d4] hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-base font-bold leading-normal tracking-[0.015em] shadow-sm transition-all active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                    Signing in...
                                </span>
                            ) : (
                                'Login'
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-[#e7ebf3] dark:border-[#4a5568]"></div>
                            <span className="flex-shrink-0 mx-4 text-xs font-semibold text-[#4c669a] dark:text-[#a0aec0] uppercase tracking-wider">OR</span>
                            <div className="flex-grow border-t border-[#e7ebf3] dark:border-[#4a5568]"></div>
                        </div>

                        {/* Google Button */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-lg h-12 px-4 bg-white dark:bg-[#2d3748] border border-[#cfd7e7] dark:border-[#4a5568] text-[#0d121b] dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-50 dark:hover:bg-[#394559] transition-colors shadow-sm"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Continue with Google</span>
                        </button>

                        {/* Footer Sign Up */}
                        <div className="mt-2 text-center">
                            <p className="text-sm text-[#4c669a] dark:text-[#a0aec0]">
                                Don't have an account?
                                <Link href="/signup" className="font-bold text-[#1152d4] hover:text-blue-700 hover:underline transition-colors ml-1">Sign Up</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
