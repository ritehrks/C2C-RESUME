"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export default function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            // Not authenticated, redirect to login
            router.push(redirectTo);
            return;
        }

        // Verify token is valid
        verifyToken(token);
    }, [router, redirectTo]);

    const verifyToken = async (token: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setIsAuthenticated(true);
            } else {
                // Token expired or invalid
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push(redirectTo);
            }
        } catch (error) {
            // Network error, but still allow if token exists (offline support)
            setIsAuthenticated(true);
        }
    };

    // Show loading while checking auth
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-[#1152d4] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Authenticated, render children
    return <>{children}</>;
}
