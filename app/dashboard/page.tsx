'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Supply {
  id: string;
  name: string;
  quantity: string;
  expiry: string;
  distance: string;
  image: string;
  expiryColor: string;
  category: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: '',
    maxDistance: '',
    expiry: '',
  });

  // Fetch supplies from backend
  const fetchSupplies = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.maxDistance) params.append('maxDistance', filters.maxDistance);
      if (filters.expiry) params.append('expiry', filters.expiry);

      const res = await fetch(`http://localhost:4000/stock?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.push('/auth'); // redirect if token invalid
        return;
      }

      const data = await res.json();

      const mapped = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        quantity: `${d.quantity} ${d.quantity_unit || ''}`.trim(),
        expiry: d.expiry_date
          ? new Date(d.expiry_date).toLocaleString('default', { month: 'short', year: 'numeric' })
          : 'N/A',
        distance: d.distance_km ? `${d.distance_km} km` : '—',
        image: d.image_url || '/images/placeholder.png',
        category: d.category || 'Other',
        expiryColor:
          d.expiry_date && new Date(d.expiry_date) < new Date()
            ? 'text-red-600 dark:text-red-400'
            : 'text-green-600 dark:text-green-400',
      }));
      setSupplies(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplies();
  }, [filters]);

  const handleFilter = (type: 'category' | 'maxDistance' | 'expiry', value: string) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  if (loading) return <div className="p-8 text-center">Loading supplies...</div>;

  return (
    <div className="pb-24 md:pb-8 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 py-3 md:px-8 md:py-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="text-xl md:text-2xl font-bold">Available Supplies</h1>
        </div>
        <button
          onClick={() => router.push('/notifications')}
          className="p-2 -mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      {/* Search & Filters */}
      <div className="px-4 py-4 md:px-8 space-y-4 max-w-7xl mx-auto w-full">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-3 text-gray-400">search</span>
          <input
            type="text"
            placeholder="Search for masks, gloves, etc."
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-surface-dark border-none shadow-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pb-2">
          <select
            value={filters.category}
            onChange={(e) => handleFilter('category', e.target.value)}
            className="px-4 py-2 bg-white dark:bg-surface-dark rounded-lg text-sm shadow-sm"
          >
            <option value="">All Categories</option>
            <option value="PPE">PPE</option>
            <option value="Medicine">Medicine</option>
          </select>

          <input
            type="number"
            placeholder="Max Distance (km)"
            value={filters.maxDistance}
            onChange={(e) => handleFilter('maxDistance', e.target.value)}
            className="px-4 py-2 bg-white dark:bg-surface-dark rounded-lg text-sm shadow-sm"
          />

          <input
            type="date"
            placeholder="Expiry before"
            value={filters.expiry}
            onChange={(e) => handleFilter('expiry', e.target.value)}
            className="px-4 py-2 bg-white dark:bg-surface-dark rounded-lg text-sm shadow-sm"
          />

          <div className="flex-1"></div>
          <button
            onClick={() => router.push('/map')}
            className="flex items-center gap-1 px-4 py-2 bg-primary/10 text-primary dark:bg-primary/20 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">map</span>
            Map View
          </button>
        </div>
      </div>

      {/* List / Grid */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {supplies
            .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((item, idx) => (
              <div
                key={item.id || item._id || idx}
                className="bg-white dark:bg-surface-dark rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="h-48 w-full bg-gray-200 relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-surface-dark/90 px-2 py-1 rounded-lg text-xs font-bold shadow-sm backdrop-blur">
                    {item.distance}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-text-light dark:text-text-dark line-clamp-1">
                      {item.name}
                    </h3>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                      <p className={`text-sm font-medium ${item.expiryColor}`}>Expires: {item.expiry}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/route/${item.id || item._id || ''}`)}
                      className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                    >
                      Request
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* FAB (Mobile Only) */}
      <button
        onClick={() => router.push('/add-supply')}
        className="md:hidden fixed bottom-20 right-4 size-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:bg-primary-dark transition-colors z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
};

export default Dashboard;
