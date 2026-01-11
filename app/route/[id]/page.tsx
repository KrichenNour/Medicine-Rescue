'use client'

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('../../map/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
      <div className="bg-white dark:bg-surface-dark px-4 py-3 rounded-xl shadow">
        <p className="text-sm font-semibold">Loading map...</p>
      </div>
    </div>
  ),
});

interface Supply {
  _id: string;
  name: string;
  description?: string;
  quantity: number;
  quantity_unit?: string;
  expiry_date?: string;
  distance_km?: number;
  image_url?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  donor?: string | { _id: string; email: string };
  available_quantity?: number; // Available after pending requests
}

const RequestSupply: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const supplyId = params?.id as string;

  const [supply, setSupply] = useState<Supply | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestQuantity, setRequestQuantity] = useState<string>('1');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    // Extract user ID from token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id || payload._id || (payload.user && (payload.user.id || payload.user._id));
      setCurrentUserId(userId || null);
    } catch (e) {
      console.error('Failed to parse token', e);
    }

    const fetchSupply = async () => {
      try {
        const res = await fetch(`http://localhost:4000/stock/${supplyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 404) {
            setError('Supply not found');
          } else {
            setError('Failed to load supply details');
          }
          return;
        }

        const data = await res.json();
        setSupply(data);
        setRequestQuantity('1');
      } catch (err: any) {
        console.error(err);
        setError('Failed to load supply details');
      } finally {
        setLoading(false);
      }
    };

    if (supplyId) {
      fetchSupply();
    }
  }, [supplyId, router]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }
  }, []);

  const handleRequest = async () => {
    if (!supply) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    // Check if user is the donor
    const donorId = supply.donor ? (typeof supply.donor === 'string' ? supply.donor : supply.donor._id) : null;
    if (donorId && currentUserId && donorId.toString() === currentUserId.toString()) {
      setError('You cannot request your own supply');
      return;
    }

    const qty = parseInt(requestQuantity);
    if (!requestQuantity || qty <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    // Check against available quantity (accounting for pending requests)
    const availableQty = supply.available_quantity ?? supply.quantity;
    if (qty > availableQty) {
      setError(`Only ${availableQty} ${supply.quantity_unit || 'units'} available for request`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:4000/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicine_id: supply._id,
          medicine_name: supply.name,
          quantity: requestQuantity,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create request');
      }

      // Success - redirect to requests page
      router.push('/requests');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading supply details...</p>
        </div>
      </div>
    );
  }

  if (error && !supply) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
        <div className="text-center">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!supply) {
    return null;
  }

  const donorId = supply.donor ? (typeof supply.donor === 'string' ? supply.donor : supply.donor._id) : null;
  const isOwnSupply = donorId && currentUserId && donorId.toString() === currentUserId.toString();
  const availableQty = supply.available_quantity ?? supply.quantity;
  const hasPendingRequests = availableQty < supply.quantity;

  // Prepare supply point for map
  const supplyPoint = supply.latitude && supply.longitude ? {
    id: supply._id,
    name: supply.name,
    quantity: `${supply.quantity} ${supply.quantity_unit || ''}`,
    category: supply.category || 'Supplies',
    latitude: supply.latitude,
    longitude: supply.longitude,
    location: 'Supplier Location',
    distance: supply.distance_km ? `${supply.distance_km} km` : '',
    donorId: donorId || '',
  } : null;

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-background-light dark:bg-background-dark">
      {/* Map Section - Full height on desktop, partial on mobile */}
      <div className="relative flex-1 lg:flex-[2] min-h-[40vh] lg:min-h-full">
        {supplyPoint ? (
          <MapComponent
            supplyPoints={[supplyPoint]}
            selectedItem={supplyPoint}
            isSheetVisible={false}
            userLocation={userLocation}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
            <div className="text-center p-4">
              <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">location_off</span>
              <p className="text-text-muted">No location data available</p>
            </div>
          </div>
        )}

        {/* Back button overlay */}
        <div className="absolute top-4 left-4 z-[1000]">
          <button
            onClick={() => router.back()}
            className="bg-white/90 dark:bg-surface-dark/90 backdrop-blur p-2 rounded-full shadow-lg"
          >
            <span className="material-symbols-outlined text-text-light dark:text-text-dark">arrow_back</span>
          </button>
        </div>

        {/* Location button overlay */}
        <div className="absolute top-4 right-4 z-[1000]">
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                  (err) => console.error(err)
                );
              }
            }}
            className="bg-white/90 dark:bg-surface-dark/90 backdrop-blur p-2 rounded-full shadow-lg"
          >
            <span className="material-symbols-outlined text-text-light dark:text-text-dark">
              {userLocation ? 'my_location' : 'location_searching'}
            </span>
          </button>
        </div>
      </div>

      {/* Request Form Section */}
      <div className="flex-1 lg:max-w-md bg-background-light dark:bg-background-dark lg:border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-6">
            Request Supply
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Item Details */}
          <div className="mb-6 p-4 bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4 mb-4">
              {supply.image_url ? (
                <img 
                  src={supply.image_url} 
                  alt={supply.name}
                  className="size-20 rounded-lg object-cover"
                />
              ) : (
                <div className="size-20 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-4xl">medical_services</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-text-light dark:text-text-dark mb-1">{supply.name}</h3>
                {supply.description && (
                  <p className="text-sm text-text-muted mb-2 line-clamp-2">{supply.description}</p>
                )}
                {supply.category && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                    {supply.category}
                  </span>
                )}
              </div>
            </div>

            {/* Stock Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-text-muted text-xs mb-1">Total Stock</p>
                <p className="font-bold text-text-light dark:text-text-dark">
                  {supply.quantity} {supply.quantity_unit || 'units'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${hasPendingRequests ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                <p className="text-text-muted text-xs mb-1">Available</p>
                <p className={`font-bold ${hasPendingRequests ? 'text-amber-600' : 'text-green-600'}`}>
                  {availableQty} {supply.quantity_unit || 'units'}
                </p>
              </div>
            </div>

            {hasPendingRequests && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                {supply.quantity - availableQty} {supply.quantity_unit || 'units'} pending in other requests
              </p>
            )}

            {supply.expiry_date && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-text-muted">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">event</span>
                  Expires: {new Date(supply.expiry_date).toLocaleDateString()}
                </p>
              </div>
            )}

            {supply.distance_km && (
              <p className="text-xs text-text-muted mt-2">
                <span className="material-symbols-outlined text-sm align-middle mr-1">location_on</span>
                {supply.distance_km} km away
              </p>
            )}
          </div>

          {/* Quantity Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-text-light dark:text-text-dark mb-2">
              Request Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const qty = Math.max(1, parseInt(requestQuantity) - 1);
                  setRequestQuantity(qty.toString());
                }}
                disabled={parseInt(requestQuantity) <= 1}
                className="size-12 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <input
                type="number"
                min="1"
                max={availableQty}
                value={requestQuantity}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= availableQty)) {
                    setRequestQuantity(val);
                  }
                }}
                className="flex-1 h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-center font-bold text-lg text-text-light dark:text-text-dark"
              />
              <button
                onClick={() => {
                  const qty = Math.min(availableQty, parseInt(requestQuantity) + 1);
                  setRequestQuantity(qty.toString());
                }}
                disabled={parseInt(requestQuantity) >= availableQty}
                className="size-12 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <p className="text-xs text-text-muted mt-2 text-center">
              Maximum available: {availableQty} {supply.quantity_unit || 'units'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl font-bold text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRequest}
              disabled={submitting || isOwnSupply || availableQty === 0}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-colors ${
                isOwnSupply || availableQty === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : submitting
                  ? 'bg-primary/70 cursor-wait'
                  : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {submitting ? 'Submitting...' : isOwnSupply ? 'Your Supply' : availableQty === 0 ? 'Not Available' : 'Request Supply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestSupply;