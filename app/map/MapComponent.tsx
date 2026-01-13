'use client';

import { useEffect, useRef, useState } from 'react';
import ArcGISMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Point from '@arcgis/core/geometry/Point';
import Circle from '@arcgis/core/geometry/Circle';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import esriConfig from '@arcgis/core/config';
import Basemap from '@arcgis/core/Basemap';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';

// Import ArcGIS CSS
import '@arcgis/core/assets/esri/themes/light/main.css';

import IdentityManager from '@arcgis/core/identity/IdentityManager';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';

// OAuth 2.0 Configuration
const CLIENT_ID = "fxPSWAvIQRjaCA5I";

// Configure OAuth 2.0
let oAuthConfigured = false;

const configureOAuth = () => {
  if (oAuthConfigured || typeof window === 'undefined') return;

  const callbackUrl = `${window.location.origin}/oauth-callback.html`;

  const oAuthInfo = new OAuthInfo({
    appId: CLIENT_ID,
    popup: true,
    portalUrl: "https://www.arcgis.com",
    flowType: "implicit",
    popupCallbackUrl: callbackUrl,
  });

  IdentityManager.registerOAuthInfos([oAuthInfo]);
  esriConfig.portalUrl = "https://www.arcgis.com";
  oAuthConfigured = true;

  console.log('OAuth configured with callback URL:', callbackUrl);
};

// Create a custom basemap using OpenStreetMap (no auth required)
const createBasemap = () => {
  return new Basemap({
    baseLayers: [
      new VectorTileLayer({
        url: "https://basemaps.arcgis.com/arcgis/rest/services/OpenStreetMap_v2/VectorTileServer"
      })
    ],
    title: "OpenStreetMap",
    id: "osm"
  });
};

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const markersLayerRef = useRef<GraphicsLayer | null>(null);
  const userLocationLayerRef = useRef<GraphicsLayer | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map without requiring OAuth first
  useEffect(() => {
    if (!mapContainerRef.current || viewRef.current) return;

    // Configure OAuth for when we need authenticated services
    configureOAuth();

    // Use OpenStreetMap basemap which doesn't require authentication
    const map = new ArcGISMap({
      basemap: createBasemap(),
    });

    const view = new MapView({
      container: mapContainerRef.current,
      map: map,
      center: [10.1815, 36.8065],
      zoom: 13,
      ui: {
        components: ['attribution'],
      },
    });

    // Handle initialization
    view.when(() => {
      console.log('Map View loaded successfully');
      setMapLoaded(true);
    }, (error: any) => {
      console.error('Map View failed to load:', error);
      setMapError('Failed to load map. Please refresh the page.');
    });

    // Add zoom control to bottom right
    view.ui.add('zoom', 'bottom-right');

    const markersLayer = new GraphicsLayer();
    const userLocationLayer = new GraphicsLayer();
    map.addMany([markersLayer, userLocationLayer]);

    markersLayerRef.current = markersLayer;
    userLocationLayerRef.current = userLocationLayer;
    viewRef.current = view;

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  // Update markers when supplyPoints change
  useEffect(() => {
    if (!viewRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.removeAll();

    const graphics = supplyPoints.map((item) => {
      const color = item.category === 'Medication' ? [139, 92, 246] : [37, 99, 235]; // RGB for #8b5cf6 and #2563eb

      const point = new Point({
        longitude: item.longitude,
        latitude: item.latitude,
      });

      const symbol = new SimpleMarkerSymbol({
        color: color,
        outline: {
          color: [255, 255, 255],
          width: 2,
        },
        size: 14,
      });

      const popupTemplate = {
        title: item.name,
        content: `
          <div style="font-family: inherit;">
            <p style="margin: 0; color: #666;">${item.location}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px;">
              <strong>Qty:</strong> ${item.quantity}<br/>
              <strong>Category:</strong> ${item.category}
            </p>
          </div>
        `,
      };

      return new Graphic({
        geometry: point,
        symbol: symbol,
        attributes: item,
        popupTemplate: popupTemplate,
      });
    });

    markersLayerRef.current.addMany(graphics);
  }, [supplyPoints]);

  // Handle selected item changes
  useEffect(() => {
    if (!viewRef.current || !selectedItem) return;

    viewRef.current.goTo({
      target: [selectedItem.longitude, selectedItem.latitude],
      zoom: 15,
    }, {
      duration: 500,
      easing: 'ease-in-out',
    });

    // Optionally open popup
    const graphic = markersLayerRef.current?.graphics.find(g => g.attributes.id === selectedItem.id);
    if (graphic && viewRef.current?.popup) {
      viewRef.current.popup.open({
        features: [graphic],
        location: graphic.geometry as Point,
      });
    }
  }, [selectedItem]);

  // Handle user location changes
  useEffect(() => {
    if (!viewRef.current || !userLocationLayerRef.current || !userLocation) return;

    userLocationLayerRef.current.removeAll();

    const userPoint = new Point({
      longitude: userLocation.lng,
      latitude: userLocation.lat,
    });

    // Accuracy Circle
    const circleGeometry = new Circle({
      center: userPoint,
      radius: 50,
      radiusUnit: 'meters',
    });

    const circleGraphic = new Graphic({
      geometry: circleGeometry,
      symbol: new SimpleFillSymbol({
        color: [37, 99, 235, 0.1],
        outline: {
          color: [37, 99, 235, 0.5],
          width: 1,
        },
      }),
    });

    // Location Marker
    const markerGraphic = new Graphic({
      geometry: userPoint,
      symbol: new SimpleMarkerSymbol({
        color: [37, 99, 235],
        outline: {
          color: [255, 255, 255],
          width: 2,
        },
        size: 12,
      }),
      popupTemplate: {
        title: "Your Location",
        content: "You are here",
      },
    });

    userLocationLayerRef.current.addMany([circleGraphic, markerGraphic]);

    // Center map on user location
    viewRef.current.goTo({
      target: [userLocation.lng, userLocation.lat],
      zoom: 15,
    }, {
      duration: 500,
    });
  }, [userLocation]);

  // Adjust map size when sheet visibility changes
  useEffect(() => {
    if (!viewRef.current) return;

    const timeoutId = setTimeout(() => {
      // ArcGIS view handles container resizing somewhat automatically, 
      // but we can trigger a refresh if needed.
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [isSheetVisible]);

  return (
    <div className="absolute inset-0">
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center p-4">
            <p className="text-red-500 mb-4">{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center p-4">
            <p className="text-gray-600">Loading map...</p>
            <div className="mt-2 animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </div>
      )}
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      />
      <style jsx global>{`
        .esri-view {
          background-color: transparent !important;
        }
        .esri-ui-corner .esri-component {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .esri-zoom .esri-widget--button {
          background-color: white !important;
          color: #333 !important;
        }
        .esri-zoom .esri-widget--button:hover {
          background-color: #f4f4f4 !important;
        }
        .esri-popup__main-container {
          border-radius: 16px !important;
        }
      `}</style>
    </div>
  );
};

export default MapComponent;
