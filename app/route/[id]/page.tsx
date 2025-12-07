'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type MapView from '@arcgis/core/views/MapView';
import type { MedicineLocation } from '@/services/arcgisService';

const RouteETA: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const mapDiv = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<any>(null);
  const [locations, setLocations] = useState<MedicineLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MedicineLocation | null>(null);

  // Ensure we're on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch request details
  useEffect(() => {
    if (!mounted) return;

    const fetchRequest = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth');
          return;
        }

        const res = await fetch(`http://localhost:4000/requests/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setRequest(data);
        }
      } catch (error) {
        console.error('Error fetching request:', error);
      }
    };

    fetchRequest();
  }, [mounted, params.id, router]);

  // Initialize map
  useEffect(() => {
    if (!mounted || !mapDiv.current) return;

    const initMap = async () => {
      try {
        setLoading(true);
        
        const { 
          initializeMap, 
          addMarkers, 
          fetchMedicineLocations 
        } = await import('@/services/arcgisService');

        const { view } = await initializeMap(mapDiv.current!);
        viewRef.current = view;

        // Fetch matching locations for the request
        const medicineLocations = await fetchMedicineLocations();
        setLocations(medicineLocations);
        
        if (medicineLocations.length > 0) {
          addMarkers(view, medicineLocations);
          
          // Auto-select first location
          if (!selectedLocation) {
            setSelectedLocation(medicineLocations[0]);
            view.center = [medicineLocations[0].longitude, medicineLocations[0].latitude];
            view.zoom = 14;
          }
        }

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

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
      }
    };
  }, [mounted, selectedLocation]);

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
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark relative max-w-md mx-auto">
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

      {/* ArcGIS Map Container */}
      <div ref={mapDiv} className="absolute inset-0 z-0" />

      {/* Top Search Bar */}
      <div className="relative z-10 px-4 pt-4">
        <div className="flex bg-white dark:bg-surface-dark rounded-xl shadow-lg h-12 items-center px-4">
            <button onClick={() => router.back()} className="mr-2">
                <span className="material-symbols-outlined text-gray-500">arrow_back</span>
            </button>
            <input className="flex-1 bg-transparent outline-none dark:text-white" placeholder="Search for supplies..." />
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark rounded-t-3xl shadow-2xl p-6 pb-8 z-20">
         <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
         
         <h2 className="text-3xl font-bold text-text-light dark:text-text-dark mb-4">
           {selectedLocation?.distance ? `${selectedLocation.distance.toFixed(1)} km away` : 'Select a location'}
         </h2>
         
         {/* Progress Bar */}
         <div className="flex gap-1 mb-2">
            <div className="h-1.5 flex-1 bg-primary rounded-full"></div>
            <div className="h-1.5 flex-1 bg-primary rounded-full"></div>
            <div className="h-1.5 flex-1 bg-primary rounded-full"></div>
            <div className="h-1.5 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
         </div>
         <div className="flex justify-between text-xs font-bold text-primary mb-6">
            <span>Request</span>
            <span>Matching</span>
            <span>Map View</span>
            <span className="text-gray-400">Route</span>
         </div>

         {/* Item Details */}
         {selectedLocation ? (
           <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center gap-4">
                  <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">medical_services</span>
                  </div>
                  <div>
                      <h3 className="font-bold text-text-light dark:text-text-dark">{selectedLocation.name}</h3>
                      <p className="text-sm text-text-muted">
                        {selectedLocation.quantity} {selectedLocation.quantity_unit || 'units'} | {selectedLocation.donor_name || 'Unknown'}
                      </p>
                      {selectedLocation.donor_address && (
                        <p className="text-xs text-text-muted mt-1">{selectedLocation.donor_address}</p>
                      )}
                  </div>
              </div>
              <button 
                onClick={() => router.push('/map')}
                className="size-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg"
              >
                  <span className="material-symbols-outlined">navigation</span>
              </button>
           </div>
         ) : (
           <div className="text-center py-4 border-t border-gray-200 dark:border-gray-700">
             <p className="text-text-muted">Click on a marker to see details</p>
           </div>
         )}
      </div>

      {/* FAB */}
      <div className="absolute bottom-[240px] right-4 z-20">
         <button 
           onClick={() => router.push('/map')}
           className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full shadow-xl font-bold"
         >
            <span className="material-symbols-outlined">list_alt</span>
            {locations.length} Available
         </button>
      </div>
    </div>
  );
};

export default RouteETA;