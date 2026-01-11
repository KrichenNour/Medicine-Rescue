'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in');

      const res = await fetch('http://localhost:4000/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          quantity: Number(formData.quantity),
          quantity_unit: formData.quantity_unit,
          expiry_date: formData.expiry_date,
          distance_km: Number(formData.distance_km),
          image_url: formData.image_url,
          category: formData.category,
          latitude: formData.latitude,
          longitude: formData.longitude,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to add medicine: ${text}`);
      }

      // Redirect to dashboard or stock list
      router.push('/dashboard'); // <-- change this if your dashboard route is different
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to add medicine');
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
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-3 border rounded-xl"
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-3 border rounded-xl"
        />
        <input
          placeholder="Quantity"
          type="number"
          value={formData.quantity}
          onChange={e => setFormData({ ...formData, quantity: e.target.value })}
          className="w-full p-3 border rounded-xl"
        />
        <input
          placeholder="Quantity Unit (e.g., boxes, units)"
          value={formData.quantity_unit}
          onChange={e => setFormData({ ...formData, quantity_unit: e.target.value })}
          className="w-full p-3 border rounded-xl"
        />
        <input
          type="date"
          value={formData.expiry_date}
          onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
          className="w-full p-3 border rounded-xl"
        />
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setFormData({
                      ...formData,
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                      distance_km: '0' // Default or calculated
                    });
                    alert('Location captured successfully!');
                  },
                  (err) => {
                    console.error(err);
                    setError('Failed to get location: ' + err.message);
                  }
                );
              } else {
                setError('Geolocation is not supported by this browser.');
              }
            }}
            className="w-full p-3 border rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">my_location</span>
            {formData.latitude ? 'Location Captured' : 'Get Current Location'}
          </button>
          {formData.latitude && (
            <p className="text-xs text-green-600 text-center">
              Lat: {formData.latitude.toFixed(4)}, Lng: {formData.longitude?.toFixed(4)}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Product Image
          </label>
          <div className="flex flex-col items-center gap-4">
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl shadow-md"
              />
            )}
            <label className="w-full cursor-pointer">
              <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined text-primary">add_a_photo</span>
                <span className="text-sm font-medium">Capture or Select Image</span>
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setLoading(true);
                  setError(null);
                  try {
                    const uploadFormData = new FormData();
                    uploadFormData.append('image', file);

                    const res = await fetch('http://localhost:4000/upload', {
                      method: 'POST',
                      body: uploadFormData,
                    });

                    if (!res.ok) throw new Error('Failed to upload image');
                    const { imageUrl } = await res.json();
                    setFormData({ ...formData, image_url: imageUrl });
                  } catch (err: any) {
                    setError('Image upload failed: ' + err.message);
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            </label>
          </div>
        </div>
        <select
          value={formData.category}
          onChange={e => setFormData({ ...formData, category: e.target.value })}
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
