'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

const Settings: React.FC = () => {
    const router = useRouter();

    const handleLogout = () => {
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-8">
            {/* Header */}
            <header className="sticky top-0 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 p-4 md:p-6 flex items-center gap-4 z-10 max-w-4xl mx-auto w-full">
                <button onClick={() => router.back()} className="-ml-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold">Settings</h1>
            </header>

            <div className="max-w-4xl mx-auto w-full">
                {/* Profile Card */}
                <div className="p-4 md:p-6 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="size-16 md:size-20 rounded-full bg-cover bg-center shadow-md" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCdhSLtvGED4tGTzarw979xvvY7dH8C1Eq-WNb327x9NF8kZ_vaSb0Gdy5A5lxuw5HtcuX6zc9YI1QkNSg7WKl-juHp64etGk0P0huwmuYmSFxRUiYzxO403WtSXTSiDIUOo_PPKs8ZJnREvtbEOrpqxnYO75J9WXXGItg565qo-Kz6mcQk1Yzkt068yhzlz5vPweHgtHS_bLKimjEfR85P0BGD_orQywmF4-djGEg7gpC_LkyWz0yu3h5LVAkf7lkEmxj9XYEuJoVd')` }}></div>
                    <div>
                        <h2 className="text-xl font-bold text-text-light dark:text-text-dark">John Doe</h2>
                        <p className="text-sm text-text-muted">john.doe@medicalsurplus.org</p>
                    </div>
                </div>

                <div className="p-4 md:p-6 space-y-6">
                    {/* Account Section */}
                    <section>
                        <h3 className="font-bold text-lg mb-2 text-text-light dark:text-text-dark">Account</h3>
                        <div className="space-y-1">
                            {[
                                { label: 'Edit Profile', icon: 'person' },
                                { label: 'Change Password', icon: 'lock' }
                            ].map(item => (
                                <button key={item.label} className="w-full flex items-center justify-between p-3 hover:bg-white dark:hover:bg-surface-dark rounded-xl transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-lg bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-text-light dark:text-white">
                                            <span className="material-symbols-outlined">{item.icon}</span>
                                        </div>
                                        <span className="font-medium text-text-light dark:text-text-dark">{item.label}</span>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Notifications */}
                    <section>
                        <h3 className="font-bold text-lg mb-2 text-text-light dark:text-text-dark">Notifications</h3>
                        <div className="space-y-1">
                            {[
                                { label: 'New Supply Alerts', icon: 'notifications', checked: true },
                                { label: 'Request Updates', icon: 'receipt_long', checked: true },
                                { label: 'Promotional Updates', icon: 'campaign', checked: false }
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between p-3 hover:bg-white dark:hover:bg-surface-dark rounded-xl transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-lg bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-text-light dark:text-white">
                                            <span className="material-symbols-outlined">{item.icon}</span>
                                        </div>
                                        <span className="font-medium text-text-light dark:text-text-dark">{item.label}</span>
                                    </div>
                                    <div className={`w-12 h-7 rounded-full p-1 transition-colors ${item.checked ? 'bg-primary justify-end' : 'bg-gray-200 dark:bg-gray-700 justify-start'} flex items-center cursor-pointer`}>
                                        <div className={`size-5 bg-white rounded-full shadow-sm transition-transform ${item.checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* General */}
                    <section>
                        <h3 className="font-bold text-lg mb-2 text-text-light dark:text-text-dark">General</h3>
                        <div className="space-y-1">
                            {[
                                { label: 'Help & Support', icon: 'help' },
                                { label: 'Privacy Policy', icon: 'policy' },
                                { label: 'Terms of Service', icon: 'gavel' }
                            ].map(item => (
                                <button key={item.label} className="w-full flex items-center justify-between p-3 hover:bg-white dark:hover:bg-surface-dark rounded-xl transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-lg bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-text-light dark:text-white">
                                            <span className="material-symbols-outlined">{item.icon}</span>
                                        </div>
                                        <span className="font-medium text-text-light dark:text-text-dark">{item.label}</span>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="pt-4 pb-8 space-y-3">
                        <button
                            onClick={handleLogout}
                            className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-dark transition-colors"
                        >
                            Log Out
                        </button>
                        <button className="w-full h-12 text-red-500 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;