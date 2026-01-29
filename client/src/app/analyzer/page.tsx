"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function AnalyzerPage() {
    return (
        <div className="bg-app-bg-light dark:bg-app-bg-dark text-[#0d121b] dark:text-white font-display min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7ebf3] dark:border-gray-800 bg-white/95 dark:bg-[#101622]/95 px-6 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" title="Back to Dashboard">
                        <Image src="/logo.png" alt="C2C Logo" width={100} height={36} className="h-9 w-auto" />
                    </Link>
                </div>
                <nav className="hidden md:flex flex-1 justify-center gap-8">
                    <Link className="text-[#4c669a] dark:text-gray-400 hover:text-app-primary dark:hover:text-app-primary transition-colors text-sm font-medium leading-normal" href="/dashboard">Dashboard</Link>
                    <Link className="text-[#4c669a] dark:text-gray-400 hover:text-app-primary dark:hover:text-app-primary transition-colors text-sm font-medium leading-normal" href="/builder">Resume Builder</Link>
                    <span className="text-app-primary text-sm font-bold leading-normal">ATS Analyzer</span>
                </nav>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-[#4c669a] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                    </button>
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border border-gray-200 dark:border-gray-700" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD_MoKaHUPqURBOZ3uDCbeY2dalr51yGhJoxSrpRHprl2IuhiDtkA7u8vdKn7i_rwRqKA4wOVsKI4sAJmCHTbbXoQptG_QBqtPuP6prWQrwjkZFbqSe4I-BqvoYcLJjwDptJi4hM8ewtzm7oYcCbF2cswk-AIzGsEdEGG2dg9efrIWRY6nw6aAn6OMdBFqHU4DOr4wdcu4JCAjTlXpVi9dE7Wd93gHaMEAjCxN34s5RPC-YOOab0XHxP2BQnLzlBVoCJkrHBKPm8LM')" }}></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 py-8">
                <div className="mb-8">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-[#4c669a] dark:text-gray-400 mb-1">
                            <Link href="/dashboard" className="hover:text-app-primary transition-colors">Dashboard</Link>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            <span className="font-medium text-app-primary">ATS Analyzer</span>
                        </div>
                        <h1 className="text-[#0d121b] dark:text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight">ATS Analyzer</h1>
                        <p className="text-[#4c669a] dark:text-gray-400 text-base font-normal max-w-2xl">
                            Optimize your resume for the Applicant Tracking System. Compare your resume against job descriptions to identify gaps and improve your ranking.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Input */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="bg-white dark:bg-[#1e2636] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-700 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-app-primary">description</span>
                                <h3 className="text-[#0d121b] dark:text-white font-bold text-lg">Target Job Description</h3>
                            </div>
                            <label className="flex flex-col w-full">
                                <span className="sr-only">Job Description</span>
                                <textarea className="form-input w-full resize-none rounded-lg text-[#0d121b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-app-primary/20 border border-[#cfd7e7] dark:border-gray-600 bg-[#f8f9fc] dark:bg-[#101622] min-h-[220px] placeholder:text-[#8d9ab3] p-4 text-sm font-normal leading-relaxed transition-all" placeholder="Paste the full job description here (e.g. Responsibilities, Requirements, Skills)..."></textarea>
                            </label>
                        </div>

                        <div className="bg-white dark:bg-[#1e2636] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-700 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-app-primary">upload_file</span>
                                <h3 className="text-[#0d121b] dark:text-white font-bold text-lg">Your Resume</h3>
                            </div>
                            <div className="group relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-[#cfd7e7] dark:border-gray-600 bg-[#f8f9fc] dark:bg-[#101622] hover:bg-[#edf2fa] dark:hover:bg-[#1a202c] transition-colors px-6 py-10 cursor-pointer">
                                <div className="p-3 bg-white dark:bg-[#2d3748] rounded-full shadow-sm">
                                    <span className="material-symbols-outlined text-[#4c669a] dark:text-gray-400 text-3xl">cloud_upload</span>
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-[#0d121b] dark:text-white text-base font-semibold">Click to upload or drag and drop</p>
                                    <p className="text-[#4c669a] dark:text-gray-400 text-xs">PDF, DOCX up to 10MB</p>
                                </div>
                                <input className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" type="file" />
                            </div>
                            <div className="hidden mt-4 flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">picture_as_pdf</span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Senior_Dev_Resume.pdf</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">1.2 MB</p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-red-500 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="flex-1 flex items-center justify-center gap-2 rounded-xl h-14 bg-white hover:bg-gray-50 dark:bg-[#1e2636] dark:hover:bg-[#2a3449] border border-[#cfd7e7] dark:border-gray-600 text-app-primary dark:text-blue-400 text-lg font-bold shadow-sm transition-colors">
                                <span className="material-symbols-outlined">analytics</span>
                                Simple Analysis
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 rounded-xl h-14 bg-app-primary hover:bg-app-primary/90 transition-colors text-white text-lg font-bold shadow-lg shadow-app-primary/20">
                                <span className="material-symbols-outlined">network_intelligence</span>
                                Deep Analysis
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <div className="bg-white dark:bg-[#1e2636] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-700 p-6 md:p-8">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="relative size-48 flex-shrink-0">
                                    <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                        <path className="text-gray-100 dark:text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeWidth="3"></path>
                                        <path className="text-app-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="85, 100" strokeLinecap="round" strokeWidth="3"></path>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-bold text-[#0d121b] dark:text-white">85%</span>
                                        <span className="text-sm font-medium text-[#4c669a] dark:text-gray-400 uppercase tracking-wide">Match</span>
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-2xl font-bold text-[#0d121b] dark:text-white">Good Match</h2>
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold uppercase tracking-wide">High Potential</span>
                                    </div>
                                    <p className="text-[#4c669a] dark:text-gray-400 leading-relaxed mb-4">
                                        Your resume aligns well with the job description. You have most of the critical hard skills, but there are a few keyword gaps that could improve your visibility to ATS algorithms.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#f8f9fc] dark:bg-[#101622] rounded-lg p-3 border border-[#e7ebf3] dark:border-gray-800">
                                            <p className="text-xs text-[#4c669a] dark:text-gray-400 mb-1">Hard Skills</p>
                                            <p className="text-lg font-bold text-[#0d121b] dark:text-white">18/22</p>
                                        </div>
                                        <div className="bg-[#f8f9fc] dark:bg-[#101622] rounded-lg p-3 border border-[#e7ebf3] dark:border-gray-800">
                                            <p className="text-xs text-[#4c669a] dark:text-gray-400 mb-1">Action Verbs</p>
                                            <p className="text-lg font-bold text-[#0d121b] dark:text-white">Strong</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-[#1e2636] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[#0d121b] dark:text-white font-bold text-lg flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-500">warning</span>
                                        Missing Keywords
                                    </h3>
                                    <span className="text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded">Critical</span>
                                </div>
                                <p className="text-sm text-[#4c669a] dark:text-gray-400 mb-4">These skills appear frequently in the job description but are missing from your resume.</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-100 dark:border-red-900/50 rounded-full text-sm font-medium flex items-center gap-1">
                                        Docker
                                        <span className="material-symbols-outlined text-[14px]">add_circle</span>
                                    </span>
                                    <span className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-100 dark:border-red-900/50 rounded-full text-sm font-medium flex items-center gap-1">
                                        Redis
                                        <span className="material-symbols-outlined text-[14px]">add_circle</span>
                                    </span>
                                    <span className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-100 dark:border-red-900/50 rounded-full text-sm font-medium flex items-center gap-1">
                                        Kubernetes
                                        <span className="material-symbols-outlined text-[14px]">add_circle</span>
                                    </span>
                                    <span className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-100 dark:border-red-900/50 rounded-full text-sm font-medium flex items-center gap-1">
                                        gRPC
                                        <span className="material-symbols-outlined text-[14px]">add_circle</span>
                                    </span>
                                </div>
                                <div className="mt-6 pt-4 border-t border-[#e7ebf3] dark:border-gray-700">
                                    <h4 className="text-sm font-semibold text-[#0d121b] dark:text-white mb-3">Matched Skills</h4>
                                    <div className="flex flex-wrap gap-2 opacity-75">
                                        <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 rounded-md text-xs font-medium">React</span>
                                        <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 rounded-md text-xs font-medium">TypeScript</span>
                                        <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 rounded-md text-xs font-medium">Node.js</span>
                                        <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 rounded-md text-xs font-medium">AWS</span>
                                        <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 rounded-md text-xs font-medium">PostgreSQL</span>
                                        <span className="text-xs text-gray-400 flex items-center px-1">+13 more</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="bg-white dark:bg-[#1e2636] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-700 p-6 flex-1">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="material-symbols-outlined text-app-primary">psychology</span>
                                        <h3 className="text-[#0d121b] dark:text-white font-bold text-lg">Impact & Tone</h3>
                                    </div>
                                    <p className="text-sm text-[#4c669a] dark:text-gray-400 mb-4">Replace weak passive verbs with strong action-oriented language.</p>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                            <span className="material-symbols-outlined text-red-500 text-[20px] mt-0.5">remove_circle</span>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-red-700 dark:text-red-300">Weak: &quot;Helped with...&quot;</p>
                                                <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">Vague and passive.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <span className="material-symbols-outlined text-gray-400">arrow_downward</span>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                            <span className="material-symbols-outlined text-green-600 text-[20px] mt-0.5">check_circle</span>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-green-800 dark:text-green-300">Strong: &quot;Spearheaded...&quot;</p>
                                                <p className="text-xs text-green-700/70 dark:text-green-400/70 mt-1">Shows leadership and direct impact.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-[#1152d4] to-[#0a3690] rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                            <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined">auto_fix_high</span>
                                    <h3 className="font-bold text-lg">Quick Wins</h3>
                                </div>
                                <ul className="space-y-2 text-sm md:text-base text-blue-100">
                                    <li className="flex items-start gap-2">
                                        <span className="block size-1.5 mt-2 rounded-full bg-blue-300"></span>
                                        <span>Add a &quot;Technical Skills&quot; section near the top of your resume.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="block size-1.5 mt-2 rounded-full bg-blue-300"></span>
                                        <span>Quantify your achievements (e.g., &quot;reduced latency by 20%&quot;).</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
