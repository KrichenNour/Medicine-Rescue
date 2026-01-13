'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/services/api';

type Msg = {
  _id?: string;
  id?: string;
  text: string;
  senderId: string;
  createdAt: string;
};

type ConversationInfo = {
  otherUser: {
    id: string;
    name: string;
    email: string | null;
  };
  stock: {
    id: string;
    name: string;
  } | null;
};

const ChatDetail: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversationInfo, setConversationInfo] = useState<ConversationInfo | null>(null);

  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Get current user from localStorage
  const getMyId = () => {
    if (typeof window === 'undefined') return null;
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      return u?.id || u?._id || null;
    } catch {
      return null;
    }
  };

  const myId = getMyId();

  // Fetch conversation info and messages from backend
  useEffect(() => {
    const loadConversation = async () => {
      try {
        // Fetch conversation details and messages in parallel
        const [convData, messagesData] = await Promise.all([
          apiFetch(`/conversations/${id}`),
          apiFetch(`/conversations/${id}/messages`)
        ]);
        setConversationInfo(convData);
        setMessages(messagesData);
      } catch (e) {
        console.error(e);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) loadConversation();
  }, [id]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to backend
  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const newMsg = await apiFetch(`/conversations/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: input.trim() }),
      });

      setMessages((prev) => [...prev, newMsg]);
      setInput('');
    } catch (e) {
      console.error(e);
      alert('Failed to send message');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 bg-white/90 dark:bg-surface-dark/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        {/* User name and item info */}
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-text-light dark:text-text-dark leading-tight truncate">
            {conversationInfo?.otherUser?.name || 'Chat'}
          </h2>
          <p className="text-xs text-text-muted truncate">
            {conversationInfo?.stock?.name || 'Direct message'}
          </p>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-background-dark">
        {messages.map((msg) => {
          const isMe = String(msg.senderId) === String(myId);

          return (
            <div
              key={msg._id || msg.id || msg.createdAt}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl ${isMe
                    ? 'bg-primary text-white rounded-br-none shadow-md'
                    : 'bg-white dark:bg-surface-dark text-text-light dark:text-text-dark shadow-sm rounded-bl-none border border-gray-100 dark:border-gray-800'
                  }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/80' : 'text-text-muted'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-end gap-2 bg-gray-100 dark:bg-background-dark rounded-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-primary/20">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none outline-none py-2.5 px-3 dark:text-white text-sm"
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`p-2 rounded-xl transition-all duration-200 ${input.trim() ? 'text-primary bg-primary/10 hover:bg-primary hover:text-white' : 'text-gray-400'
              }`}
          >
            <span className="material-symbols-outlined font-variation-fill">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;
