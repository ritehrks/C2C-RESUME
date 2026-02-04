"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            // Store token
            localStorage.setItem('token', token);

            // Fetch user info
            fetchUserInfo(token);
        } else {
            setError('No authentication token received');
            setTimeout(() => router.push('/login'), 2000);
        }
    }, [searchParams, router]);

    const fetchUserInfo = async (token: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect based on role
                if (data.user.role === 'admin') {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            } else {
                setError('Failed to fetch user info');
                setTimeout(() => router.push('/login'), 2000);
            }
        } catch (err) {
            setError('Authentication failed');
            setTimeout(() => router.push('/login'), 2000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
            <div className="text-center">
                {error ? (
                    <div className="flex flex-col items-center gap-4">
                        <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
                        <p className="text-red-500 font-medium">{error}</p>
                        <p className="text-gray-500 text-sm">Redirecting to login...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-[#1152d4] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-600 dark:text-gray-300 font-medium">Signing you in...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
                <div className="w-12 h-12 border-4 border-[#1152d4] border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
