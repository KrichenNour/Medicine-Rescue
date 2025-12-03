'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Request {
  id: string;
  medicine_name: string;
  quantity: string;
  status: 'Pending' | 'Approved' | 'Delivered' | 'Cancelled';
  created_at: string;
  icon?: string;
}

const statusColor = (status: string) => {
  switch (status) {
    case 'Delivered': return 'text-green-500 bg-green-500/10';
    case 'Approved': return 'text-blue-500 bg-blue-500/10';
    case 'Pending': return 'text-amber-500 bg-amber-500/10';
    case 'Cancelled': return 'text-red-500 bg-red-500/10';
    default: return 'text-gray-500 bg-gray-200';
  }
};

const MyRequests: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Approved' | 'Delivered' | 'Cancelled'>('All');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inline Form States
  const [showForm, setShowForm] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [quantity, setQuantity] = useState('');

  // Fetch requests
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      const res = await fetch('http://localhost:4000/requests', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch requests: ${text}`);
      }

      const data: Request[] = await res.json();
      setRequests(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Submit new request
  const handleCreateRequest = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('No token found');

    if (!medicineName || !quantity) return alert('Fill in all fields');

    try {
      const res = await fetch('http://localhost:4000/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ medicine_name: medicineName, quantity }),
      });

      if (res.ok) {
        await fetchRequests();
        setShowForm(false);
        setMedicineName('');
        setQuantity('');
      } else {
        const err = await res.text();
        alert(`Error: ${err}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create request');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading requests...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-primary text-white p-4 md:p-6 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4 max-w-7xl mx-auto w-full">
          <button onClick={() => router.back()} className="rounded-full hover:bg-white/10 p-1">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl md:text-2xl font-bold flex-1">My Requests</h1>
          <button className="rounded-full hover:bg-white/10 p-1">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-[60px] md:top-[80px] z-10 bg-background-light dark:bg-background-dark shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="flex px-4 md:px-8 overflow-x-auto scrollbar-hide">
          {['All', 'Pending', 'Approved', 'Delivered', 'Cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-none px-4 py-4 text-sm font-bold border-b-[3px] transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Grid */}
      <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {requests
          .filter(r => activeTab === 'All' || r.status === activeTab)
          .map(req => (
            <div
              key={req.id}
              className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="size-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                  <span className="material-symbols-outlined">{req.icon || 'medical_services'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-light dark:text-text-dark truncate">{req.medicine_name}</h3>
                  <p className="text-sm text-text-muted">Qty: {req.quantity}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Requested on {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-2 border-t border-gray-50 dark:border-gray-800">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColor(
                    req.status
                  )}`}
                >
                  {req.status}
                </span>
              </div>
            </div>
          ))}
      </div>

     {/* Add Button (Desktop & Mobile) */}
<button
  onClick={() => setShowForm(true)}
  className="fixed bottom-10 right-10 size-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-dark transition-colors z-50"
>
  <span className="material-symbols-outlined text-3xl">add</span>
</button>


      {/* Inline Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-surface-dark p-6 rounded-xl w-80">
            <h2 className="text-lg font-bold mb-4">Create Request</h2>
            <input
              type="text"
              placeholder="Medicine Name"
              className="w-full mb-3 p-2 border rounded"
              value={medicineName}
              onChange={e => setMedicineName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Quantity"
              className="w-full mb-3 p-2 border rounded"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded"
                onClick={handleCreateRequest}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
