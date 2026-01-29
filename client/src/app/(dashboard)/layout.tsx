"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { name: 'My Resumes', href: '/dashboard', icon: 'folder_open', active: pathname === '/dashboard' },
        { name: 'ATS Analyzer', href: '/analyzer', icon: 'analytics', active: pathname === '/analyzer' },
        { name: 'Profile', href: '/profile', icon: 'person', active: pathname === '/profile' },
    ];

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-hidden">
            {/* Sidebar - Fixed */}
            <aside className="w-64 flex flex-col bg-white dark:bg-[#1a2235] border-r border-slate-200 dark:border-slate-800 flex-shrink-0 z-20">
                <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
                    <Link href="/" className="flex items-center gap-3 group">
                        <Image src="/logo.png?v=2" alt="C2C Logo" width={140} height={50} className="h-12 w-auto" />
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
                    <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Dashboard</p>
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${item.active
                                ? 'bg-app-primary/10 text-app-primary dark:bg-app-primary/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <span className={`material-symbols-outlined ${item.active ? 'icon-filled' : ''}`}>{item.icon}</span>
                            <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                    ))}

                    <div className="mt-6">
                        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">System</p>
                        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                            <span className="material-symbols-outlined">settings</span>
                            <span className="text-sm font-medium">Settings</span>
                        </a>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCFnHNmp6400v64sj3Mh6JBRMaJ9c2uBw8ZpsZup8BUi0ECpxGbK2Xpn-Mql_EzJjOmwuUUaa1zcWJbyiwqxDjJNg-a1eKiy_2NtOo5PZ7be9werkAM7p0TYmFdiUTQwddIm-TD_lKt66XaLyYnn9tjZ6IEtF1V5JgfX47DMKBoSDfWiCotsU-z1VpVGtLFiUj4hATnGTvYM6ZaO9eNVI2Wabq9irBfF-awNCD4TawPaoDuDAPfW2tdNHAqPR_XjO3rCoGU6nbo1sI')" }}></div>
                        <div className="flex flex-col">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">Alex Morgan</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Student</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-light dark:bg-background-dark">
                {/* Top Header - Shared across dashboard pages */}
                <header className="h-16 flex-none flex items-center justify-between px-8 bg-white/80 dark:bg-[#1a2235]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10 sticky top-0">
                    <div className="w-full max-w-md">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 group-focus-within:text-app-primary transition-colors">search</span>
                            </div>
                            <input className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-app-primary/50 sm:text-sm transition-all" placeholder="Search resumes, jobs..." type="text" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2235]"></span>
                        </button>
                        <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined">help</span>
                        </button>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
