'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Auth: React.FC = () => {
  const router = useRouter();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'signup' ? '/auth/signup' : '/auth/login';
      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        setError('Invalid response from server. Make sure the backend is running.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      // Save JWT and user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('fetch')) {
        setError('Cannot connect to server. Make sure the backend is running on port 4000.');
      } else {
        setError('Server error: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
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
          <p className="text-sm text-text-muted mt-2 text-center">
            Share and receive medical supplies
          </p>
        </div>

        {/* Toggle */}
        <div className="bg-gray-100 dark:bg-background-dark p-1 rounded-xl flex mb-6">
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'signup' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500'
            }`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'login' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500'
            }`}
            onClick={() => setMode('login')}
          >
            Log In
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div>
            <label className="block text-sm font-bold text-text-light dark:text-text-dark mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-background-dark focus:ring-2 focus:ring-primary focus:outline-none dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text-light dark:text-text-dark mb-2">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-background-dark focus:ring-2 focus:ring-primary focus:outline-none dark:text-white"
              />
              <span className="material-symbols-outlined absolute right-4 top-3 text-gray-400 cursor-pointer">visibility</span>
            </div>
          </div>

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 mt-4 transition-transform active:scale-95"
          >
            {loading ? 'Processing...' : mode === 'signup' ? 'Create Account' : 'Log In'}
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