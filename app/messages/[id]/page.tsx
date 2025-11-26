'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

const ChatDetail: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  
  // Mock data simulation based on ID (simplified)
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi, I saw your listing for N95 masks.', sender: 'them', time: '10:15 AM' },
    { id: 2, text: 'Yes, we have 100 boxes available in the downtown storage facility.', sender: 'me', time: '10:20 AM' },
    { id: 3, text: 'Is the lot still available? We really need them for our ICU unit.', sender: 'them', time: '10:30 AM' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if(!input.trim()) return;
    setMessages([...messages, {
        id: Date.now(),
        text: input,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 bg-white/90 dark:bg-surface-dark/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="relative">
            <img src="https://ui-avatars.com/api/?name=City+General&background=0D8ABC&color=fff" className="size-10 rounded-full" alt="User Avatar" />
            <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white dark:border-surface-dark"></div>
        </div>
        <div className="flex-1 min-w-0">
            <h2 className="font-bold text-text-light dark:text-text-dark leading-tight truncate">City General Hospital</h2>
            <p className="text-xs text-text-muted">Online</p>
        </div>
        <div className="flex gap-1">
             <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                <span className="material-symbols-outlined">call</span>
            </button>
            <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                <span className="material-symbols-outlined">videocam</span>
            </button>
        </div>
       
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-background-dark">
        {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                    msg.sender === 'me'
                    ? 'bg-primary text-white rounded-br-none shadow-md'
                    : 'bg-white dark:bg-surface-dark text-text-light dark:text-text-dark shadow-sm rounded-bl-none border border-gray-100 dark:border-gray-800'
                }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-white/80' : 'text-text-muted'}`}>{msg.time}</p>
                </div>
            </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-end gap-2 bg-gray-100 dark:bg-background-dark rounded-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">add_circle</span>
            </button>
            <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 py-2.5 px-1 dark:text-white text-sm"
                rows={1}
                style={{ minHeight: '44px' }}
            />
            <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-2 rounded-xl transition-all duration-200 ${input.trim() ? 'text-primary bg-primary/10 hover:bg-primary hover:text-white' : 'text-gray-400'}`}
            >
                <span className="material-symbols-outlined font-variation-fill">send</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;