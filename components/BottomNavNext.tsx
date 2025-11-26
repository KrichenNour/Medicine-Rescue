'use client'

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

const BottomNavNext: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { label: 'My Requests', icon: 'inbox', path: '/requests' },
    { label: 'Messages', icon: 'chat_bubble', path: '/messages' },
    { label: 'Profile', icon: 'person', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path === '/messages' && pathname.startsWith('/messages'));
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center w-full gap-1 transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'font-variation-fill' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavNext;