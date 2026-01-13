'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditModal from '../../components/EditModal';

const ManageSurplus: React.FC = () => {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);

  useEffect(() => {
    if (!token) {
      router.push('/auth');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id || payload._id || (payload.user && (payload.user.id || payload.user._id));
      setCurrentUserId(userId || null);
    } catch (e) {
      console.error('Failed to parse token', e);
      setCurrentUserId(null);
    }
  }, [router, token]);

  const fetchMySupplies = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/stock', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const mapped = (data || []).map((d: any) => {
        const donorId = d.donor ? (typeof d.donor === 'string' ? d.donor : d.donor._id) : null;
        return {
          id: d._id || d.id,
          name: d.name,
          qty: `${d.quantity} ${d.quantity_unit || ''}`.trim(),
          expiry: d.expiry_date ? new Date(d.expiry_date).toLocaleDateString() : 'N/A',
          status: d.status || 'Available',
          image: d.image_url || 'https://placehold.co/400x400/008080/ffffff?text=Supply',
          donorId,
        };
      });

      const mine = currentUserId ? mapped.filter((i: any) => i.donorId && i.donorId.toString() === currentUserId.toString()) : [];
      setItems(mine);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySupplies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const handleDelete = async (item: any) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:4000/stock/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        let msg = 'Failed to delete';
        try {
          const j = await res.json();
          msg = j.error || msg;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      setSelectedItem(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleSave = async (item: any, updates: any) => {
    if (!token) throw new Error('You must be logged in');
    
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

    // Refresh the list
    await fetchMySupplies();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'Donated': return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-8">
      {/* Header */}
      <header className="px-4 py-4 md:px-8 md:py-6 flex items-center justify-between sticky top-0 bg-background-light dark:bg-background-dark z-10 max-w-7xl mx-auto w-full">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold">Manage My Surplus</h1>
        <div className="w-10"></div>
      </header>

      <div className="max-w-7xl mx-auto w-full">
        {loading && <div className="px-4 md:px-8 py-6 text-sm text-text-muted">Loading your supplies…</div>}

        {/* Search */}
        <div className="px-4 md:px-8 mb-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">search</span>
            <input
              type="text"
              placeholder="Search by item name..."
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-gray-100 dark:bg-surface-dark border-none focus:ring-2 focus:ring-primary outline-none dark:text-white transition-shadow"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 md:px-8 mb-6 overflow-x-auto scrollbar-hide flex gap-2">
          {['All', 'Available', 'Pending', 'Donated'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-primary/20 text-primary' : 'bg-gray-100 dark:bg-surface-dark text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List Grid */}
        <div className="px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.filter(i => filter === 'All' || i.status === filter).map(item => (
            <div key={item.id} className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
              <img src={item.image} alt={item.name} className="size-20 rounded-lg object-cover bg-gray-200" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-text-light dark:text-text-dark truncate">{item.name}</h3>
                <p className="text-sm text-text-muted mt-0.5">Qty: {item.qty}</p>
                <p className="text-sm text-text-muted">Expires: {item.expiry}</p>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Edit"
                >
                  <span className="material-symbols-outlined text-text-light dark:text-text-dark">edit</span>
                </button>
                <button
                  onClick={() => {
                    if (!confirm(`Delete "${item.name}"?`)) return;
                    handleDelete(item);
                  }}
                  className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Delete"
                >
                  <span className="material-symbols-outlined text-red-600">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB (Mobile Only) */}
      <button
        onClick={() => router.push('/add-supply')}
        className="md:hidden fixed bottom-20 right-4 size-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-dark transition-colors z-30"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Edit Modal */}
      {selectedItem && (
        <EditModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={handleDelete}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ManageSurplus;