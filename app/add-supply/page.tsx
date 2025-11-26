'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const AddSupply: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    expiry: '',
    category: ''
  });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <header className="px-4 py-4 flex items-center gap-4 bg-white/50 dark:bg-surface-dark/50 backdrop-blur border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-1">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Add New Supply</h1>
      </header>

      <main className="flex-1 p-4 space-y-6">
        
        {/* Name Input */}
        <div>
          <label className="block text-sm font-bold mb-2">Item Name</label>
          <input 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. N95 Masks"
            className="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none dark:text-white"
          />
        </div>

        {/* Quantity */}
        <div>
           <label className="block text-sm font-bold mb-2">Quantity Available</label>
           <div className="relative">
              <input 
                type="number" 
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                placeholder="Enter a number" 
                className="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none dark:text-white"
              />
              <div className="absolute right-2 top-1 bottom-1 flex gap-1">
                 <button className="size-10 flex items-center justify-center text-primary hover:bg-primary/10 rounded-lg">
                    <span className="material-symbols-outlined">remove</span>
                 </button>
                 <button className="size-10 flex items-center justify-center text-primary hover:bg-primary/10 rounded-lg">
                    <span className="material-symbols-outlined">add</span>
                 </button>
              </div>
           </div>
        </div>

        {/* Expiry */}
        <div>
           <label className="block text-sm font-bold mb-2">Expiration Date</label>
           <div className="relative">
              <input 
                type="date"
                value={formData.expiry}
                onChange={e => setFormData({...formData, expiry: e.target.value})}
                className="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none dark:text-white"
              />
              <span className="material-symbols-outlined absolute right-4 top-3 text-gray-400 pointer-events-none">calendar_today</span>
           </div>
        </div>

        {/* Category */}
        <div>
           <label className="block text-sm font-bold mb-2">Item Type</label>
           <div className="relative">
             <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none dark:text-white appearance-none"
             >
                <option value="" disabled>Select a category</option>
                <option value="ppe">PPE</option>
                <option value="medication">Medication</option>
                <option value="equipment">Equipment</option>
                <option value="disposables">Disposables</option>
             </select>
             <span className="material-symbols-outlined absolute right-4 top-3 text-gray-400 pointer-events-none">expand_more</span>
           </div>
        </div>

      </main>

      <footer className="p-4 bg-white/90 dark:bg-surface-dark/90 border-t border-gray-200 dark:border-gray-800">
         <button 
            onClick={() => router.push('/manage-surplus')}
            className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-dark transition-colors"
         >
            Add Item
         </button>
      </footer>
    </div>
  );
};

export default AddSupply;