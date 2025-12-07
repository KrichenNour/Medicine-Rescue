// Map Routes - API endpoints for map functionality
const express = require('express');
const router = express.Router();
const { getMapConfig, getMapLocations, geocode } = require('../controllers/mapController');
const authenticate = require('../middleware/auth');

// Public endpoint to get map configuration with ArcGIS token
router.get('/config', getMapConfig);

// Get all medicine locations (protected)
router.get('/locations', authenticate, getMapLocations);

// Geocode an address (protected)
router.get('/geocode', authenticate, geocode);

module.exports = router;
