'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

const Onboarding: React.FC = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col md:flex-row">
            {/* Left / Top: Hero Section */}
            <div className="w-full md:w-1/2 lg:w-3/5 bg-primary/5 dark:bg-surface-dark flex items-center justify-center p-8 md:p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none"></div>
                <div className="max-w-md w-full relative z-10 flex flex-col items-center text-center md:items-start md:text-left">
                    <div className="flex items-center gap-2 mb-8 md:hidden">
                        <span className="material-symbols-outlined text-primary text-4xl">health_and_safety</span>
                        <span className="text-2xl font-bold text-text-light dark:text-text-dark">Medicine Rescue</span>
                    </div>

                    <div className="w-full rounded-2xl overflow-hidden shadow-2xl aspect-square md:aspect-video relative group mb-8 border-4 border-white dark:border-gray-700">
                        <img
                            src="/images/connecting.png"
                            alt="Doctor with tablet"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-text-light dark:text-text-dark mb-4 leading-tight">
                        Connecting Surplus,<br />Saving Lives.
                    </h1>
                    <p className="text-text-muted text-base md:text-lg max-w-sm">
                        The platform for healthcare facilities to redistribute surplus medical supplies to those in need.
                    </p>
                </div>
            </div>

            {/* Right / Bottom: Content & Actions */}
            <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-between p-6 md:p-12 bg-white dark:bg-background-dark">
                <div className="hidden md:flex items-center gap-2 mb-12">
                    <span className="material-symbols-outlined text-primary text-4xl">health_and_safety</span>
                    <span className="text-2xl font-bold text-text-light dark:text-text-dark">Medicine Rescue</span>
                </div>

                <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-background-light dark:bg-surface-dark rounded-xl shadow-sm border border-transparent hover:border-primary/20 transition-all">
                            <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined text-2xl">upload_file</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-text-light dark:text-text-dark">List Your Surplus</h3>
                                <p className="text-sm text-text-muted mt-1">Easily list available supplies for others.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-background-light dark:bg-surface-dark rounded-xl shadow-sm border border-transparent hover:border-accent/20 transition-all">
                            <div className="size-14 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                                <span className="material-symbols-outlined text-2xl">search</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-text-light dark:text-text-dark">Find Supplies Nearby</h3>
                                <p className="text-sm text-text-muted mt-1">Request items from local facilities.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="max-w-md mx-auto flex flex-col gap-3">
                        <button
                            onClick={() => router.push('/auth')}
                            className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5"
                        >
                            Create Account
                        </button>
                        <button
                            onClick={() => router.push('/auth')}
                            className="w-full h-14 text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors border-2 border-transparent hover:border-primary/10"
                        >
                            Log In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;