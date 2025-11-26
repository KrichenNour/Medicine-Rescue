'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const supplies = [
  {
    id: '1',
    name: 'N95 Respirator Masks',
    quantity: '5 Boxes',
    expiry: 'Dec 2025',
    distance: '12 km',
    image: '/images/n95-mask.png',
    expiryColor: 'text-green-600 dark:text-green-400'
  },
  {
    id: '2',
    name: 'Surgical Gowns',
    quantity: '2 Cases',
    expiry: 'Jan 2025',
    distance: '25 km',
    image: '/images/surgical-gown.png',
    expiryColor: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: '3',
    name: 'Sterile Latex Gloves',
    quantity: '10 Boxes',
    expiry: 'Nov 2024',
    distance: '8 km',
    image: '/images/latex-gloves.png',
    expiryColor: 'text-red-600 dark:text-red-400'
  },
  {
    id: '4',
    name: 'Face Shields',
    quantity: '50 Units',
    expiry: 'Mar 2026',
    distance: '5 km',
    image: '/images/face-shield.jpg',
    expiryColor: 'text-green-600 dark:text-green-400'
  }
];

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 py-3 md:px-8 md:py-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="text-xl md:text-2xl font-bold">Available Supplies</h1>
        </div>
        <button
          onClick={() => router.push('/notifications')}
          className="p-2 -mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      {/* Search & Filters */}
      <div className="px-4 py-4 md:px-8 space-y-4 max-w-7xl mx-auto w-full">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-3 text-gray-400">search</span>
          <input
            type="text"
            placeholder="Search for masks, gloves, etc."
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-surface-dark border-none shadow-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pb-2">
          {['Category', 'Distance', 'Expiry'].map((filter) => (
            <button key={filter} className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-surface-dark rounded-lg text-sm font-medium shadow-sm whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {filter}
              <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
            </button>
          ))}
          <div className="flex-1"></div>
          <button
            onClick={() => router.push('/map')}
            className="flex items-center gap-1 px-4 py-2 bg-primary/10 text-primary dark:bg-primary/20 rounded-lg text-sm font-bold shadow-sm whitespace-nowrap hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">map</span>
            Map View
          </button>
        </div>
      </div>

      {/* List / Grid */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {supplies.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
            <div key={item.id} className="bg-white dark:bg-surface-dark rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all group">
              <div className="h-48 w-full bg-gray-200 relative overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-surface-dark/90 px-2 py-1 rounded-lg text-xs font-bold shadow-sm backdrop-blur">
                  {item.distance}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-text-light dark:text-text-dark line-clamp-1">{item.name}</h3>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                    <p className={`text-sm font-medium ${item.expiryColor}`}>Expires: {item.expiry}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/route/${item.id}`)}
                    className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                  >
                    Request
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB (Mobile Only) */}
      <button
        onClick={() => router.push('/add-supply')}
        className="md:hidden fixed bottom-20 right-4 size-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:bg-primary-dark transition-colors z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
};

export default Dashboard;