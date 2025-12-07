// services/arcgisService.ts
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import esriConfig from '@arcgis/core/config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface MedicineLocation {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  quantity_unit?: string;
  expiry_date?: string;
  category?: string;
  latitude: number;
  longitude: number;
  donor_name?: string;
  donor_address?: string;
  donor_type?: string;
  working_hours?: string;
  distance?: number;
}

export interface MapConfig {
  token: string;
  basemap: string;
  center: [number, number];
  zoom: number;
}

/**
 * Get map configuration from backend (includes ArcGIS token)
 */
export const getMapConfig = async (): Promise<MapConfig> => {
  try {
    const response = await fetch(`${API_URL}/map/config`);
    
    if (!response.ok) {
      throw new Error('Failed to get map configuration');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting map config:', error);
    throw error;
  }
};

/**
 * Initialize ArcGIS Map with token from backend
 */
export const initializeMap = async (container: HTMLDivElement) => {
  try {
    // Get configuration with token from backend
    const config = await getMapConfig();
    
    // Set the token from backend (kept secret on server)
    esriConfig.apiKey = config.token;

    const map = new Map({
      basemap: config.basemap
    });

    const view = new MapView({
      container,
      map,
      center: config.center,
      zoom: config.zoom,
      constraints: {
        minZoom: 8,
        maxZoom: 18
      },
      popup: {
        dockEnabled: true,
        dockOptions: {
          buttonEnabled: false,
          breakpoint: false
        }
      }
    });

    return { map, view };
  } catch (error) {
    console.error('Error initializing map:', error);
    throw error;
  }
};

/**
 * Create a marker symbol based on donor type
 */
const getMarkerSymbol = (donorType?: string): SimpleMarkerSymbol => {
  const colorMap: Record<string, [number, number, number]> = {
    'Hospital': [220, 38, 38],      // Red
    'Clinic': [74, 144, 226],       // Blue
    'Pharmacy': [0, 128, 128],      // Teal
    'NGO': [139, 92, 246],          // Purple
    'default': [16, 185, 129]       // Green
  };

  const color = colorMap[donorType || 'default'] || colorMap['default'];

  return new SimpleMarkerSymbol({
    color,
    size: 14,
    outline: {
      color: [255, 255, 255],
      width: 2
    }
  });
};

/**
 * Create popup template for medicine location
 */
const createPopupTemplate = (location: MedicineLocation): PopupTemplate => {
  const expiryDate = location.expiry_date 
    ? new Date(location.expiry_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A';

  return new PopupTemplate({
    title: '{name}',
    content: `
      <div style="padding: 8px;">
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Donor:</strong> 
          <span>${location.donor_name || 'Unknown'}</span>
          ${location.donor_type ? `<span style="background: #E5E7EB; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 6px;">${location.donor_type}</span>` : ''}
        </div>
        
        ${location.donor_address ? `
          <div style="margin-bottom: 12px;">
            <strong style="color: #374151;">Address:</strong> 
            <span>${location.donor_address}</span>
          </div>
        ` : ''}
        
        ${location.working_hours ? `
          <div style="margin-bottom: 12px;">
            <strong style="color: #374151;">Hours:</strong> 
            <span>${location.working_hours}</span>
          </div>
        ` : ''}
        
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Quantity:</strong> 
          <span>${location.quantity} ${location.quantity_unit || 'units'}</span>
        </div>
        
        ${location.category ? `
          <div style="margin-bottom: 12px;">
            <strong style="color: #374151;">Category:</strong> 
            <span>${location.category}</span>
          </div>
        ` : ''}
        
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Expiry:</strong> 
          <span>${expiryDate}</span>
        </div>
        
        ${location.distance !== undefined ? `
          <div style="margin-bottom: 12px;">
            <strong style="color: #374151;">Distance:</strong> 
            <span>${location.distance.toFixed(1)} km</span>
          </div>
        ` : ''}
        
        ${location.description ? `
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 13px; margin: 0;">${location.description}</p>
          </div>
        ` : ''}
      </div>
    `
  });
};

/**
 * Add a marker to the map for a medicine location
 */
export const addMarker = (view: MapView, location: MedicineLocation): Graphic => {
  const point = new Point({
    longitude: location.longitude,
    latitude: location.latitude
  });

  const marker = new Graphic({
    geometry: point,
    symbol: getMarkerSymbol(location.donor_type),
    attributes: location,
    popupTemplate: createPopupTemplate(location)
  });

  view.graphics.add(marker);
  return marker;
};

/**
 * Add multiple markers to the map
 */
export const addMarkers = (view: MapView, locations: MedicineLocation[]): Graphic[] => {
  const graphics = locations.map(location => {
    const point = new Point({
      longitude: location.longitude,
      latitude: location.latitude
    });

    return new Graphic({
      geometry: point,
      symbol: getMarkerSymbol(location.donor_type),
      attributes: location,
      popupTemplate: createPopupTemplate(location)
    });
  });

  view.graphics.addMany(graphics);
  return graphics;
};

/**
 * Clear all markers from the map
 */
export const clearMarkers = (view: MapView): void => {
  view.graphics.removeAll();
};

/**
 * Fetch medicine locations from backend API
 */
export const fetchMedicineLocations = async (
  userLat?: number,
  userLng?: number,
  radius?: number
): Promise<MedicineLocation[]> => {
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    
    if (userLat !== undefined && userLng !== undefined) {
      params.append('userLat', userLat.toString());
      params.append('userLng', userLng.toString());
    }
    
    if (radius) {
      params.append('radius', radius.toString());
    }
    
    const url = `${API_URL}/map/locations${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching medicine locations:', error);
    return [];
  }
};

/**
 * Center map on user's location
 */
export const centerOnUserLocation = (view: MapView): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        view.center = [position.coords.longitude, position.coords.latitude];
        view.zoom = 13;
        resolve(position);
      },
      (error) => {
        reject(error);
      }
    );
  });
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Donor type colors for legend
 */
export const donorTypeColors = {
  'Hospital': { color: '#DC2626', label: 'Hospital' },
  'Clinic': { color: '#4A90E2', label: 'Clinic' },
  'Pharmacy': { color: '#008080', label: 'Pharmacy' },
  'NGO': { color: '#8B5CF6', label: 'NGO' },
  'Other': { color: '#10B981', label: 'Other' }
};
