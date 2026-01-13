# MongoDB Atlas Setup Guide (Cloud Database)

This guide will help you set up MongoDB Atlas so all users share the same database, including images stored in the cloud.

## Quick Setup for MongoDB Atlas (Recommended)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account (or sign in if you have one)

### Step 2: Create a Free Cluster
1. Click **"Build a Cluster"** or **"Create"**
2. Select the **FREE** tier (M0 Sandbox)
3. Choose your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Select a region close to your users
5. Name your cluster (e.g., `medsurplus-cluster`)
6. Click **"Create Cluster"** (takes 1-3 minutes)

### Step 3: Set Up Database Access
1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username (e.g., `medsurplus_admin`)
5. Enter a strong password (or click "Autogenerate Secure Password" and **save it**)
6. Set **Database User Privileges** to **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Set Up Network Access
1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - ⚠️ For production: Add only your server's IP address
4. Click **"Confirm"**

### Step 5: Get Your Connection String
1. Go back to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **Driver: Node.js** and **Version: 5.5 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Configure Your Backend

1. Create a `.env` file in the `backend/` folder:
   ```env
   # MongoDB Atlas Connection String
   # Replace <username>, <password>, and <cluster> with your actual values
   MONGODB_URI=mongodb+srv://medsurplus_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/medsurplus?retryWrites=true&w=majority

   # JWT Secret for authentication (generate a random string)
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

   # Server Port
   PORT=4000

   # Server URL (update this when deploying to production)
   SERVER_URL=http://localhost:4000
   ```

2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

You should see:
```
Server running on port 4000
✅ Connected to MongoDB database
✅ GridFS bucket initialized for image storage
```

---

## Image Storage in MongoDB Atlas

Images are now stored directly in MongoDB Atlas using **GridFS**. This means:

- ✅ **All images are stored in the cloud** (not on local disk)
- ✅ **All users see the same images**
- ✅ **No need for separate file storage service**
- ✅ **Images are backed up with your database**

### How It Works:
1. When you upload an image via `/upload`, it's stored in MongoDB GridFS
2. Images are served from `/images/:filename`
3. The `image_url` saved in medicine records points to this endpoint

### Image Limits:
- Maximum file size: 10MB
- Supported formats: JPEG, JPG, PNG, GIF, WEBP

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/medsurplus` |
| `JWT_SECRET` | Secret key for JWT tokens | `my_super_secret_key_123` |
| `PORT` | Server port | `4000` |
| `SERVER_URL` | Full server URL for image URLs | `http://localhost:4000` or `https://api.yoursite.com` |

---

## Troubleshooting

### "MongoNetworkError" or Connection Timeout
- Check if your IP is whitelisted in Atlas Network Access
- Verify your username/password in the connection string
- Make sure the cluster is active (not paused)

### "Authentication failed"
- Double-check your database username and password
- Ensure the password doesn't contain special characters that need URL encoding
- If password has special chars like `@`, `#`, etc., URL-encode them

### Images Not Loading
- Ensure `SERVER_URL` in `.env` matches your actual server address
- Check if the GridFS bucket is initialized (look for the log message)
- Verify the image filename in the URL is correct

---

## Local Development Alternative

If you want to run MongoDB locally instead:

### Windows Installation:
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install and start the MongoDB service
3. Leave `MONGODB_URI` empty or set to `mongodb://localhost:27017/medsurplus`

### Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## Production Deployment Notes

When deploying to production:

1. **Update `SERVER_URL`** to your production server URL
2. **Use a strong `JWT_SECRET`** (generate a random 64+ character string)
3. **Restrict Network Access** to only your server's IP addresses
4. **Consider upgrading** from M0 (free) tier for better performance
5. **Enable database backups** in Atlas for data safety
