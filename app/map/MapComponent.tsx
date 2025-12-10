'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

interface MapComponentProps {
  supplyPoints: SupplyPoint[];
  selectedItem: SupplyPoint | null;
  isSheetVisible: boolean;
  userLocation: { lat: number; lng: number } | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ supplyPoints, selectedItem, isSheetVisible, userLocation }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const userLocationCircleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [36.8065, 10.1815],
      zoom: 13,
      zoomControl: false,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Custom marker icons
    const createIcon = (color: string) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });
    };

    // Add markers for each supply point
    supplyPoints.forEach((item) => {
      const color = item.category === 'Medication' ? '#8b5cf6' : '#2563eb';
      const marker = L.marker([item.latitude, item.longitude], {
        icon: createIcon(color),
      }).addTo(map);

      marker.bindPopup(`
        <div style="min-width: 150px;">
          <h3 style="font-weight: bold; margin: 0 0 4px 0;">${item.name}</h3>
          <p style="margin: 0; color: #666;">${item.location}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px;">
            <strong>Qty:</strong> ${item.quantity}<br/>
            <strong>Category:</strong> ${item.category}
          </p>
        </div>
      `);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [supplyPoints]);

  // Handle selected item changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedItem) {
      mapRef.current.setView([selectedItem.latitude, selectedItem.longitude], 15, {
        animate: true,
        duration: 0.5,
      });
    } else {
      mapRef.current.setView([36.8065, 10.1815], 13, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [selectedItem]);

  // Handle user location changes
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    // Remove existing user location marker and circle
    if (userLocationMarkerRef.current) {
      mapRef.current.removeLayer(userLocationMarkerRef.current);
    }
    if (userLocationCircleRef.current) {
      mapRef.current.removeLayer(userLocationCircleRef.current);
    }

    // User location icon
    const userLocationIcon = L.divIcon({
      className: 'user-location-marker',
      html: `<div style="
        background-color: #2563eb;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(37,99,235,0.5);
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    // Create accuracy circle
    const circle = L.circle([userLocation.lat, userLocation.lng], {
      color: '#2563eb',
      fillColor: '#2563eb',
      fillOpacity: 0.1,
      radius: 50, // 50 meter radius
      weight: 2,
    }).addTo(mapRef.current);
    userLocationCircleRef.current = circle;

    // Create user location marker
    const marker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userLocationIcon,
      zIndexOffset: 1000,
    }).addTo(mapRef.current);

    marker.bindPopup('<div><strong>Your Location</strong></div>');
    userLocationMarkerRef.current = marker;

    // Center map on user location
    mapRef.current.setView([userLocation.lat, userLocation.lng], 15, {
      animate: true,
      duration: 0.5,
    });

    return () => {
      if (userLocationMarkerRef.current) {
        mapRef.current?.removeLayer(userLocationMarkerRef.current);
      }
      if (userLocationCircleRef.current) {
        mapRef.current?.removeLayer(userLocationCircleRef.current);
      }
    };
  }, [userLocation]);

  // Adjust map size when sheet visibility changes
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Force map to recalculate its size when sheet visibility changes
    const timeoutId = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize(false);
        // Also trigger a resize event to ensure proper recalculation
        window.dispatchEvent(new Event('resize'));
      }
    }, 350); // Wait for animation to complete
    
    return () => clearTimeout(timeoutId);
  }, [isSheetVisible]);

  return <div ref={mapContainerRef} className="absolute inset-0" style={{ zIndex: 1 }} />;
};

export default MapComponent;

