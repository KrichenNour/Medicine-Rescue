'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/services/api';

type Chat = {
  id: string;
  otherUser: {
    id: string;
    name: string;
    email: string | null;
  };
  stock: {
    id: string;
    name: string;
  } | null;
  lastMessage: string;
  lastMessageAt: string;
};

const Messages: React.FC = () => {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      try {
        console.log('Loading conversations...');
        const data = await apiFetch('/conversations');
        console.log('Conversations data:', data);
        setChats(data);
      } catch (e) {
        console.error('Failed to load conversations:', e);
        // Only redirect if it's an auth error
        if (e?.message?.includes('401') || e?.message?.includes('Unauthorized')) {
          router.push('/auth');
        }
      } finally {
        setLoading(false);
      }
    };
    loadChats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading messages...</div>;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20 md:pb-8">
      <header className="sticky top-0 z-10 bg-background-light dark:bg-background-dark p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Messages</h1>
      </header>

      <div className="px-4 md:px-6 py-4 max-w-5xl mx-auto w-full">
        {chats.length === 0 ? (
          <p className="text-center text-text-muted">No conversations yet.</p>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => router.push(`/messages/${chat.id}`)}
                className="flex items-center gap-4 p-4 bg-white dark:bg-surface-dark rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary/10 group"
              >
                <div className="relative shrink-0">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chat.otherUser?.name || 'User')}&background=0D8ABC&color=fff`}
                    alt={chat.otherUser?.name || 'User'}
                    className="size-14 rounded-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">
                        {chat.otherUser?.name || 'Unknown'}
                      </h3>
                      <p className="text-xs text-text-muted truncate">
                        {chat.stock?.name || 'Direct message'}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted ml-2 shrink-0">
                      {chat.lastMessageAt
                        ? new Date(chat.lastMessageAt).toLocaleString()
                        : ''}
                    </span>
                  </div>
                  <p className="text-sm truncate text-text-muted">
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                </div>
                <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors">
                  chevron_right
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
