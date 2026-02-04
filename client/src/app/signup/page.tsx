"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            const data = await authApi.register(name, email, password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        // Redirect to backend Google OAuth endpoint
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
    };

    return (
        <div className="bg-[#f6f6f8] dark:bg-[#101622] text-[#0d121b] dark:text-white min-h-screen flex flex-col font-['Inter',sans-serif]">
            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7ebf3] dark:border-b-[#2d3748] px-6 lg:px-40 py-3 bg-white dark:bg-[#1a202c]">
                <Link href="/" className="flex items-center gap-4 text-[#0d121b] dark:text-white">
                    <div className="size-8 text-[#1152d4]">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor" />
                            <path clipRule="evenodd" d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" fill="currentColor" fillRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">C2C Platform</h2>
                </Link>
                <Link
                    href="/login"
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-[#1152d4]/10 text-[#1152d4] hover:bg-[#1152d4]/20 transition-colors text-sm font-bold leading-normal tracking-[0.015em]"
                >
                    <span className="truncate">Login</span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
                {/* Signup Card */}
                <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] border border-[#e7ebf3] dark:border-[#2d3748] w-full max-w-[480px] overflow-hidden">
                    {/* Card Header */}
                    <div className="pt-8 pb-4 px-8 text-center">
                        <h1 className="text-[#0d121b] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em] mb-2">Create Account</h1>
                        <p className="text-[#4c669a] dark:text-[#94a3b8] text-base font-normal leading-normal">Join the C2C Resume Platform today.</p>
                    </div>

                    {/* Form Container */}
                    <form onSubmit={handleSubmit} className="px-8 pb-8 pt-2 flex flex-col gap-5">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">error</span>
                                {error}
                            </div>
                        )}

                        {/* Full Name */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#0d121b] dark:text-gray-200 text-sm font-medium leading-normal">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-lg text-[#0d121b] dark:text-white border border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#111827] focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/20 h-12 px-4 text-base placeholder:text-[#4c669a] dark:placeholder:text-[#64748b]"
                                placeholder="e.g. John Doe"
                                required
                            />
                        </div>

                        {/* Email Address */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#0d121b] dark:text-gray-200 text-sm font-medium leading-normal">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg text-[#0d121b] dark:text-white border border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#111827] focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/20 h-12 px-4 text-base placeholder:text-[#4c669a] dark:placeholder:text-[#64748b]"
                                placeholder="john@example.com"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#0d121b] dark:text-gray-200 text-sm font-medium leading-normal flex justify-between">
                                Password
                                <span className="text-[#4c669a] dark:text-[#64748b] text-xs font-normal">min 8 chars</span>
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg text-[#0d121b] dark:text-white border border-[#cfd7e7] dark:border-[#4a5568] bg-[#f8f9fc] dark:bg-[#111827] focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/20 h-12 pl-4 pr-12 text-base placeholder:text-[#4c669a] dark:placeholder:text-[#64748b]"
                                    placeholder="********"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-0 h-full px-4 text-[#4c669a] hover:text-[#0d121b] dark:text-[#64748b] dark:hover:text-white flex items-center justify-center transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#0d121b] dark:text-gray-200 text-sm font-medium leading-normal">Confirm Password</label>
                            <div className="relative flex items-center">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full rounded-lg text-[#0d121b] dark:text-white border ${confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-[#cfd7e7] dark:border-[#4a5568]'} bg-[#f8f9fc] dark:bg-[#111827] focus:border-[#1152d4] focus:ring-2 focus:ring-[#1152d4]/20 h-12 pl-4 pr-12 text-base placeholder:text-[#4c669a] dark:placeholder:text-[#64748b]`}
                                    placeholder="********"
                                    required
                                />
                            </div>
                            {/* Inline Validation */}
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">error</span>
                                    Passwords do not match
                                </p>
                            )}
                        </div>

                        {/* Spacer */}
                        <div className="h-2"></div>

                        {/* Primary Button */}
                        <button
                            type="submit"
                            disabled={isLoading || (confirmPassword !== '' && password !== confirmPassword)}
                            className="w-full h-12 bg-[#1152d4] hover:bg-[#1152d4]/90 disabled:bg-[#1152d4]/50 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm tracking-[0.015em] transition-colors shadow-sm flex items-center justify-center"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-[#e7ebf3] dark:border-[#2d3748]"></div>
                            <span className="flex-shrink-0 mx-4 text-[#4c669a] text-xs">OR</span>
                            <div className="flex-grow border-t border-[#e7ebf3] dark:border-[#2d3748]"></div>
                        </div>

                        {/* Google Button */}
                        <button
                            type="button"
                            onClick={handleGoogleSignup}
                            className="w-full h-12 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-[#1f2937] border border-[#cfd7e7] dark:border-[#4a5568] text-[#0d121b] dark:text-white rounded-lg font-bold text-sm tracking-[0.015em] transition-colors flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Sign up with Google
                        </button>

                        {/* Footer Link */}
                        <div className="text-center pt-2">
                            <p className="text-[#4c669a] text-sm">
                                Already have an account?
                                <Link href="/login" className="text-[#1152d4] font-bold hover:underline ml-1">Login</Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center max-w-sm">
                    <p className="text-[#94a3b8] text-xs">
                        By clicking "Create Account", you agree to our <a className="underline hover:text-[#4c669a]" href="#">Terms of Service</a> and <a className="underline hover:text-[#4c669a]" href="#">Privacy Policy</a>.
                    </p>
                </div>
            </main>
        </div>
    );
}
