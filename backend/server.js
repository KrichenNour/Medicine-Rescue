const express = require('express');
const cors = require('cors');
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

app.use('/auth', authRoutes);
app.use('/stock', authenticate, stockRoutes);
app.use('/requests', requestRoutes);

app.get('/', (req, res) => res.send('API is running'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

