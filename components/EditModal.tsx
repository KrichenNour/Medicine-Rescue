'use client'

import React from 'react';

interface EditModalProps {
    item: any;
    onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ item, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-xl shadow-2xl p-6 animate-in slide-in-from-bottom-10">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">Edit {item.name}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <span className="material-symbols-outlined">close</span>
            </button>
         </div>

         <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold mb-1 dark:text-gray-300">Quantity Available</label>
                <input type="text" defaultValue={item.qty} className="w-full p-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1 dark:text-gray-300">Expiration Date</label>
                <input type="date" defaultValue="2025-12-31" className="w-full p-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1 dark:text-gray-300">Status</label>
                <select defaultValue={item.status} className="w-full p-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white">
                    <option>Available</option>
                    <option>Pending</option>
                    <option>Donated</option>
                </select>
            </div>
         </div>

         <div className="mt-8 flex flex-col sm:flex-row gap-3">
             <button className="flex-1 py-3 text-red-600 font-bold bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 transition-colors">
                Delete Item
             </button>
             <div className="flex-1 flex gap-3">
                 <button onClick={onClose} className="flex-1 py-3 font-bold border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors">
                    Cancel
                 </button>
                 <button onClick={onClose} className="flex-1 py-3 font-bold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                    Save Changes
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
};

export default EditModal;