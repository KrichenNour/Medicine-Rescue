'use client'

import React, { useState, useEffect } from 'react';

interface EditModalProps {
    item: any;
    onClose: () => void;
    onDelete?: (item: any) => void;
    onSave?: (item: any, updates: any) => Promise<void>;
}

const EditModal: React.FC<EditModalProps> = ({ item, onClose, onDelete, onSave }) => {
  const [quantity, setQuantity] = useState<string>('');
  const [quantityUnit, setQuantityUnit] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [status, setStatus] = useState<string>('Available');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse quantity from "10 boxes" format
    if (item.qty) {
      const parts = item.qty.trim().split(/\s+/);
      if (parts.length >= 2) {
        setQuantity(parts[0]);
        setQuantityUnit(parts.slice(1).join(' '));
      } else if (parts.length === 1 && !isNaN(parseInt(parts[0]))) {
        setQuantity(parts[0]);
        setQuantityUnit('');
      }
    }

    // Parse expiry date
    if (item.expiry && item.expiry !== 'N/A') {
      try {
        const date = new Date(item.expiry);
        if (!isNaN(date.getTime())) {
          setExpiryDate(date.toISOString().split('T')[0]);
        }
      } catch (e) {
        // Ignore
      }
    }

    if (item.status) {
      setStatus(item.status);
    }
  }, [item]);

  const handleSave = async () => {
    if (!onSave) {
      // If no onSave callback, try to save directly
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in');
        return;
      }

      if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
        setError('Please enter a valid quantity');
        return;
      }

      setSaving(true);
      setError(null);

      try {
        const updates: any = {
          quantity: parseInt(quantity),
          quantity_unit: quantityUnit || undefined,
          status: status,
        };

        if (expiryDate) {
          updates.expiry_date = expiryDate;
        }

        const res = await fetch(`http://localhost:4000/stock/${item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to update supply');
        }

        onClose();
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to save changes');
      } finally {
        setSaving(false);
      }
    } else {
      // Use the callback
      setSaving(true);
      setError(null);
      try {
        const updates: any = {
          quantity: parseInt(quantity),
          quantity_unit: quantityUnit || undefined,
          status: status,
        };

        if (expiryDate) {
          updates.expiry_date = expiryDate;
        }

        await onSave(item, updates);
        onClose();
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to save changes');
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-xl shadow-2xl p-6 animate-in slide-in-from-bottom-10">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">Edit {item.name}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <span className="material-symbols-outlined">close</span>
            </button>
         </div>

         {error && (
           <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
             <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
           </div>
         )}

         <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold mb-1 dark:text-gray-300">Quantity</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    min="0"
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)}
                    className="flex-1 p-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white" 
                    placeholder="10"
                  />
                  <input 
                    type="text" 
                    value={quantityUnit} 
                    onChange={(e) => setQuantityUnit(e.target.value)}
                    className="flex-1 p-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white" 
                    placeholder="boxes, units, etc."
                  />
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold mb-1 dark:text-gray-300">Expiration Date</label>
                <input 
                  type="date" 
                  value={expiryDate} 
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white" 
                />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1 dark:text-gray-300">Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white"
                >
                    <option value="Available">Available</option>
                    <option value="Pending">Pending</option>
                    <option value="Donated">Donated</option>
                </select>
            </div>
         </div>

         <div className="mt-8 flex flex-col sm:flex-row gap-3">
             <button
               onClick={() => {
                 if (!onDelete) return;
                 if (!confirm(`Delete "${item.name}"?`)) return;
                 onDelete(item);
               }}
               disabled={!onDelete || saving}
               className={`flex-1 py-3 font-bold rounded-lg transition-colors ${
                 onDelete
                   ? 'text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100'
                   : 'text-gray-400 bg-gray-100 cursor-not-allowed'
               }`}
             >
                Delete Item
             </button>
             <div className="flex-1 flex gap-3">
                 <button 
                   onClick={onClose} 
                   disabled={saving}
                   className="flex-1 py-3 font-bold border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors disabled:opacity-50"
                 >
                    Cancel
                 </button>
                 <button 
                   onClick={handleSave} 
                   disabled={saving}
                   className="flex-1 py-3 font-bold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-wait"
                 >
                    {saving ? 'Saving...' : 'Save Changes'}
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
};

export default EditModal;