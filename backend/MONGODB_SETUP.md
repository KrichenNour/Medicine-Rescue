# MongoDB Setup Guide

## Option 1: Install and Run MongoDB Locally

### Windows Installation:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB (default location: `C:\Program Files\MongoDB`)
3. Create data directory: `C:\data\db` (MongoDB needs this)
4. Start MongoDB:
   ```powershell
   # If installed as a service:
   Start-Service MongoDB
   
   # Or run manually:
   "C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe"
   ```

## Option 2: Use MongoDB Atlas (Cloud - Recommended for Development)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster (M0 - Free tier)
4. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/medsurplus`)
5. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medsurplus
   ```
6. Add your IP address to the whitelist in Atlas (or use 0.0.0.0/0 for development)

## Option 3: Use Docker (if Docker is installed)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Verify MongoDB is Running

After starting MongoDB, verify it's running:
```powershell
# Check if port 27017 is listening
Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue
```

Then restart your backend server - it should connect successfully!
