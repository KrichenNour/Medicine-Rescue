'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

type SupplyPoint = {
  id: string;
  name: string;
  quantity: string;
  category: string;
  latitude: number;
  longitude: number;
  location: string;
  distance: string;
};

const supplyPoints: SupplyPoint[] = [
  {
    id: 's1',
    name: 'Sterile Bandage',
    quantity: '50 units',
    category: 'Supplies',
    latitude: 36.8065,
    longitude: 10.1815,
    location: 'Pharmacy El Hana',
    distance: '0.8 km',
  },
  {
    id: 's2',
    name: 'Gloves (L)',
    quantity: '200 boxes',
    category: 'Supplies',
    latitude: 36.8001,
    longitude: 10.185,
    location: 'Clinique Sidi',
    distance: '1.4 km',
  },
  {
    id: 's3',
    name: 'Paracetamol 500mg',
    quantity: '100 blisters',
    category: 'Medication',
    latitude: 36.804,
    longitude: 10.182,
    location: 'Association Secours',
    distance: '2.3 km',
  },
  {
    id: 's4',
    name: 'Saline 500ml',
    quantity: '30 units',
    category: 'Supplies',
    latitude: 36.81,
    longitude: 10.17,
    location: 'Hopital Zitouna',
    distance: '3.1 km',
  },
];

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
    
    // Swipe down (positive distance) = hide sheet
    // Swipe up (negative distance) = show sheet
    if (distance > minSwipeDistance && isSheetVisible) {
      setIsSheetVisible(false);
    } else if (distance < -minSwipeDistance && !isSheetVisible) {
      setIsSheetVisible(true);
    }
    
    setIsDragging(false);
    setDragStart(null);
  };

  // Touch handlers
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

  // Mouse handlers for desktop testing
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

  const resetView = () => {
    setSelectedItem(null);
  };

  const showSheet = () => {
    setIsSheetVisible(true);
  };

  const hideSheet = () => {
    setIsSheetVisible(false);
  };

  const getCurrentLocation = () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please use a modern browser.');
      return;
    }

    // Check if we're in a secure context (HTTPS or localhost)
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setLocationError('Geolocation requires a secure connection (HTTPS). Please access this site via HTTPS.');
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
        
        // Use numeric codes for better compatibility
        const errorCode = error.code || error.constructor?.PERMISSION_DENIED;
        
        switch (error.code) {
          case 1: // PERMISSION_DENIED
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location permissions in your browser settings and try again.');
            break;
          case 2: // POSITION_UNAVAILABLE
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable. Please check your GPS/WiFi settings.');
            break;
          case 3: // TIMEOUT
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again.');
            break;
          default:
            // More detailed error message
            const errorMessage = error.message || 'Unknown error';
            setLocationError(`Unable to get your location. ${errorMessage}. Please ensure location services are enabled and try again.`);
            break;
        }
      },
      {
        enableHighAccuracy: false, // Changed to false for better compatibility
        timeout: 15000, // Increased timeout
        maximumAge: 60000, // Accept cached location up to 1 minute old
      }
    );
  };

  return (
    <div className={`h-screen flex flex-col bg-background-light dark:bg-background-dark relative ${
      !isSheetVisible ? 'overflow-hidden' : ''
    }`}>
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
            <span className={`material-symbols-outlined text-text-light dark:text-text-dark ${
              isRequestingLocation ? 'animate-spin' : ''
            }`}>
              {isRequestingLocation ? 'sync' : userLocation ? 'my_location' : 'location_searching'}
            </span>
          </button>
        </div>
      </div>

      <div className={`relative overflow-hidden bg-gray-200 transition-all duration-300 ${
        isSheetVisible ? 'flex-1' : 'h-full'
      }`}>
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
        className={`bg-white dark:bg-surface-dark rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-4 pb-8 z-[1000] -mt-6 transition-transform duration-300 ease-out ${
          isSheetVisible ? 'translate-y-0 relative' : 'translate-y-full absolute bottom-0 left-0 right-0'
        }`}
      >
        {/* Drag Handle Area */}
        <div
          className="py-3 -mt-4 cursor-grab active:cursor-grabbing select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <div className="w-12 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mx-auto mb-2"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              hideSheet();
            }}
            className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
            <span>Swipe down or click to hide</span>
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">Nearby Supplies</h3>
          <span className="text-xs text-text-muted">Pan & zoom the map to explore</span>
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
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupplyMap;
