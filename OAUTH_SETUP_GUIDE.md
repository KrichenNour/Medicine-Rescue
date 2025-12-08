# 🗺️ ArcGIS OAuth 2.0 Setup - Complete Guide

## ✅ Implementation Complete!

Your Medicine Rescue app now uses **OAuth 2.0 server-side authentication** for ArcGIS maps. This is more secure because:

- 🔒 Credentials stay secret on your backend
- 🌐 Frontend gets tokens through your API
- 👥 Users don't need ArcGIS accounts
- ♻️ Token caching reduces API calls

---

## 📋 Setup Steps

### Step 1: Get OAuth 2.0 Credentials (5 minutes)

1. **Go to**: https://developers.arcgis.com/applications
2. **Sign in** or create a free account
3. **Create new application**:
   - Click "New Application"
   - Name: `Medicine Rescue`
   - Click "Create"
4. **Get credentials**:
   - Click on your application
   - Note the **Client ID**
   - Click "Show" next to **Client Secret** and copy it
5. **Configure OAuth 2.0**:
   - Scroll to "Redirect URLs"
   - Add: `http://localhost:3000`
   - Add: `http://localhost:4000` (for testing)
   - Click "Add" then "Save"

### Step 2: Configure Backend Environment

Edit `backend/.env`:

```env
PG_USER=postgres
PG_PASSWORD=postgres
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=location_analytics_project
JWT_SECRET=VotreSecretPourJWT
PORT=4000

# ArcGIS OAuth 2.0 Credentials
ARCGIS_CLIENT_ID=paste_your_client_id_here
ARCGIS_CLIENT_SECRET=paste_your_client_secret_here
```

### Step 3: Test OAuth 2.0 Connection

```bash
cd backend
node testOAuth.js
```

**Expected output:**
```
✅ Token obtained: AAPTxy8BH1VE...
✅ Successfully fetched 40+ basemap styles
✅ OAuth 2.0 setup is working correctly!
```

### Step 4: Import CSV Data

```bash
cd backend
node importCSVData.js
```

### Step 5: Start Your Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Step 6: Test the Map

1. Open: http://localhost:3000
2. Navigate to the map page
3. You should see:
   - ✅ Interactive ArcGIS map
   - ✅ Markers for medicine locations
   - ✅ Popups with details
   - ✅ Search and zoom controls

---

## 🏗️ What Was Implemented

### Backend Files Created/Modified

#### New Files:
1. **`backend/services/arcgisService.js`**
   - `getArcGISToken()` - Get OAuth 2.0 token
   - `getBasemapStyles()` - Fetch basemap options
   - `geocodeAddress()` - Convert address to coordinates
   - Token caching (24-hour lifespan)

2. **`backend/controllers/mapController.js`**
   - `getMapConfig()` - Send token to frontend
   - `getMapLocations()` - Get medicines with coordinates
   - `geocode()` - Geocoding endpoint
   - Distance calculation (Haversine formula)

3. **`backend/routes/map.js`**
   - `GET /map/config` - Map configuration + token
   - `GET /map/locations` - Medicine locations
   - `GET /map/geocode` - Address geocoding

4. **`backend/testOAuth.js`**
   - Test OAuth 2.0 implementation
   - Verify credentials
   - Check API access

#### Modified Files:
1. **`backend/server.js`**
   - Added map routes: `app.use('/map', mapRoutes)`
   - Enhanced logging

2. **`backend/.env`**
   - Added `ARCGIS_CLIENT_ID`
   - Added `ARCGIS_CLIENT_SECRET`

### Frontend Files Modified

1. **`services/arcgisService.ts`**
   - `getMapConfig()` - Fetch token from backend
   - `initializeMap()` - Initialize with backend token
   - `fetchMedicineLocations()` - Updated to use new endpoint
   - Token is now from server, not hardcoded

2. **`.env.local`**
   - Removed `NEXT_PUBLIC_ARCGIS_API_KEY`
   - Only needs `NEXT_PUBLIC_API_URL`

---

## 🔌 API Endpoints

### Public Endpoint

#### Get Map Configuration
```http
GET http://localhost:4000/map/config

Response:
{
  "token": "AAPTxy8BH1VE...",
  "basemap": "streets-navigation-vector",
  "center": [10.1815, 36.8065],
  "zoom": 12
}
```

### Protected Endpoints (Require JWT)

#### Get Medicine Locations
```http
GET http://localhost:4000/map/locations
Authorization: Bearer <your_jwt_token>

Optional Query Params:
- userLat: User latitude
- userLng: User longitude
- radius: Search radius in km (default: all)

Response:
[
  {
    "id": "uuid",
    "name": "Paracetamol 500mg",
    "category": "Medication",
    "quantity": 100,
    "latitude": 36.8065,
    "longitude": 10.1815,
    "donor_name": "Pharmacy El Hana",
    "donor_address": "Rue de Tunis 12, Tunis",
    "donor_type": "Pharmacy",
    "working_hours": "8:00-20:00",
    "distance": 2.5
  }
]
```

#### Geocode Address
```http
GET http://localhost:4000/map/geocode?address=Tunis
Authorization: Bearer <your_jwt_token>

Response:
[
  {
    "address": "Tunis, Tunisia",
    "location": {
      "x": 10.1815,
      "y": 36.8065
    },
    "score": 100
  }
]
```

---

## 🔒 Security Features

### Token Management
- ✅ OAuth token cached for 23 hours (1-hour buffer)
- ✅ Automatic token refresh when expired
- ✅ Client Secret never exposed to frontend
- ✅ JWT authentication for protected endpoints

### Request Flow
```
Frontend → Backend → ArcGIS
   ↓         ↓          ↓
 JWT    OAuth Token  Data
```

---

## 🧪 Testing Checklist

- [ ] OAuth 2.0 credentials configured
- [ ] `node testOAuth.js` passes
- [ ] Backend server starts without errors
- [ ] CSV data imported successfully
- [ ] Frontend can fetch map config
- [ ] Map displays with markers
- [ ] Popups show medicine details
- [ ] Search works correctly
- [ ] User location centering works

---

## ❓ Troubleshooting

### "Failed to get ArcGIS token"
- Check Client ID and Client Secret in `.env`
- Verify credentials at https://developers.arcgis.com/applications
- Ensure OAuth 2.0 is enabled for your app

### "Map not loading"
- Backend must be running on port 4000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Open browser console for errors

### "No markers on map"
- Run database migration: `psql ... -f migrations/add_location_to_medicine.sql`
- Import CSV data: `node importCSVData.js`
- Verify: `SELECT COUNT(*) FROM medicine WHERE latitude IS NOT NULL;`

### "Authentication failed"
- User must be logged in
- JWT token must be in localStorage
- Check `/auth` endpoints are working

---

## 📊 Token Usage

ArcGIS free tier includes:
- ✅ 2 million basemap requests/month
- ✅ 1 million geocoding requests/month
- ✅ 500k routing requests/month

For Medicine Rescue, this is **more than enough**!

---

## 🚀 Next Steps

### Optional Enhancements

1. **Add Routing**
   - Show directions from user to medicine location
   - Display estimated travel time

2. **Add Clustering**
   - Group nearby markers for better performance
   - Declutter the map

3. **Add Filters**
   - Filter by category (medication vs supplies)
   - Filter by expiry date
   - Filter by donor type

4. **Add Real-time Updates**
   - WebSocket connection for live data
   - Notify when new supplies are added

---

## 📖 Resources

- [ArcGIS OAuth 2.0 Docs](https://developers.arcgis.com/documentation/mapping-apis-and-services/security/oauth-2.0/)
- [ArcGIS JavaScript API](https://developers.arcgis.com/javascript/latest/)
- [Basemap Styles](https://developers.arcgis.com/javascript/latest/api-reference/esri-Map.html#basemap)

---

**Your app is now production-ready with secure OAuth 2.0! 🎉**
