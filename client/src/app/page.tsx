import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-tech-pattern text-text-main dark:text-white transition-colors duration-200 selection:bg-royal-600 selection:text-white">
      {/* Header */}
      <header className="w-full border-b border-border-light dark:border-white/10 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="C2C Logo" width={120} height={40} className="h-10 w-auto" priority />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/analyzer" className="hidden sm:flex items-center gap-2 px-6 h-10 rounded-lg text-navy-900 hover:text-royal-600 font-semibold transition-colors">
              ATS Analyzer
            </Link>
            <Link href="/builder" className="hidden sm:flex items-center gap-2 px-6 h-10 rounded-lg bg-royal-600 hover:bg-royal-500 text-white shadow-md shadow-royal-600/20 text-sm font-semibold transition-all duration-200 transform hover:-translate-y-0.5">
              <span className="material-symbols-outlined text-lg">school</span>
              <span>Enter Workspace</span>
            </Link>
          </div>
          <button className="sm:hidden p-2 text-navy-900 dark:text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col justify-center relative">
        <div className="max-w-7xl mx-auto px-6 w-full py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-8 max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              <div className="flex flex-col gap-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-navy-800 dark:text-blue-300 border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider w-fit mx-auto lg:mx-0">
                  <span className="material-symbols-outlined text-sm filled">verified</span>
                  <span>Official Format</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-900 dark:text-white leading-[1.1] tracking-tight">
                  Craft Your Official <br className="hidden lg:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy-800 to-royal-600 dark:from-blue-400 dark:to-blue-200">C2C Resume</span>
                </h1>
                <p className="text-lg text-text-sub dark:text-slate-400 font-normal leading-relaxed max-w-lg mx-auto lg:mx-0">
                  The definitive LaTeX-based platform for students. Create ATS-compliant resumes with academic precision in seconds.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/builder" className="group flex items-center justify-center gap-2 h-14 px-8 rounded-lg bg-navy-800 hover:bg-navy-900 text-white text-base font-bold shadow-lg shadow-navy-900/20 transition-all duration-200 transform hover:-translate-y-0.5">
                  <span className="material-symbols-outlined group-hover:animate-pulse">add_circle</span>
                  <span>Create New</span>
                </Link>
                <Link href="/analyzer" className="group flex items-center justify-center gap-2 h-14 px-8 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-royal-600 text-navy-900 dark:text-white text-base font-bold transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-royal-600 transition-colors">upload_file</span>
                  <span>Analyze Existing</span>
                </Link>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 pt-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Powered by</span>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-navy-800 dark:text-blue-400 text-base">account_balance</span>
                  <span className="text-sm font-bold text-navy-900 dark:text-slate-200">MNIT Jaipur Placement Cell</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-text-sub dark:text-slate-500 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-royal-600 text-lg">check_circle</span>
                  <span className="font-medium">ATS Optimized</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-royal-600 text-lg">check_circle</span>
                  <span className="font-medium">LaTeX Engine</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-royal-600 text-lg">check_circle</span>
                  <span className="font-medium">Instant PDF</span>
                </div>
              </div>
            </div>

            {/* Right Graphic */}
            <div className="relative w-full aspect-[4/3] lg:aspect-square flex items-center justify-center lg:justify-end">
              <div className="absolute inset-0 bg-gradient-to-tr from-royal-600/10 to-transparent rounded-full blur-3xl transform scale-75 opacity-70 dark:opacity-40 translate-x-10 -translate-y-10"></div>
              <div className="relative w-full max-w-md lg:max-w-full h-auto rounded-2xl overflow-hidden shadow-2xl shadow-navy-900/10 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-2">
                <div className="h-8 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-white/5 flex items-center px-4 gap-2 mb-1 rounded-t-lg">
                  <div className="size-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  <div className="size-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  <div className="size-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                </div>
                <div className="relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 aspect-[3/4] sm:aspect-video lg:aspect-[4/3] group">
                  <div className="absolute inset-0 bg-cover bg-center grayscale-[0.2]" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAB6u2bPLf2hxUeqQYV1D7gr3Gt6hfmBdYJXM2VqCRCV1ioEWzblZEfLb2Aaxk9ij_wnRWADNG-at9nhBj4D2fuNHKcOTiIOuav8MlBUFh_pxwKld7u_0e1FOnDKoF2FY-Y4kWCll3T8rWeK0StD47U8qWCI5tZIww5QrUbldU98d0GZMjGwbQvhRP_WiGr3OlTwzbcCO5FAko3ITIcCrAJA-Olxx4fHj5Cfn8xm438uqc2xyAQqGp6gxUVWRCZhgXOTS7dpUJywV8')" }}></div>
                  <div className="absolute inset-0 bg-navy-900/5 mix-blend-multiply"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent flex flex-col justify-end p-6 md:p-8">
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20 transform translate-y-2 transition-transform duration-500 hover:translate-y-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-blue-100 text-royal-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm font-bold">score</span>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">ATS Score</p>
                            <p className="text-sm font-bold text-navy-900 dark:text-white">98/100 Excellent</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-royal-600 w-[98%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-10 -left-4 lg:-left-12 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl shadow-navy-900/5 border border-slate-100 dark:border-white/10 max-w-[200px] hidden sm:block animate-bounce" style={{ animationDuration: '4s' }}>
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-royal-600/10 flex items-center justify-center text-royal-600 shrink-0">
                    <span className="material-symbols-outlined">code</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy-900 dark:text-white mb-1">LaTeX Compiled</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Document successfully rendered in 0.4s</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-8 mt-auto bg-white dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-slate-500 dark:text-slate-400 font-medium">
            <span>© 2024 C2C Resume Builder.</span>
            <span className="hidden md:inline text-slate-300">•</span>
            <span>MNIT Jaipur</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-slate-500 hover:text-royal-600 dark:text-slate-400 dark:hover:text-white transition-colors">Support</a>
            <a href="#" className="text-slate-500 hover:text-royal-600 dark:text-slate-400 dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-500 hover:text-royal-600 dark:text-slate-400 dark:hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
