const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const crypto = require('crypto');
const { Readable } = require('stream');
require('dotenv').config();

const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stock');
const requestRoutes = require('./routes/request');
const authenticate = require('./middleware/auth');
const conversationRoutes = require('./routes/conversations');


const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// GridFS bucket for images
let gfsBucket;

// Initialize GridFS after MongoDB connection
mongoose.connection.once('open', () => {
  gfsBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
  console.log('✅ GridFS bucket initialized for image storage');
});

// Import upload middleware (memory storage)
const upload = require('./middleware/gridfsUpload');

// Upload endpoint - stores image in MongoDB GridFS
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!gfsBucket) {
      return res.status(503).json({ error: 'Database not ready. Please try again.' });
    }

    // Generate unique filename
    const filename = crypto.randomBytes(16).toString('hex') + path.extname(req.file.originalname);

    // Create a readable stream from the buffer
    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);

    // Upload to GridFS
    const uploadStream = gfsBucket.openUploadStream(filename, {
      contentType: req.file.mimetype
    });

    readableStream.pipe(uploadStream);

    uploadStream.on('error', (err) => {
      console.error('GridFS upload error:', err);
      res.status(500).json({ error: 'Failed to upload image' });
    });

    uploadStream.on('finish', () => {
      const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 4000}`;
      const imageUrl = `${serverUrl}/images/${filename}`;

      res.json({
        imageUrl,
        fileId: uploadStream.id,
        filename: filename
      });
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Serve images from GridFS
app.get('/images/:filename', async (req, res) => {
  try {
    if (!gfsBucket) {
      return res.status(503).json({ error: 'Database not ready' });
    }

    const files = await mongoose.connection.db
      .collection('uploads.files')
      .find({ filename: req.params.filename })
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const file = files[0];

    // Set content type
    if (file.contentType) {
      res.set('Content-Type', file.contentType);
    } else {
      const ext = path.extname(file.filename).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };
      res.set('Content-Type', mimeTypes[ext] || 'image/jpeg');
    }

    // Stream the file from GridFS
    const downloadStream = gfsBucket.openDownloadStreamByName(req.params.filename);
    downloadStream.pipe(res);

    downloadStream.on('error', (err) => {
      console.error('GridFS stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming image' });
      }
    });

  } catch (err) {
    console.error('Error fetching image:', err);
    res.status(500).json({ error: 'Error fetching image' });
  }
});

// Delete image from GridFS (optional utility endpoint)
app.delete('/images/:filename', authenticate, async (req, res) => {
  try {
    if (!gfsBucket) {
      return res.status(503).json({ error: 'Database not ready' });
    }

    const files = await mongoose.connection.db
      .collection('uploads.files')
      .find({ filename: req.params.filename })
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    await gfsBucket.delete(files[0]._id);
    res.json({ message: 'Image deleted successfully' });

  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ error: 'Error deleting image' });
  }
});

// Legacy: Still serve local uploads folder for backward compatibility
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', authRoutes);
app.use('/stock', authenticate, stockRoutes);
app.use('/requests', requestRoutes);
app.use('/conversations', authenticate, conversationRoutes);

app.get('/', (req, res) => res.send('API is running - Connected to MongoDB Atlas'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
