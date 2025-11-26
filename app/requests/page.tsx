'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const MyRequests: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');

  const requests = [
    { id: 1, name: 'N95 Masks', qty: '50 boxes', date: 'Oct 26, 2023', status: 'Delivered', color: 'text-green-500 bg-green-500/10', icon: 'medication' },
    { id: 2, name: 'Sterile Gauze Pads', qty: '200 units', date: 'Oct 25, 2023', status: 'Approved', color: 'text-blue-500 bg-blue-500/10', icon: 'healing' },
    { id: 3, name: 'Surgical Gloves', qty: '100 boxes', date: 'Oct 24, 2023', status: 'Pending', color: 'text-amber-500 bg-amber-500/10', icon: 'sanitizer' },
    { id: 4, name: 'Insulin Syringes', qty: '500 units', date: 'Oct 22, 2023', status: 'Cancelled', color: 'text-red-500 bg-red-500/10', icon: 'syringe' },
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-8">
      <header className="sticky top-0 z-20 bg-primary text-white p-4 md:p-6 shadow-md flex items-center justify-between">
         <div className="flex items-center gap-4 max-w-7xl mx-auto w-full">
            <button onClick={() => router.back()} className="rounded-full hover:bg-white/10 p-1">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl md:text-2xl font-bold flex-1">My Requests</h1>
            <button className="rounded-full hover:bg-white/10 p-1">
                <span className="material-symbols-outlined">more_vert</span>
            </button>
         </div>
      </header>

      <div className="max-w-7xl mx-auto w-full">
          {/* Tabs */}
          <div className="sticky top-[60px] md:top-[80px] z-10 bg-background-light dark:bg-background-dark shadow-sm border-b border-gray-200 dark:border-gray-800">
            <div className="flex px-4 md:px-8 overflow-x-auto scrollbar-hide">
                {['All', 'Pending', 'Approved', 'Delivered', 'Cancelled'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-none px-4 py-4 text-sm font-bold border-b-[3px] transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
          </div>

          <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.filter(r => activeTab === 'All' || r.status === activeTab).map(req => (
                <div key={req.id} className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="size-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                        <span className="material-symbols-outlined">{req.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-text-light dark:text-text-dark truncate">{req.name}</h3>
                        <p className="text-sm text-text-muted">Qty: {req.qty}</p>
                        <p className="text-xs text-gray-400 mt-1">Requested on {req.date}</p>
                    </div>
                </div>
                <div className="flex justify-end pt-2 border-t border-gray-50 dark:border-gray-800">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${req.color}`}>
                        {req.status}
                    </span>
                </div>
                </div>
            ))}
          </div>
      </div>

      <button className="md:hidden fixed bottom-20 right-6 size-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-dark transition-colors z-30">
         <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
};

export default MyRequests;