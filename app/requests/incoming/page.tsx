'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface IncomingRequest {
  _id: string;
  medicine_name: string;
  quantity: string;
  status: 'Pending' | 'Approved' | 'Delivered' | 'Cancelled';
  createdAt: string;
  user_id: {
    _id: string;
    email: string;
  };
  medicine_id: {
    _id: string;
    name: string;
    image_url?: string;
  };
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

const IncomingRequests: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Approved' | 'Delivered' | 'Cancelled'>('All');
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchIncomingRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      const res = await fetch('http://localhost:4000/requests/incoming', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch requests: ${text}`);
      }

      const data: IncomingRequest[] = await res.json();
      setRequests(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch incoming requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomingRequests();
  }, []);

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    setUpdatingId(requestId);
    try {
      const res = await fetch(`http://localhost:4000/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update request');
      }

      await fetchIncomingRequests();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update request');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading incoming requests...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const filteredRequests = requests.filter(r => activeTab === 'All' || r.status === activeTab);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-primary text-white p-4 md:p-6 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4 max-w-7xl mx-auto w-full">
          <button onClick={() => router.back()} className="rounded-full hover:bg-white/10 p-1">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl md:text-2xl font-bold flex-1">Incoming Requests</h1>
          <button 
            onClick={() => router.push('/requests')}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            title="View your outgoing requests"
          >
            <span className="material-symbols-outlined text-lg">outbox</span>
            <span className="hidden sm:inline">My Requests</span>
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
      {filteredRequests.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mb-4">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">inbox</span>
          </div>
          <p className="text-text-muted text-lg mb-2">No incoming requests</p>
          <p className="text-text-muted text-sm">
            {activeTab === 'All' 
              ? 'You haven\'t received any requests yet'
              : `No ${activeTab.toLowerCase()} requests`}
          </p>
        </div>
      ) : (
        <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {filteredRequests.map(req => (
            <div
              key={req._id}
              className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
            >
              <div className="flex items-start gap-4">
                {req.medicine_id?.image_url ? (
                  <img 
                    src={req.medicine_id.image_url} 
                    alt={req.medicine_name}
                    className="size-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="size-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                    <span className="material-symbols-outlined">medical_services</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-light dark:text-text-dark truncate">{req.medicine_name}</h3>
                  <p className="text-sm text-text-muted">Qty: {req.quantity}</p>
                  <p className="text-xs text-text-muted mt-1">
                    Requested by: {req.user_id?.email || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColor(
                    req.status
                  )}`}
                >
                  {req.status}
                </span>
                {req.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(req._id, 'Approved')}
                      disabled={updatingId === req._id}
                      className="px-3 py-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
                    >
                      {updatingId === req._id ? '...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to reject this request?')) {
                          handleUpdateStatus(req._id, 'Cancelled');
                        }
                      }}
                      disabled={updatingId === req._id}
                      className="px-3 py-1 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                    >
                      {updatingId === req._id ? '...' : 'Reject'}
                    </button>
                  </div>
                )}
                {req.status === 'Approved' && (
                  <button
                    onClick={() => handleUpdateStatus(req._id, 'Delivered')}
                    disabled={updatingId === req._id}
                    className="px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                  >
                    {updatingId === req._id ? '...' : 'Mark Delivered'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncomingRequests;