'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

const Messages: React.FC = () => {
  const router = useRouter();
  
  const chats = [
    {
      id: '1',
      name: 'City General Hospital',
      lastMessage: 'Is the N95 masks lot still available?',
      time: '10:30 AM',
      unread: 2,
      avatar: 'https://ui-avatars.com/api/?name=City+General&background=0D8ABC&color=fff'
    },
    {
      id: '2',
      name: 'Dr. Emily Chen',
      lastMessage: 'Thank you for the surgical gloves donation!',
      time: 'Yesterday',
      unread: 0,
      avatar: 'https://ui-avatars.com/api/?name=Emily+Chen&background=66BB6A&color=fff'
    },
    {
      id: '3',
      name: 'Metro Clinic Logistics',
      lastMessage: 'Driver is scheduled for pickup at 2 PM tomorrow.',
      time: 'Oct 24',
      unread: 0,
      avatar: 'https://ui-avatars.com/api/?name=Metro+Clinic&background=FFCA28&color=fff'
    },
    {
        id: '4',
        name: 'St. Mary\'s Urgent Care',
        lastMessage: 'Do you have any sterile gauze pads left?',
        time: 'Oct 22',
        unread: 0,
        avatar: 'https://ui-avatars.com/api/?name=St+Marys&background=EF5350&color=fff'
    }
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20 md:pb-8">
      <header className="sticky top-0 z-10 bg-background-light dark:bg-background-dark p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Messages</h1>
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">edit_square</span>
        </button>
      </header>

      <div className="px-4 md:px-6 py-4 max-w-5xl mx-auto w-full">
        <div className="relative mb-6">
            <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">search</span>
            <input
                type="text"
                placeholder="Search messages..."
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-white dark:bg-surface-dark border-none focus:ring-2 focus:ring-primary outline-none dark:text-white shadow-sm"
            />
        </div>

        <div className="space-y-3">
            {chats.map(chat => (
                <div
                    key={chat.id}
                    onClick={() => router.push(`/messages/${chat.id}`)}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-surface-dark rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary/10 group"
                >
                    <div className="relative shrink-0">
                        <img src={chat.avatar} alt={chat.name} className="size-14 rounded-full object-cover group-hover:scale-105 transition-transform" />
                        {chat.unread > 0 && (
                            <div className="absolute -top-1 -right-1 size-6 bg-primary text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-surface-dark shadow-sm">
                                {chat.unread}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-lg text-text-light dark:text-text-dark truncate">{chat.name}</h3>
                            <span className={`text-xs ${chat.unread > 0 ? 'text-primary font-bold' : 'text-text-muted'}`}>{chat.time}</span>
                        </div>
                        <p className={`text-sm truncate ${chat.unread > 0 ? 'text-text-light dark:text-text-dark font-medium' : 'text-text-muted'}`}>
                            {chat.lastMessage}
                        </p>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors">chevron_right</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Messages;