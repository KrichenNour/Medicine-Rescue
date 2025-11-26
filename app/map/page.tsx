'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

const SupplyMap: React.FC = () => {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      {/* Top Bar Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-6 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
            <button 
                onClick={() => router.back()}
                className="bg-white/90 dark:bg-surface-dark/90 backdrop-blur p-2 rounded-full shadow-lg"
            >
                <span className="material-symbols-outlined text-text-light dark:text-text-dark">arrow_back</span>
            </button>
            <div className="bg-white/90 dark:bg-surface-dark/90 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary">search</span>
                 <input type="text" placeholder="Search area..." className="bg-transparent outline-none text-sm w-32 dark:text-white" />
            </div>
            <button className="bg-white/90 dark:bg-surface-dark/90 backdrop-blur p-2 rounded-full shadow-lg">
                <span className="material-symbols-outlined text-text-light dark:text-text-dark">layers</span>
            </button>
        </div>
      </div>

      {/* Map Implementation (Mock using Image) */}
      <div className="flex-1 relative overflow-hidden bg-gray-200">
        <div 
            className="absolute inset-0 bg-cover bg-center grayscale-[30%] contrast-125"
            style={{ 
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCXmZAYA-MXNOSQ3lALUcUFjGHnhELOwoL41N2R5UHDFvySRX7Mj-6IhCw5eo55wsnQS40wqQQTUh0_rNO3ap9hrjl4MrAaZbF3wqhsA9f-0aCK2Y16VV8FfW_ieL_A3GXB-q5neJiJSVo3y3RtSewpY_8JBIyVf6hZ7v_dS1mLThBSat6XIu6ZGGWYmUP9G_-qfxt4w2glblWvcD67tBOS_UyXgxUo1gfzzuxYXgQARs6R-1cve_SR6awSb5LJat1GkUFc9If0Iv1S')` 
            }}
        >
        </div>

        {/* Radar/Radius Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 rounded-full border-2 border-primary/50 bg-primary/10 animate-pulse"></div>

        {/* User Location */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="bg-blue-500 text-white p-2 rounded-full shadow-xl border-2 border-white">
                <span className="material-symbols-outlined text-xl">home_pin</span>
            </div>
        </div>

        {/* Pins */}
        <div className="absolute top-[40%] left-[60%] flex flex-col items-center cursor-pointer hover:scale-110 transition-transform" onClick={() => router.push('/dashboard')}>
            <div className="bg-primary text-white p-2 rounded-full shadow-xl border-2 border-white">
                <span className="material-symbols-outlined text-xl">medical_services</span>
            </div>
            <span className="bg-white dark:bg-surface-dark text-[10px] font-bold px-2 py-0.5 rounded shadow mt-1">N95 Masks</span>
        </div>

        <div className="absolute top-[60%] left-[30%] flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
             <div className="bg-primary text-white p-2 rounded-full shadow-xl border-2 border-white">
                <span className="material-symbols-outlined text-xl">medication</span>
            </div>
        </div>

        {/* Map Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <button className="bg-white dark:bg-surface-dark p-2 rounded-lg shadow-xl text-text-light dark:text-text-dark">
                <span className="material-symbols-outlined">add</span>
            </button>
            <button className="bg-white dark:bg-surface-dark p-2 rounded-lg shadow-xl text-text-light dark:text-text-dark">
                <span className="material-symbols-outlined">remove</span>
            </button>
            <button className="bg-white dark:bg-surface-dark p-2 rounded-lg shadow-xl text-text-light dark:text-text-dark mt-2">
                <span className="material-symbols-outlined">my_location</span>
            </button>
        </div>
      </div>

      {/* Bottom Sheet Summary */}
      <div className="bg-white dark:bg-surface-dark rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-4 pb-8 z-10 -mt-6 relative">
         <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
         <h3 className="font-bold text-lg mb-2">Nearby Supplies (50km)</h3>
         <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-background-dark/50 rounded-xl">
                 <div className="size-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="material-symbols-outlined">masks</span>
                 </div>
                 <div className="flex-1">
                    <h4 className="font-bold text-sm">N95 Masks</h4>
                    <p className="text-xs text-text-muted">City General Hospital • 5 Boxes</p>
                 </div>
                 <span className="text-xs font-bold text-text-muted">15km</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-background-dark/50 rounded-xl">
                 <div className="size-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="material-symbols-outlined">sanitizer</span>
                 </div>
                 <div className="flex-1">
                    <h4 className="font-bold text-sm">Hand Sanitizer</h4>
                    <p className="text-xs text-text-muted">Metro Health • 2 Liters</p>
                 </div>
                 <span className="text-xs font-bold text-text-muted">22km</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SupplyMap;