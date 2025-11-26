'use client'

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

const SidebarNext: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { label: 'My Requests', icon: 'inbox', path: '/requests' },
    { label: 'Messages', icon: 'chat_bubble', path: '/messages' },
    { label: 'Profile', icon: 'person', path: '/settings' },
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800">
      <div className="p-6 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-3xl">health_and_safety</span>
        <span className="text-xl font-bold text-text-light dark:text-text-dark">MedSurplus</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path === '/messages' && pathname.startsWith('/messages'));
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors duration-200 group ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'font-variation-fill' : ''}`}>
                {item.icon}
              </span>
              <span className={`font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button 
          onClick={() => router.push('/add-supply')}
          className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          <span>Add Supply</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarNext;