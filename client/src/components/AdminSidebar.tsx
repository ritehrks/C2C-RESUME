"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface UserData {
    name: string;
    email: string;
    profileImage?: string;
}

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }
    }, []);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const navItems = [
        { href: '/admin', icon: 'dashboard', label: 'Overview', exact: true },
        { href: '/admin/contests', icon: 'event', label: 'Events & Attendance' },
        { href: '/admin/courses', icon: 'menu_book', label: 'Manage Courses' },
        { href: '/admin/users', icon: 'group', label: 'User Management' },
        { href: '/admin/analytics', icon: 'analytics', label: 'Analytics' },
    ];

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    const displayName = userData?.name || 'Admin';

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-3 left-3 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-[#1a2233] border border-gray-200 dark:border-gray-700 shadow-sm"
                aria-label="Toggle sidebar"
            >
                <span className="material-symbols-outlined text-[20px] text-[#4c669a]">
                    {isOpen ? 'close' : 'menu'}
                </span>
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:relative z-40
                w-64 flex-shrink-0 flex flex-col
                border-r border-gray-200 dark:border-gray-800
                bg-white dark:bg-[#1a2233] h-full
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="flex flex-col h-full justify-between p-4">
                    <div className="flex flex-col gap-6">
                        {/* User Profile Header */}
                        <div className="flex items-center gap-3 px-2 pt-10 md:pt-0">
                            <div
                                className="relative bg-center bg-no-repeat bg-cover rounded-full size-10 border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-[#1152d4]/10 text-[#1152d4] font-bold overflow-hidden"
                            >
                                {userData?.profileImage ? (
                                    <img src={userData.profileImage} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                    displayName.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-[#0d121b] dark:text-white text-sm font-semibold leading-tight">{displayName}</h1>
                                <p className="text-[#4c669a] dark:text-gray-400 text-xs font-normal leading-tight">Admin</p>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive(item.href, item.exact)
                                        ? 'bg-[#1152d4]/10 text-[#1152d4]'
                                        : 'text-[#4c669a] hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${isActive(item.href, item.exact) ? 'text-[#1152d4]' : 'text-[#4c669a] group-hover:text-[#1152d4]'} transition-colors`}>
                                        {item.icon}
                                    </span>
                                    <p className={`text-sm ${isActive(item.href, item.exact) ? 'font-semibold text-[#1152d4]' : 'font-medium text-[#0d121b] dark:text-gray-300'}`}>
                                        {item.label}
                                    </p>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Logout */}
                    <div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c669a] hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors group w-full"
                        >
                            <span className="material-symbols-outlined text-[#4c669a] group-hover:text-red-600 transition-colors text-[20px]">logout</span>
                            <p className="text-[#0d121b] dark:text-gray-300 group-hover:text-red-600 text-sm font-medium">Logout</p>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
