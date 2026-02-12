"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-tech-pattern text-text-main dark:text-white transition-colors duration-200 selection:bg-royal-600 selection:text-white">
      {/* Header */}
      <header className="w-full border-b border-border-light dark:border-white/10 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 lg:h-20 flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            <img src="/logo-v2.png" alt="C2C Logo" className="h-9 sm:h-11 lg:h-14 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <Link href="/dashboard" className="flex items-center gap-1.5 px-3 lg:px-4 h-9 lg:h-10 rounded-lg text-navy-900 hover:text-royal-600 text-sm font-semibold transition-colors">
              Dashboard
            </Link>
            <Link href="/analyzer" className="flex items-center gap-1.5 px-3 lg:px-4 h-9 lg:h-10 rounded-lg text-navy-900 hover:text-royal-600 text-sm font-semibold transition-colors">
              ATS Analyzer
            </Link>
            <Link href="/courses" className="flex items-center gap-1.5 px-3 lg:px-4 h-9 lg:h-10 rounded-lg text-navy-900 hover:text-royal-600 text-sm font-semibold transition-colors">
              Courses
            </Link>
            <Link href="/profile" className="flex items-center justify-center size-9 lg:size-10 rounded-lg text-navy-900 hover:text-royal-600 hover:bg-slate-100 transition-colors" title="Profile">
              <span className="material-symbols-outlined text-xl">account_circle</span>
            </Link>
            <Link href="/builder" className="flex items-center gap-2 px-5 lg:px-6 h-9 lg:h-10 rounded-lg bg-royal-600 hover:bg-royal-500 text-white shadow-md shadow-royal-600/20 text-sm font-semibold transition-all duration-200 transform hover:-translate-y-0.5">
              <span className="material-symbols-outlined text-lg">school</span>
              <span>Enter Workspace</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-navy-900 dark:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined text-xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl p-3 flex flex-col gap-1 md:hidden">
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-navy-900 dark:text-white text-sm font-medium transition-colors active:scale-[0.98]" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-royal-600 text-lg">dashboard</span>
                Dashboard
              </Link>
              <Link href="/analyzer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-navy-900 dark:text-white text-sm font-medium transition-colors active:scale-[0.98]" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-royal-600 text-lg">analytics</span>
                ATS Analyzer
              </Link>
              <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-navy-900 dark:text-white text-sm font-medium transition-colors active:scale-[0.98]" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-royal-600 text-lg">person</span>
                Profile
              </Link>
              <Link href="/courses" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-navy-900 dark:text-white text-sm font-medium transition-colors active:scale-[0.98]" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-royal-600 text-lg">school</span>
                Courses
              </Link>
              <Link href="/attendance" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-navy-900 dark:text-white text-sm font-medium transition-colors active:scale-[0.98]" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-royal-600 text-lg">event_available</span>
                My Attendance
              </Link>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
              <Link href="/builder" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-royal-600 text-white text-sm font-bold shadow-md shadow-royal-600/20 active:scale-95 transition-transform" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-lg">school</span>
                Enter Workspace
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col justify-center relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-8 sm:py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-5 sm:gap-8 max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              <div className="flex flex-col gap-3 sm:gap-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-navy-800 dark:text-blue-300 border border-slate-200 dark:border-slate-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider w-fit mx-auto lg:mx-0">
                  <span className="material-symbols-outlined text-xs sm:text-sm filled">verified</span>
                  <span>Official Format</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-navy-900 dark:text-white leading-[1.1] tracking-tight">
                  Craft Your Official <br className="hidden lg:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy-800 to-royal-600 dark:from-blue-400 dark:to-blue-200">C2C Resume</span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-text-sub dark:text-slate-400 font-normal leading-relaxed max-w-lg mx-auto lg:mx-0">
                  The definitive LaTeX-based platform for students. Create ATS-compliant resumes with academic precision in seconds.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 sm:gap-4 justify-center lg:justify-start">
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link href="/builder?template=mnit" className="group flex items-center justify-center gap-2 h-12 sm:h-14 px-6 sm:px-8 rounded-xl bg-app-primary hover:bg-blue-700 text-white text-sm sm:text-base font-bold shadow-lg shadow-app-primary/20 transition-all duration-200 active:scale-95 sm:hover:-translate-y-0.5">
                    <span className="material-symbols-outlined group-hover:animate-pulse text-lg">school</span>
                    <span>MNIT Official</span>
                  </Link>
                  <Link href="/builder?template=generic" className="group flex items-center justify-center gap-2 h-12 sm:h-14 px-6 sm:px-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base font-bold shadow-lg shadow-blue-500/20 transition-all duration-200 active:scale-95 sm:hover:-translate-y-0.5">
                    <span className="material-symbols-outlined group-hover:animate-pulse text-lg">description</span>
                    <span>Generic ATS</span>
                  </Link>
                </div>
                <Link href="/analyzer" className="group flex items-center justify-center gap-2 h-11 sm:h-12 px-6 sm:px-8 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-royal-600 text-navy-900 dark:text-white text-sm sm:text-base font-bold transition-all duration-200 active:scale-95 sm:hover:-translate-y-0.5 hover:shadow-md sm:w-fit sm:mx-auto lg:mx-0">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-royal-600 transition-colors text-lg">upload_file</span>
                  <span>Analyze Existing Resume</span>
                </Link>
                <div className="flex gap-2.5 sm:gap-3 justify-center lg:justify-start">
                  <Link href="/attendance" className="group flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-12 px-4 sm:px-6 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-green-500 text-navy-900 dark:text-white text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 sm:hover:-translate-y-0.5 hover:shadow-md flex-1 sm:flex-none">
                    <span className="material-symbols-outlined text-green-500 group-hover:text-green-600 transition-colors text-base sm:text-lg">event_available</span>
                    <span>Attendance</span>
                  </Link>
                  <Link href="/courses" className="group flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-12 px-4 sm:px-6 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-500 text-navy-900 dark:text-white text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 sm:hover:-translate-y-0.5 hover:shadow-md flex-1 sm:flex-none">
                    <span className="material-symbols-outlined text-purple-500 group-hover:text-purple-600 transition-colors text-base sm:text-lg">school</span>
                    <span>Courses</span>
                  </Link>
                </div>
              </div>

              {/* Powered by */}
              <div className="flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2 pt-1 sm:pt-2">
                <span className="text-[9px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Powered by</span>
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-navy-800 dark:text-blue-400 text-xs sm:text-base">account_balance</span>
                  <span className="text-[10px] sm:text-sm font-bold text-navy-900 dark:text-slate-200">MNIT Jaipur</span>
                </div>
              </div>

              {/* Feature badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 sm:gap-x-6 gap-y-1.5 sm:gap-y-2 text-xs sm:text-sm text-text-sub dark:text-slate-500 pt-1 sm:pt-2">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="material-symbols-outlined text-royal-600 text-base sm:text-lg">check_circle</span>
                  <span className="font-medium">ATS Optimized</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="material-symbols-outlined text-royal-600 text-base sm:text-lg">check_circle</span>
                  <span className="font-medium">LaTeX Engine</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="material-symbols-outlined text-royal-600 text-base sm:text-lg">check_circle</span>
                  <span className="font-medium">Instant PDF</span>
                </div>
              </div>
            </div>

            {/* Right Graphic - hidden on very small screens */}
            <div className="relative w-full aspect-[4/3] lg:aspect-square flex items-center justify-center lg:justify-end hidden sm:flex">
              <div className="absolute inset-0 bg-gradient-to-tr from-royal-600/10 to-transparent rounded-full blur-3xl transform scale-75 opacity-70 dark:opacity-40 translate-x-10 -translate-y-10"></div>
              <div className="relative w-full max-w-md lg:max-w-full h-auto rounded-2xl overflow-hidden shadow-2xl shadow-navy-900/10 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-2">
                <div className="h-7 sm:h-8 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-white/5 flex items-center px-3 sm:px-4 gap-1.5 sm:gap-2 mb-1 rounded-t-lg">
                  <div className="size-2.5 sm:size-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  <div className="size-2.5 sm:size-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  <div className="size-2.5 sm:size-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                </div>
                <div className="relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 aspect-[3/4] sm:aspect-video lg:aspect-[4/3] group">
                  <div className="absolute inset-0 bg-cover bg-center grayscale-[0.2]" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAB6u2bPLf2hxUeqQYV1D7gr3Gt6hfmBdYJXM2VqCRCV1ioEWzblZEfLb2Aaxk9ij_wnRWADNG-at9nhBj4D2fuNHKcOTiIOuav8MlBUFh_pxwKld7u_0e1FOnDKoF2FY-Y4kWCll3T8rWeK0StD47U8qWCI5tZIww5QrUbldU98d0GZMjGwbQvhRP_WiGr3OlTwzbcCO5FAko3ITIcCrAJA-Olxx4fHj5Cfn8xm438uqc2xyAQqGp6gxUVWRCZhgXOTS7dpUJywV8')" }}></div>
                  <div className="absolute inset-0 bg-navy-900/5 mix-blend-multiply"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent flex flex-col justify-end p-4 sm:p-6 md:p-8">
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-lg border border-white/20 transform translate-y-2 transition-transform duration-500 hover:translate-y-0">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="size-6 sm:size-8 rounded-full bg-blue-100 text-royal-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xs sm:text-sm font-bold">score</span>
                          </div>
                          <div>
                            <p className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">ATS Score</p>
                            <p className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white">98/100 Excellent</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-emerald-500 text-lg sm:text-2xl">check_circle</span>
                      </div>
                      <div className="h-1 sm:h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-royal-600 w-[98%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-10 -left-4 lg:-left-12 bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-xl shadow-xl shadow-navy-900/5 border border-slate-100 dark:border-white/10 max-w-[160px] sm:max-w-[200px] hidden md:block animate-bounce" style={{ animationDuration: '4s' }}>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="size-8 sm:size-10 rounded-lg bg-royal-600/10 flex items-center justify-center text-royal-600 shrink-0">
                    <span className="material-symbols-outlined text-sm sm:text-base">code</span>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-navy-900 dark:text-white mb-0.5 sm:mb-1">LaTeX Compiled</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Document rendered in 0.4s</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-5 sm:py-8 mt-auto bg-white dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-xs sm:text-sm">
          <div className="flex flex-col md:flex-row items-center gap-1 sm:gap-2 md:gap-4 text-slate-500 dark:text-slate-400 font-medium">
            <span>© 2024 C2C Resume Builder.</span>
            <span className="hidden md:inline text-slate-300">•</span>
            <span>MNIT Jaipur</span>
          </div>
          <div className="flex items-center gap-6 sm:gap-8">
            <a href="#" className="text-slate-500 hover:text-royal-600 dark:text-slate-400 dark:hover:text-white transition-colors">Support</a>
            <a href="#" className="text-slate-500 hover:text-royal-600 dark:text-slate-400 dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-slate-500 hover:text-royal-600 dark:text-slate-400 dark:hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
