'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

const RouteETA: React.FC = () => {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark relative max-w-md mx-auto">
      {/* Map Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBAuF_QnBy8g96UyFEIn9efvE58sHxYpMEbiGHCzdAPYCqO86z-7brwTgjgCc2B8jysYdD6JTllXFtCefCfJlmkX0ixH9CUHk7QY00voAmFsP3Ons0wL9cV9UR55Z2pGQOjDO-UdK9ODq7sq4Xl0FLyWwHMS_XOGi6Lvp49YTCXQDai5fqTWBdogjbKGAj-9L0dqg99Vp6e7Icc_ff9gKAHwi6qJIw6VxfVU9y6z9u_NnXeSZl_AoSRnAlXaU0p421q9hh2I36dJwLm')` }}
      ></div>

      {/* Top Search Bar */}
      <div className="relative z-10 px-4 pt-4">
        <div className="flex bg-white dark:bg-surface-dark rounded-xl shadow-lg h-12 items-center px-4">
            <button onClick={() => router.back()} className="mr-2">
                <span className="material-symbols-outlined text-gray-500">arrow_back</span>
            </button>
            <input className="flex-1 bg-transparent outline-none dark:text-white" placeholder="Search for supplies..." />
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark rounded-t-3xl shadow-2xl p-6 pb-8 z-20">
         <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
         
         <h2 className="text-3xl font-bold text-text-light dark:text-text-dark mb-4">ETA: 45 minutes</h2>
         
         {/* Progress Bar */}
         <div className="flex gap-1 mb-2">
            <div className="h-1.5 flex-1 bg-primary rounded-full"></div>
            <div className="h-1.5 flex-1 bg-primary rounded-full"></div>
            <div className="h-1.5 flex-1 bg-primary rounded-full"></div>
            <div className="h-1.5 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
         </div>
         <div className="flex justify-between text-xs font-bold text-primary mb-6">
            <span>Surplus</span>
            <span>Matching</span>
            <span>Map View</span>
            <span className="text-gray-400">Route</span>
         </div>

         {/* Item Details */}
         <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center gap-4">
                <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">medical_services</span>
                </div>
                <div>
                    <h3 className="font-bold text-text-light dark:text-text-dark">Surgical Masks (N95)</h3>
                    <p className="text-sm text-text-muted">500 units | General Hospital</p>
                </div>
            </div>
            <button className="size-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined">chevron_right</span>
            </button>
         </div>
      </div>

      {/* FAB */}
      <div className="absolute bottom-[240px] right-4 z-20">
         <button className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full shadow-xl font-bold">
            <span className="material-symbols-outlined">list_alt</span>
            View List
         </button>
      </div>
    </div>
  );
};

export default RouteETA;