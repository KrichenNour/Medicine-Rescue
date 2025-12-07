'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type MapView from '@arcgis/core/views/MapView';
import type { MedicineLocation } from '@/services/arcgisService';

const SupplyMap: React.FC = () => {
  const router = useRouter();
  const mapDiv = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  
  const [locations, setLocations] = useState<MedicineLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MedicineLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRadius, setFilterRadius] = useState(50);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure we're on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize map on component mount
  useEffect(() => {
    if (!mounted) return;

    const initMap = async () => {
      if (!mapDiv.current) return;

      try {
        setLoading(true);
        
        // Dynamic import of ArcGIS services (client-side only)
        const { 
          initializeMap, 
          addMarkers, 
          fetchMedicineLocations 
        } = await import('@/services/arcgisService');

        // Initialize map with token from backend
        const { view } = await initializeMap(mapDiv.current);
        viewRef.current = view;

        // Fetch and display locations
        const medicineLocations = await fetchMedicineLocations();
        
        setLocations(medicineLocations);
        
        if (medicineLocations.length > 0) {
          addMarkers(view, medicineLocations);
        }

        // Listen for popup open events - CORRECT SYNTAX
        if (view.popup) {
          view.popup.watch('selectedFeature', (feature: any) => {
            if (feature && feature.graphic && feature.graphic.attributes) {
              setSelectedLocation(feature.graphic.attributes as MedicineLocation);
            }
          });
        }

        // Also listen for view clicks on graphics
        view.on('click', (event) => {
          view.hitTest(event).then((response) => {
            if (response.results.length > 0) {
              const result = response.results[0];
              if ('graphic' in result && result.graphic && result.graphic.attributes) {
                setSelectedLocation(result.graphic.attributes as MedicineLocation);
              }
            }
          });
        });

        setLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setLoading(false);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
      }
    };
  }, [mounted]);

  // Handle location centering
  const handleCenterOnUser = async () => {
    if (!viewRef.current || !mounted) return;

    try {
      const { centerOnUserLocation, fetchMedicineLocations, clearMarkers, addMarkers } = await import('@/services/arcgisService');
      
      const position = await centerOnUserLocation(viewRef.current);
      setUserLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude
      });

      // Refresh locations based on user location
      const nearbyLocations = await fetchMedicineLocations(
        position.coords.latitude,
        position.coords.longitude,
        filterRadius
      );
      
      setLocations(nearbyLocations);
      
      if (viewRef.current) {
        clearMarkers(viewRef.current);
        addMarkers(viewRef.current, nearbyLocations);
      }
    } catch (error) {
      console.error('Error getting user location:', error);
      alert('Unable to get your location. Please enable location services.');
    }
  };

  // Handle search
  const handleSearch = async (query: string) => {
    if (!mounted) return;
    
    setSearchQuery(query);
    
    const { clearMarkers, addMarkers } = await import('@/services/arcgisService');
    
    if (!query.trim()) {
      // Reset to all locations
      if (viewRef.current) {
        clearMarkers(viewRef.current);
        addMarkers(viewRef.current, locations);
      }
      return;
    }

    // Filter locations by search query
    const filtered = locations.filter(loc => 
      loc.name.toLowerCase().includes(query.toLowerCase()) ||
      loc.donor_name?.toLowerCase().includes(query.toLowerCase()) ||
      loc.category?.toLowerCase().includes(query.toLowerCase())
    );

    if (viewRef.current) {
      clearMarkers(viewRef.current);
      addMarkers(viewRef.current, filtered);
    }
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    if (viewRef.current) {
      viewRef.current.zoom = viewRef.current.zoom + 1;
    }
  };

  const handleZoomOut = () => {
    if (viewRef.current) {
      viewRef.current.zoom = viewRef.current.zoom - 1;
    }
  };

  // Get nearby locations for bottom sheet
  const nearbyLocations = locations.slice(0, 5);

  // Don't render until mounted (avoid SSR issues)
  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-surface-dark rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-lg font-semibold">Loading map...</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-6 bg-gradient-to-b from-black/50 to-transparent">
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
                   placeholder="Search supplies..." 
                   className="bg-transparent outline-none text-sm w-32 dark:text-white" 
                   value={searchQuery}
                   onChange={(e) => handleSearch(e.target.value)}
                 />
            </div>
            <button className="bg-white/90 dark:bg-surface-dark/90 backdrop-blur p-2 rounded-full shadow-lg">
                <span className="material-symbols-outlined text-text-light dark:text-text-dark">layers</span>
            </button>
        </div>
      </div>

      {/* ArcGIS Map Container */}
      <div ref={mapDiv} className="flex-1 w-full h-full" />

      {/* Map Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        <button 
          onClick={handleZoomIn}
          className="bg-white dark:bg-surface-dark p-2 rounded-lg shadow-xl text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
        <button 
          onClick={handleZoomOut}
          className="bg-white dark:bg-surface-dark p-2 rounded-lg shadow-xl text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="material-symbols-outlined">remove</span>
        </button>
        <button 
          onClick={handleCenterOnUser}
          className="bg-white dark:bg-surface-dark p-2 rounded-lg shadow-xl text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mt-2"
        >
          <span className="material-symbols-outlined">my_location</span>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute left-4 bottom-32 bg-white/90 dark:bg-surface-dark/90 backdrop-blur rounded-lg shadow-lg p-3 z-10">
        <h4 className="text-xs font-bold mb-2 text-text-light dark:text-text-dark">Donor Types</h4>
        <div className="space-y-1">
          {[
            { type: 'Hospital', color: '#DC2626', label: 'Hospital' },
            { type: 'Clinic', color: '#4A90E2', label: 'Clinic' },
            { type: 'Pharmacy', color: '#008080', label: 'Pharmacy' },
            { type: 'NGO', color: '#8B5CF6', label: 'NGO' },
            { type: 'Other', color: '#10B981', label: 'Other' }
          ].map(({ type, color, label }) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-xs text-text-light dark:text-text-dark">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sheet Summary */}
      <div className="bg-white dark:bg-surface-dark rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-4 pb-8 z-10 relative">
         <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
         <div className="flex items-center justify-between mb-3">
           <h3 className="font-bold text-lg">
             {searchQuery ? 'Search Results' : `Nearby Supplies (${filterRadius}km)`}
           </h3>
           <span className="text-sm text-text-muted">{locations.length} found</span>
         </div>
         
         {nearbyLocations.length === 0 ? (
           <div className="text-center py-8">
             <span className="material-symbols-outlined text-4xl text-text-muted mb-2">search_off</span>
             <p className="text-text-muted">No supplies found nearby</p>
             <button 
               onClick={handleCenterOnUser}
               className="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold"
             >
               Use My Location
             </button>
           </div>
         ) : (
           <div className="space-y-2 max-h-48 overflow-y-auto">
             {nearbyLocations.map((location) => {
               const expiryDate = location.expiry_date 
                 ? new Date(location.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                 : 'N/A';
               
               return (
                 <div 
                   key={location.id} 
                   className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-background-dark/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-background-dark transition-colors"
                   onClick={() => {
                     if (viewRef.current && location.latitude && location.longitude) {
                       viewRef.current.center = [location.longitude, location.latitude];
                       viewRef.current.zoom = 15;
                       setSelectedLocation(location);
                     }
                   }}
                 >
                   <div className="size-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                     <span className="material-symbols-outlined text-primary">
                       {location.category?.toLowerCase().includes('medication') ? 'medication' : 'medical_services'}
                     </span>
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-sm truncate">{location.name}</h4>
                     <p className="text-xs text-text-muted truncate">
                       {location.donor_name || 'Unknown Donor'} • {location.quantity} {location.quantity_unit || 'units'}
                     </p>
                     <p className="text-xs text-text-muted">Exp: {expiryDate}</p>
                   </div>
                   {location.distance !== undefined && (
                     <span className="text-xs font-bold text-text-muted whitespace-nowrap">
                       {location.distance.toFixed(1)}km
                     </span>
                   )}
                 </div>
               );
             })}
           </div>
         )}
      </div>
    </div>
  );
};

export default SupplyMap;