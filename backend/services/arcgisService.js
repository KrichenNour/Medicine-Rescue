// ArcGIS OAuth 2.0 Service
// Handles authentication and API calls to ArcGIS

const https = require('https');

let cachedToken = null;
let tokenExpiry = null;

/**
 * Get OAuth 2.0 access token from ArcGIS
 */
const getArcGISToken = async () => {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('📌 Using cached ArcGIS token');
    return cachedToken;
  }

  const clientId = process.env.ARCGIS_CLIENT_ID;
  const clientSecret = process.env.ARCGIS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('ArcGIS credentials not configured in .env file');
  }

  console.log('🔑 Requesting new ArcGIS token...');

  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      expiration: '1440' // 24 hours
    }).toString();

    const options = {
      hostname: 'www.arcgis.com',
      path: '/sharing/rest/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            console.error('❌ ArcGIS token error:', response.error);
            reject(new Error(`ArcGIS authentication failed: ${response.error.message || response.error}`));
            return;
          }

          if (!response.access_token) {
            reject(new Error('No access token received from ArcGIS'));
            return;
          }

          cachedToken = response.access_token;
          // Set expiry to 23 hours (buffer of 1 hour)
          tokenExpiry = Date.now() + (response.expires_in - 3600) * 1000;
          
          console.log('✅ ArcGIS token obtained successfully');
          resolve(cachedToken);
        } catch (err) {
          reject(new Error(`Failed to parse ArcGIS response: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`ArcGIS request failed: ${err.message}`));
    });

    req.write(postData);
    req.end();
  });
};

/**
 * Get basemap styles from ArcGIS
 */
const getBasemapStyles = async () => {
  const token = await getArcGISToken();
  
  return new Promise((resolve, reject) => {
    const url = `https://basemaps-api.arcgis.com/arcgis/rest/services/styles/v2/webmaps?token=${token}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          // If API returns unexpected format, use defaults
          if (!parsed.styles || !Array.isArray(parsed.styles)) {
            console.log('⚠️  Using default basemap styles');
            resolve({
              styles: [
                { id: 'streets', name: 'Streets' },
                { id: 'satellite', name: 'Satellite' },
                { id: 'hybrid', name: 'Hybrid' },
                { id: 'topo', name: 'Topographic' },
                { id: 'gray', name: 'Gray Canvas' }
              ]
            });
          } else {
            resolve(parsed);
          }
        } catch (err) {
          console.log('⚠️  Basemap API error, using defaults');
          resolve({
            styles: [
              { id: 'streets', name: 'Streets' },
              { id: 'satellite', name: 'Satellite' },
              { id: 'hybrid', name: 'Hybrid' },
              { id: 'topo', name: 'Topographic' },
              { id: 'gray', name: 'Gray Canvas' }
            ]
          });
        }
      });
    }).on('error', (err) => {
      console.log('⚠️  Basemap API error, using defaults');
      resolve({
        styles: [
          { id: 'streets', name: 'Streets' },
          { id: 'satellite', name: 'Satellite' },
          { id: 'hybrid', name: 'Hybrid' },
          { id: 'topo', name: 'Topographic' },
          { id: 'gray', name: 'Gray Canvas' }
        ]
      });
    });
  });
};

/**
 * Geocode an address (convert address to coordinates)
 */
const geocodeAddress = async (address) => {
  const token = await getArcGISToken();
  
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      address: address,
      f: 'json',
      token: token
    });
    
    const url = `https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?${params}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.candidates || []);
        } catch (err) {
          reject(new Error('Failed to parse geocoding response'));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

/**
 * Test if the token works with a simple API call
 */
const testToken = async () => {
  const token = await getArcGISToken();
  
  return new Promise((resolve) => {
    const url = `https://www.arcgis.com/sharing/rest/portals/self?f=json&token=${token}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            valid: !result.error,
            portalName: result.name,
            user: result.user
          });
        } catch (err) {
          resolve({
            valid: false,
            error: err.message
          });
        }
      });
    }).on('error', (err) => {
      resolve({
        valid: false,
        error: err.message
      });
    });
  });
};

module.exports = {
  getArcGISToken,
  getBasemapStyles,
  geocodeAddress,
  testToken
};
