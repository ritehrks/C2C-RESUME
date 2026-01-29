"use client";

export default function ProfilePage() {
    return (
        <div className="p-4 sm:p-8">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Content Area - Full width without sidebar since generic dashboard nav covers it */}
                    <div className="flex-1 min-w-0">
                        {/* Page Heading */}
                        <div className="mb-6">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Personal Info</h2>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">Manage your personal information and resume details visible to recruiters.</p>
                        </div>

                        {/* Profile Header Card */}
                        <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                <div className="relative group">
                                    <div className="size-24 sm:size-32 rounded-full bg-slate-100 bg-center bg-cover ring-4 ring-white dark:ring-slate-800 shadow-md" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCDQcBKR9dpFQ04NtvgQwK6tDyj3CqRBk5UUN7BFwmvVt097UYz3w4Q7EtIEbgRzk5sgT0REOiWnpixuFfryRxF_Mj-43j5qIfKFOxNFuD1ATpPhzSnQG2gDPmXsw4D-7pNy7nFPHyleokA-YUqOobICsn1_bNprNMEFgFb1PUktNxh5R7TyI0qleJGtVCNz5GXuCzN0vPbYHNOHVDoXGSlZukzQTYmX1gswB1EzgUz3zJeD9XCmNsOFFssTJZrTctkVgcimYU3xbY')" }}></div>
                                    <button aria-label="Edit photo" className="absolute bottom-0 right-0 rounded-full bg-app-primary text-white p-2 shadow-lg hover:bg-blue-700 transition-colors">
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Alex Student</h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">Computer Science • Semester 6</p>
                                            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                                                <span className="size-1.5 rounded-full bg-green-600"></span>
                                                Open to work
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                                Upload New Photo
                                            </button>
                                            <button className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                                <h3 className="text-base font-semibold leading-7 text-slate-900 dark:text-white">Basic Information</h3>
                                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">This information will be displayed on your resume header.</p>
                            </div>
                            <div className="p-6">
                                <form>
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                                        {/* Full Name */}
                                        <div className="sm:col-span-1">
                                            <label htmlFor="full-name" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Full Name</label>
                                            <div className="mt-2">
                                                <input className="block w-full rounded-lg border-0 py-2.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-app-primary bg-background-light dark:bg-slate-800 sm:text-sm sm:leading-6" id="full-name" name="full-name" type="text" defaultValue="Alex Student" />
                                            </div>
                                        </div>
                                        {/* Phone Number */}
                                        <div className="sm:col-span-1">
                                            <label htmlFor="phone" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Phone Number</label>
                                            <div className="mt-2 relative">
                                                <input className="block w-full rounded-lg border-0 py-2.5 pr-10 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-app-primary bg-background-light dark:bg-slate-800 sm:text-sm sm:leading-6" id="phone" name="phone" placeholder="+1 (555) 000-0000" type="tel" />
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* College Email (Locked) */}
                                        <div className="sm:col-span-2">
                                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                                                College Email
                                                <span className="ml-1 text-xs text-slate-400 font-normal">(Linked to University SSO)</span>
                                            </label>
                                            <div className="mt-2 relative rounded-md shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="material-symbols-outlined text-slate-400 text-lg">lock</span>
                                                </div>
                                                <input className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-500 dark:text-slate-400 shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-800 bg-slate-100 dark:bg-slate-900/50 sm:text-sm sm:leading-6 cursor-not-allowed" disabled id="email" name="email" type="email" defaultValue="alex.student@university.edu" />
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <span className="text-xs text-slate-400">Verified</span>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Contact administration to update this email address.</p>
                                        </div>
                                        {/* Social Links Section Header */}
                                        <div className="sm:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Online Presence</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Links to your professional profiles.</p>
                                        </div>
                                        {/* LinkedIn */}
                                        <div className="sm:col-span-2">
                                            <label htmlFor="linkedin" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">LinkedIn Profile</label>
                                            <div className="mt-2 flex rounded-lg shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus-within:ring-2 focus-within:ring-inset focus-within:ring-app-primary bg-background-light dark:bg-slate-800">
                                                <span className="flex select-none items-center pl-3 text-slate-500 dark:text-slate-400 sm:text-sm">linkedin.com/in/</span>
                                                <input className="block flex-1 border-0 bg-transparent py-2.5 pl-1 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6" id="linkedin" name="linkedin" placeholder="username" type="text" />
                                                <div className="flex items-center pr-3 text-slate-400">
                                                    <span className="material-symbols-outlined">link</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* GitHub */}
                                        <div className="sm:col-span-2">
                                            <label htmlFor="github" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">GitHub Profile</label>
                                            <div className="mt-2 flex rounded-lg shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus-within:ring-2 focus-within:ring-inset focus-within:ring-app-primary bg-background-light dark:bg-slate-800">
                                                <span className="flex select-none items-center pl-3 text-slate-500 dark:text-slate-400 sm:text-sm">github.com/</span>
                                                <input className="block flex-1 border-0 bg-transparent py-2.5 pl-1 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6" id="github" name="github" placeholder="username" type="text" />
                                                <div className="flex items-center pr-3 text-slate-400">
                                                    <span className="material-symbols-outlined">code</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Portfolio */}
                                        <div className="sm:col-span-2">
                                            <label htmlFor="website" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Portfolio Website</label>
                                            <div className="mt-2 relative rounded-md shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="material-symbols-outlined text-slate-400 text-lg">language</span>
                                                </div>
                                                <input className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-app-primary bg-background-light dark:bg-slate-800 sm:text-sm sm:leading-6" id="website" name="website" placeholder="https://www.yourportfolio.com" type="url" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Action Bar */}
                                    <div className="flex items-center justify-end gap-x-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 py-4 rounded-b-xl mt-6 -mb-6 -mx-6">
                                        <button className="text-sm font-semibold leading-6 text-slate-900 dark:text-white hover:text-app-primary transition-colors" type="button">Cancel</button>
                                        <button className="rounded-lg bg-app-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-primary transition-colors" type="submit">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
