'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

type SupplyPoint = {
  id: string;
  name: string;
  quantity: string;
  availableQuantity: number;
  totalQuantity: number;
  category: string;
  latitude: number;
  longitude: number;
  location: string;
  distance: string;
  donorId: string;
};

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/60">
      <div className="bg-white dark:bg-surface-dark px-4 py-3 rounded-xl shadow">
        <p className="text-sm font-semibold">Loading map…</p>
      </div>
    </div>
  ),
});

const SupplyMap: React.FC = () => {
  const router = useRouter();
  const [supplyPoints, setSupplyPoints] = useState<SupplyPoint[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('[DEBUG] Token payload:', payload);
        const userId = payload.id || payload._id || (payload.user && (payload.user.id || payload.user._id));
        setCurrentUserId(userId);
      } catch (e) {
        console.error('Failed to parse token', e);
      }
    }

    const fetchSupplies = async () => {
      try {
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('http://localhost:4000/stock', { headers });
        if (!res.ok) throw new Error('Failed to fetch stock');
        const data = await res.json();
        console.log('[DEBUG] Fetched stock data sample:', data[0]);

        const mapped: SupplyPoint[] = data.map((item: any) => ({
          id: item._id,
          name: item.name,
          quantity: `${item.quantity} ${item.quantity_unit || ''}`,
          availableQuantity: item.available_quantity ?? item.quantity,
          totalQuantity: item.quantity,
          category: item.category || 'Supplies',
          latitude: item.latitude || 0,
          longitude: item.longitude || 0,
          location: 'Supplier Location',
          distance: item.distance_km ? `${item.distance_km} km` : 'Unknown',
          donorId: item.donor ? (typeof item.donor === 'string' ? item.donor : item.donor._id) : null
        })).filter((p: SupplyPoint) => p.latitude && p.longitude);

        setSupplyPoints(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSupplies();
  }, []);

  const handleRequest = async (e: React.MouseEvent, item: SupplyPoint) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to request supplies');
      router.push('/auth');
      return;
    }

    console.log('[DEBUG] Comparing donor:', item.donorId, 'with current user:', currentUserId);

    if (item.donorId && currentUserId && item.donorId.toString() === currentUserId.toString()) {
      alert('You cannot request your own medicine');
      return;
    }

    if (item.availableQuantity <= 0) {
      alert('This item is no longer available');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          medicine_id: item.id,
          medicine_name: item.name,
          quantity: "1" // Default quantity of 1
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to request');
      }

      alert('Request sent successfully!');
      // Refresh supplies to update available quantities
      const refreshRes = await fetch('http://localhost:4000/stock', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const mapped: SupplyPoint[] = data.map((d: any) => ({
          id: d._id,
          name: d.name,
          quantity: `${d.quantity} ${d.quantity_unit || ''}`,
          availableQuantity: d.available_quantity ?? d.quantity,
          totalQuantity: d.quantity,
          category: d.category || 'Supplies',
          latitude: d.latitude || 0,
          longitude: d.longitude || 0,
          location: 'Supplier Location',
          distance: d.distance_km ? `${d.distance_km} km` : 'Unknown',
          donorId: d.donor ? (typeof d.donor === 'string' ? d.donor : d.donor._id) : null
        })).filter((p: SupplyPoint) => p.latitude && p.longitude);
        setSupplyPoints(mapped);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (e: React.MouseEvent, item: SupplyPoint) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:4000/stock/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete');
      }

      setSupplyPoints(prev => prev.filter(p => p.id !== item.id));
      alert('Supply deleted successfully');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const [selectedItem, setSelectedItem] = useState<SupplyPoint | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(true);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const minSwipeDistance = 30;

  const handleDragStart = (clientY: number) => {
    setDragStart(clientY);
    setIsDragging(true);
  };

  const handleDragEnd = (clientY: number) => {
    if (dragStart === null) return;
    const distance = clientY - dragStart;

    if (distance > minSwipeDistance && isSheetVisible) {
      setIsSheetVisible(false);
    } else if (distance < -minSwipeDistance && !isSheetVisible) {
      setIsSheetVisible(true);
    }

    setIsDragging(false);
    setDragStart(null);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    handleDragStart(e.touches[0].clientY);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (dragStart !== null) {
      handleDragEnd(e.changedTouches[0].clientY);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleDragStart(e.clientY);
  };

  const onMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragStart !== null) {
      handleDragEnd(e.clientY);
    }
  };

  const goToItem = (item: SupplyPoint) => {
    setSelectedItem(item);
  };

  const showSheet = () => {
    setIsSheetVisible(true);
  };

  const hideSheet = () => {
    setIsSheetVisible(false);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsRequestingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsRequestingLocation(false);
        setLocationError(null);
      },
      (error) => {
        setIsRequestingLocation(false);
        console.error('Geolocation error:', error);

        switch (error.code) {
          case 1:
            setLocationError('Location access denied.');
            break;
          case 2:
            setLocationError('Location information is unavailable.');
            break;
          case 3:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('Unable to get your location.');
            break;
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className={`h-screen flex flex-col bg-background-light dark:bg-background-dark relative ${!isSheetVisible ? 'overflow-hidden' : ''}`}>
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 pt-6 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="bg-white/90 dark:bg-surface-dark/90 backdrop-blur p-2 rounded-full shadow-lg"
          >
            <span className="material-symbols-outlined text-text-light dark:text-text-dark">arrow_back</span>
          </button>
          <div className="bg-white/90 dark:bg-surface-dark/90 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">search</span>
            <input
              type="text"
              placeholder="Search area..."
              className="bg-transparent outline-none text-sm w-32 dark:text-white"
            />
          </div>
          <button
            onClick={getCurrentLocation}
            disabled={isRequestingLocation}
            className="bg-white/90 dark:bg-surface-dark/90 backdrop-blur p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            title="Get my location"
          >
            <span className={`material-symbols-outlined text-text-light dark:text-text-dark ${isRequestingLocation ? 'animate-spin' : ''}`}>
              {isRequestingLocation ? 'sync' : userLocation ? 'my_location' : 'location_searching'}
            </span>
          </button>
        </div>
      </div>

      <div className={`relative overflow-hidden bg-gray-200 transition-all duration-300 ${isSheetVisible ? 'flex-1' : 'h-full'}`}>
        <MapComponent
          supplyPoints={supplyPoints}
          selectedItem={selectedItem}
          isSheetVisible={isSheetVisible}
          userLocation={userLocation}
        />

        {locationError && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1002] bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm text-sm">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-sm mt-0.5">error</span>
              <div className="flex-1">
                <p className="mb-2">{locationError}</p>
                <div className="flex gap-2">
                  <button
                    onClick={getCurrentLocation}
                    className="bg-white text-red-500 px-3 py-1 rounded text-xs font-semibold hover:bg-red-50 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setLocationError(null)}
                    className="text-white/80 hover:text-white text-xs underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                onClick={() => setLocationError(null)}
                className="hover:opacity-70 mt-0.5"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>
        )}

        {!isSheetVisible && (
          <button
            onClick={showSheet}
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1001] bg-white dark:bg-surface-dark px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition-shadow"
          >
            <span className="material-symbols-outlined text-primary">expand_less</span>
            <span className="text-sm font-semibold text-text-light dark:text-text-dark">Show Supplies</span>
          </button>
        )}
      </div>

      <div
        className={`bg-white dark:bg-surface-dark rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-4 pb-8 z-[1000] -mt-6 transition-transform duration-300 ease-out ${isSheetVisible ? 'translate-y-0 relative' : 'translate-y-full absolute bottom-0 left-0 right-0'}`}
      >
        <div
          className="py-3 -mt-4 cursor-grab active:cursor-grabbing select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <div className="w-12 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mx-auto mb-2"></div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">Nearby Supplies</h3>
          <span className="text-xs text-text-muted">Explore items available nearby</span>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
          {supplyPoints.map((item) => (
            <button
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                goToItem(item);
              }}
              className="w-full text-left flex items-center gap-3 p-3 bg-gray-50 dark:bg-background-dark/50 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
            >
              <div className="size-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="material-symbols-outlined">
                  {item.category === 'Medication' ? 'medication' : 'medical_services'}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">{item.name}</h4>
                <p className="text-xs text-text-muted">
                  {item.location} • {item.quantity}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-bold text-text-muted">{item.distance}</span>
                <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {item.category}
                </span>
                {item.availableQuantity < item.totalQuantity && (
                  <span className={`text-[10px] ${item.availableQuantity === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                    {item.availableQuantity}/{item.totalQuantity} avail
                  </span>
                )}
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={(e) => handleRequest(e, item)}
                    disabled={
                      !!(item.donorId && currentUserId && item.donorId.toString() === currentUserId.toString()) ||
                      item.availableQuantity === 0
                    }
                    className={`flex-1 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      item.donorId && currentUserId && item.donorId.toString() === currentUserId.toString()
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : item.availableQuantity === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary-dark shadow-sm'
                    }`}
                  >
                    {item.donorId && currentUserId && item.donorId.toString() === currentUserId.toString() 
                      ? 'Your Item' 
                      : item.availableQuantity === 0 
                      ? 'Unavailable' 
                      : 'Request'}
                  </button>
                  {item.donorId && currentUserId && item.donorId.toString() === currentUserId.toString() && (
                    <button
                      onClick={(e) => handleDelete(e, item)}
                      className="px-2 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex items-center justify-center"
                      title="Delete Supply"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupplyMap;
