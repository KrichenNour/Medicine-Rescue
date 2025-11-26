'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Auth: React.FC = () => {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'login'>('signin');
  const [role, setRole] = useState<'Donor' | 'Recipient'>('Donor');

  const handleAuth = () => {
    // Simulate auth
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-4 rounded-2xl mb-4">
             <span className="material-symbols-outlined text-primary text-5xl">medical_services</span>
          </div>
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">MedSurplus Connect</h1>
        </div>

        {/* Toggle */}
        <div className="bg-gray-100 dark:bg-background-dark p-1 rounded-xl flex mb-6">
          <button 
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'signin' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500'}`}
            onClick={() => setMode('signin')}
          >
            Sign Up
          </button>
           <button 
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'login' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500'}`}
            onClick={() => setMode('login')}
          >
            Log In
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-text-light dark:text-text-dark mb-2">Email Address</label>
            <input type="email" placeholder="Enter your email" className="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-background-dark focus:ring-2 focus:ring-primary focus:outline-none dark:text-white" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-text-light dark:text-text-dark mb-2">Password</label>
            <div className="relative">
                <input type="password" placeholder="Enter your password" className="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-background-dark focus:ring-2 focus:ring-primary focus:outline-none dark:text-white" />
                <span className="material-symbols-outlined absolute right-4 top-3 text-gray-400 cursor-pointer">visibility</span>
            </div>
          </div>

          {mode === 'signin' && (
             <div>
                <label className="block text-sm font-bold text-text-light dark:text-text-dark mb-2">I am a:</label>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setRole('Donor')}
                        className={`flex-1 h-10 rounded-lg border-2 text-sm font-bold transition-colors ${role === 'Donor' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                    >
                        Donor
                    </button>
                     <button 
                        onClick={() => setRole('Recipient')}
                        className={`flex-1 h-10 rounded-lg border-2 text-sm font-bold transition-colors ${role === 'Recipient' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                    >
                        Recipient
                    </button>
                </div>
             </div>
          )}

          <button 
            onClick={handleAuth}
            className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 mt-4 transition-transform active:scale-95"
          >
            {mode === 'signin' ? 'Create Account' : 'Log In'}
          </button>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
            By continuing, you agree to our Terms of Service & Privacy Policy.
        </p>

      </div>
    </div>
  );
};

export default Auth;