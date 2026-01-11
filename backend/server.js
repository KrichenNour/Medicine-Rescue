const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stock');
const requestRoutes = require('./routes/request');
const authenticate = require('./middleware/auth');

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const upload = require('./middleware/upload');

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const imageUrl = `http://localhost:4000/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

app.use('/auth', authRoutes);
app.use('/stock', authenticate, stockRoutes);
app.use('/requests', requestRoutes);

app.get('/', (req, res) => res.send('API is running'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

