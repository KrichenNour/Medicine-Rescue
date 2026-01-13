'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/services/api';

const AddMedicine: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    quantity_unit: '',
    expiry_date: '',
    distance_km: '',
    image_url: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Basic validation (frontend)
      if (!formData.name.trim()) throw new Error('Medicine name is required');
      if (formData.quantity === '' || Number.isNaN(Number(formData.quantity))) throw new Error('Quantity is required');

      // distance_km is optional; avoid NaN by sending undefined when empty
      const distanceValue =
        formData.distance_km === '' ? undefined : Number(formData.distance_km);

      // expiry_date: send null/undefined if empty
      const expiryValue = formData.expiry_date ? formData.expiry_date : undefined;

      await apiFetch('/stock', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description?.trim() || '',
          quantity: Number(formData.quantity),
          quantity_unit: formData.quantity_unit?.trim() || '',
          expiry_date: expiryValue,
          distance_km: distanceValue,
          image_url: formData.image_url?.trim() || '',
          category: formData.category || '',
        }),
      });

      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to add medicine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <header className="px-4 py-4 flex items-center gap-4 bg-white dark:bg-surface-dark sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => router.back()} className="p-1">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Add New Medicine</h1>
      </header>

      <main className="flex-1 p-4 space-y-4 max-w-xl mx-auto">
        {error && <p className="text-red-500">{error}</p>}

        <input
          placeholder="Medicine Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-3 border rounded-xl"
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-3 border rounded-xl"
        />

        <input
          placeholder="Quantity"
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          className="w-full p-3 border rounded-xl"
        />

        <input
          placeholder="Quantity Unit (e.g., boxes, units)"
          value={formData.quantity_unit}
          onChange={(e) => setFormData({ ...formData, quantity_unit: e.target.value })}
          className="w-full p-3 border rounded-xl"
        />

        <input
          type="date"
          value={formData.expiry_date}
          onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
          className="w-full p-3 border rounded-xl"
        />

        <input
          placeholder="Distance in KM (optional)"
          type="number"
          value={formData.distance_km}
          onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
          className="w-full p-3 border rounded-xl"
        />

        <input
          placeholder="Image URL (optional)"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          className="w-full p-3 border rounded-xl"
        />

        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full p-3 border rounded-xl"
        >
          <option value="">Select Category</option>
          <option value="Antalgique">Antalgique</option>
          <option value="PPE">PPE</option>
          <option value="Digestif">Digestif</option>
          <option value="Equipment">Equipment</option>
        </select>
      </main>

      <footer className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full p-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors"
        >
          {loading ? 'Adding...' : 'Add Medicine'}
        </button>
      </footer>
    </div>
  );
};

export default AddMedicine;
