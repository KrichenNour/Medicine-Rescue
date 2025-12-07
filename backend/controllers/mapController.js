// Map Controller - Handles all map-related API endpoints
const { getArcGISToken, geocodeAddress } = require('../services/arcgisService');
const pool = require('../db');

/**
 * Get map configuration and ArcGIS token for frontend
 */
const getMapConfig = async (req, res) => {
  try {
    const token = await getArcGISToken();
    
    res.json({
      token: token,
      basemap: 'streets-navigation-vector',
      center: [10.1815, 36.8065], // Tunis, Tunisia
      zoom: 12
    });
  } catch (error) {
    console.error('Error getting map config:', error);
    res.status(500).json({ 
      error: 'Failed to get map configuration',
      message: error.message 
    });
  }
};

/**
 * Get all medicine locations for the map
 */
const getMapLocations = async (req, res) => {
  try {
    const { userLat, userLng, radius } = req.query;
    
    let query = `
      SELECT 
        id,
        name,
        category,
        quantity,
        quantity_unit,
        latitude,
        longitude,
        donor_name,
        donor_address,
        donor_type,
        working_hours,
        expiry_date,
        created_at
      FROM medicine 
      WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
    `;
    
    const params = [];
    
    // Filter by radius if user location provided
    if (userLat && userLng && radius) {
      params.push(parseFloat(userLat), parseFloat(userLng), parseFloat(radius));
      query += `
        AND (
          6371 * acos(
            cos(radians($1)) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians($2)) + 
            sin(radians($1)) * 
            sin(radians(latitude))
          )
        ) <= $3
      `;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { rows } = await pool.query(query, params);
    
    // Calculate distance if user location provided
    const locations = rows.map(row => {
      const location = {
        id: row.id,
        name: row.name,
        category: row.category,
        quantity: row.quantity,
        quantity_unit: row.quantity_unit,
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        donor_name: row.donor_name,
        donor_address: row.donor_address,
        donor_type: row.donor_type,
        working_hours: row.working_hours,
        expiry_date: row.expiry_date
      };
      
      if (userLat && userLng) {
        location.distance = calculateDistance(
          parseFloat(userLat),
          parseFloat(userLng),
          parseFloat(row.latitude),
          parseFloat(row.longitude)
        );
      }
      
      return location;
    });
    
    res.json(locations);
  } catch (error) {
    console.error('Error fetching map locations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch locations',
      message: error.message 
    });
  }
};

/**
 * Geocode an address to get coordinates
 */
const geocode = async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    const candidates = await geocodeAddress(address);
    res.json(candidates);
  } catch (error) {
    console.error('Error geocoding:', error);
    res.status(500).json({ 
      error: 'Geocoding failed',
      message: error.message 
    });
  }
};

/**
 * Helper: Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

module.exports = {
  getMapConfig,
  getMapLocations,
  geocode
};
