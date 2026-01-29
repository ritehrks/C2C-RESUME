"use client";

import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Left Column: Resumes */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Heading Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Resumes</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track your CV versions</p>
                        </div>
                        <Link href="/builder" className="inline-flex items-center justify-center gap-2 bg-app-primary hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-lg shadow-app-primary/20">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Create New Resume</span>
                        </Link>
                    </div>

                    {/* Resume Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Resume Card 1 */}
                        <div className="group bg-white dark:bg-[#1a2235] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:border-app-primary/50 transition-all duration-300 flex flex-col">
                            <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-700">
                                <div className="w-full h-full bg-cover bg-top transform group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB_h2T_Wf6UoBqfXjiNdwwb1gJds4mYY5_0JeTecrEbgLKcooZf8qI_hwJwUUB6ZOZGW5j-G7MZLNcflH16souV12EGum0wWOzP_JIt3uE7acAM8dEGVcByyKc-lGZt_Cln7aW53LzQ10TU0AwUyn5NRZbYkFdZ3fahcGonjRj6nI1k8mvUn-dRPX4UY2WXKvuhD8JKhFpZqXwzS6wysi5X7C_LKyIE2apDnet_844M8L-aPIAgRTa0vCVMgaZOdPWw-Zx1ul-m0t8')" }}></div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-1 flex gap-1">
                                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Edit">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Download">
                                            <span className="material-symbols-outlined text-sm">download</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">SDE Internship Resume</h3>
                                    <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-red-500 transition-colors">delete</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span>Last edited 2 hours ago</span>
                                </div>
                                <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                                    <span className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">Tech</span>
                                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">v2.4</span>
                                </div>
                            </div>
                        </div>

                        {/* Resume Card 2 */}
                        <div className="group bg-white dark:bg-[#1a2235] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:border-app-primary/50 transition-all duration-300 flex flex-col">
                            <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-700">
                                <div className="w-full h-full bg-cover bg-top transform group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD9JD_2OZd1cxTcyO2cFXrt70R_Wz_jARsW3sSlV8lMQrdTTTEg9YMyJg7GpgBgqETAIxWal_LWkXCForGmU8NFIZMaPIjqPxz_ag8FTN8j1achNGbBDpTnSfkmtLf3O-b3gplE5rnNFf5stO_2KHFZhtP25Y1ZNmrQa6w3P7n3ooRdKkZLrGdES4VaSxnnTtAoBdPLNXtcPvHokuikQLgSbGgX27Nqsku0Gwr6c0LXbEm-UTpYfORW6QsGA_oqpEyzJ71tPiIL4uo')" }}></div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-1 flex gap-1">
                                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Edit">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Download">
                                            <span className="material-symbols-outlined text-sm">download</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">Data Science Resume</h3>
                                    <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-red-500 transition-colors">delete</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                    <span>Edited 1 day ago</span>
                                </div>
                                <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                                    <span className="px-2 py-1 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium">Research</span>
                                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">v1.0</span>
                                </div>
                            </div>
                        </div>

                        {/* Resume Card 3 */}
                        <div className="group bg-white dark:bg-[#1a2235] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:border-app-primary/50 transition-all duration-300 flex flex-col">
                            <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-700">
                                <div className="w-full h-full bg-cover bg-top transform group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDkoDY80sTlAZOsQw8P47F4n8LKwvrsQX67fC7ZStwNXhDWikr-Y7XlTqp0R2ukK3kSwVURaiKWrLzKpKPhHig5S1R2UTLbqUZp155wfqNsoHtdSf88b0PfRROdTNkuhqX-UVvccDafOq365xfNQH0fLAfOg_uL1UfJuzbHdKS9010I5TjowG1XMI9_edESHbstdnEV2fuHZpAoZoIA9jDnrgRJLb1JXQ9HBlnA-xgxzGle5q_xinS_jzr8gzaNtWf84G152GWQqyM')" }}></div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-1 flex gap-1">
                                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Edit">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Download">
                                            <span className="material-symbols-outlined text-sm">download</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">General Profile</h3>
                                    <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-red-500 transition-colors">delete</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                    <span>Edited 1 week ago</span>
                                </div>
                                <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">Draft</span>
                                </div>
                            </div>
                        </div>

                        {/* Resume Card 4 */}
                        <div className="group bg-white dark:bg-[#1a2235] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:border-app-primary/50 transition-all duration-300 flex flex-col">
                            <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-700">
                                <div className="w-full h-full bg-cover bg-top transform group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD1H4qlT_ERULBsZuZfkciUBrhtjo-Uafdhw0T7uljSLXxsDQcZ9JFJMHziUyXsdqLKy_a2b0XmA7FwJj_9XqeA9_Cnu8A2EB5cTiGXvKWgR0KUJ28wWF26Zqsi40zSDtWWQD-Eoje_kG9h-XQwgDvY3OLFtLlC_LdSuOawh-xTkKvlmTRkx7_APcezXERfpLE3iPJT4eYkjhvbetO7atpKG29DOdzfcJa2SpHodWUoyTXlIoDjdRD-pInjpzGRD62FchNUJuXrz98')" }}></div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-1 flex gap-1">
                                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Edit">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Download">
                                            <span className="material-symbols-outlined text-sm">download</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">Frontend Developer</h3>
                                    <span className="material-symbols-outlined text-slate-400 text-lg cursor-pointer hover:text-red-500 transition-colors">delete</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                    <span>Edited 2 weeks ago</span>
                                </div>
                                <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                                    <span className="px-2 py-1 rounded bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium">Design</span>
                                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">v1.1</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Updates Widget */}
                <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
                    <div className="bg-white dark:bg-[#1a2235] rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Placement Updates</h3>
                            <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-app-primary">more_horiz</span>
                        </div>
                        <div className="relative pl-2">
                            {/* Vertical Line */}
                            <div className="absolute top-2 bottom-4 left-[9px] w-[2px] bg-slate-200 dark:bg-slate-700"></div>

                            {/* Timeline Item 1 */}
                            <div className="flex gap-3 mb-6 relative">
                                <div className="relative z-10 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 border-2 border-white dark:border-[#1a2235] flex items-center justify-center mt-1">
                                    <div className="w-2 h-2 rounded-full bg-app-primary"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Placement Drive: Amazon</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Oct 24 • Online Assessment</p>
                                    <button className="mt-2 text-xs text-app-primary font-medium hover:underline">View details</button>
                                </div>
                            </div>

                            {/* Timeline Item 2 */}
                            <div className="flex gap-3 mb-6 relative">
                                <div className="relative z-10 w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 border-2 border-white dark:border-[#1a2235] flex items-center justify-center mt-1">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">CV Review Workshop</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Friday • 2:00 PM</p>
                                    <div className="flex -space-x-2 mt-2">
                                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1a2235] bg-gray-300 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCtQ5VuYBvFSs-ALqmR-C1lguLIMdSJxLKlAJi7LdVhoYRvJk4a7OXfLN5AzvdGc0j6RNxXCQLqcr3lKC5jJT6-vVH_-P_jYwtEKnerNidGdSpljVep9zpoHfxpzIXFZCrR2V1JA5rgxpAQsAg8yZZQ9Qw2FqQW9nj_-5o1mM3qoN8c36FfvEAXNsJE8wtFTdUCV2zIGcZkh9lMFHhGgNZIblceiEXIpmiVCSGP8ocIX-sQelkEl8VqjCPncW3OgLmn7V8Av1Cn53Y')" }}></div>
                                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1a2235] bg-gray-300 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAjLUc4gRxVkH3-FNg73bUtAtR1SqlrAdtF2KO2vt_ploHgkjYyaoK5IVYFHEHYq4qRK3qv4Hn72ARGIp7XI6BQoGAIjdxRTMa246CVlDkcTQU-CkLD2EgoGxqy8sH0zq3bDLuBejv2kM9xNUsVcoSsqSVoqKlkeeIorS0NzeheFTeEfwCB6iUXud2H_YfZzmeguTs9_7RUcdcZPNXc8VzbXaJ0-1vW3e_v_pQCM9SXE60Miyd6uYz4I8y3cT2idhS6bisetKSVy7Y')" }}></div>
                                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1a2235] bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-600">+12</div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Item 3 */}
                            <div className="flex gap-3 relative">
                                <div className="relative z-10 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/50 border-2 border-white dark:border-[#1a2235] flex items-center justify-center mt-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Profile Update Required</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Update GPA before Oct 30</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mini Stats or Ad */}
                    <div className="bg-gradient-to-br from-app-primary to-blue-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 rounded-full bg-black/10 blur-xl"></div>
                        <div className="relative z-10">
                            <span className="material-symbols-outlined text-3xl mb-2">auto_awesome</span>
                            <h4 className="font-bold text-lg mb-1">ATS Score: 85/100</h4>
                            <p className="text-blue-100 text-sm mb-3">Your SDE Resume is performing well. Keep it up!</p>
                            <Link href="/analyzer" className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-1.5 px-3 rounded transition-colors inline-block">Analyze Again</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
