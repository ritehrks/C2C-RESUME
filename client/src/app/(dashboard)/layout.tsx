"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

interface UserData {
    name: string;
    email: string;
    profileImage?: string;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }
    }, []);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    const displayName = userData?.name || 'User';
    const displayEmail = userData?.email || '';
    const displayRole = displayEmail.includes('admin') ? 'Admin' : 'Student';

    const navItems = [
        { name: 'My Resumes', href: '/dashboard', icon: 'folder_open', active: pathname === '/dashboard' },
        { name: 'ATS Analyzer', href: '/analyzer', icon: 'analytics', active: pathname === '/analyzer' },
        { name: 'Profile', href: '/profile', icon: 'person', active: pathname === '/profile' },
        { name: 'Events & Courses', href: '/courses', icon: 'school', active: pathname.startsWith('/courses') },
        { name: 'My Attendance', href: '/attendance', icon: 'event_available', active: pathname === '/attendance' },
        ...(displayRole === 'Admin' ? [
            { name: 'Manage Events', href: '/admin/contests', icon: 'qr_code_scanner', active: pathname.startsWith('/admin/contests') },
            { name: 'Manage Courses', href: '/admin/courses', icon: 'menu_book', active: pathname === '/admin/courses' },
        ] : []),
    ];

    return (
        <ProtectedRoute>
            <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-hidden">

                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar - Responsive */}
                <aside
                    className={`
                        fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-white dark:bg-[#1a2235] border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 transform
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        lg:static lg:translate-x-0 lg:flex-shrink-0
                    `}
                >
                    <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 justify-between">
                        <Link href="/" className="flex items-center gap-3 group">
                            <Image src="/logo-v2.png" alt="C2C Logo" width={40} height={40} className="rounded-lg group-hover:scale-105 transition-transform" />
                            <span className="text-lg font-bold">C2C Resume</span>
                        </Link>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active
                                    ? 'bg-app-primary/10 text-app-primary'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        ))}

                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('user');
                                    router.push('/login');
                                }}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors w-full group"
                            >
                                <span className="material-symbols-outlined group-hover:text-red-600 transition-colors">logout</span>
                                <span className="text-sm font-medium group-hover:text-red-600">Logout</span>
                            </button>
                        </div>
                    </nav>

                    <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-app-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                                {userData?.profileImage ? (
                                    <img src={userData.profileImage} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-app-primary font-bold text-lg">{displayName.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{displayName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{displayRole}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
                    {/* Top Header - Shared across dashboard pages */}
                    <header className="h-16 flex-none flex items-center justify-between px-4 sm:px-8 bg-white/80 dark:bg-[#1a2235]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10 sticky top-0">
                        <div className="flex items-center gap-4 w-full max-w-md">
                            {/* Mobile Sidebar Toggle */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="material-symbols-outlined">menu</span>
                            </button>

                            <div className="relative group w-full">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-app-primary transition-colors">search</span>
                                </div>
                                <input className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-app-primary/50 sm:text-sm transition-all" placeholder="Search resumes..." type="text" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 pl-4 shrink-0">
                            <Link href="/profile" className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Profile">
                                <span className="material-symbols-outlined">person</span>
                            </Link>
                        </div>
                    </header>

                    {/* Scrollable Page Content */}
                    <div className="flex-1 overflow-y-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
