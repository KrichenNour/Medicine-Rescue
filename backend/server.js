const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stock');
const requestRoutes = require('./routes/request');
const mapRoutes = require('./routes/map');
const authenticate = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/stock', authenticate, stockRoutes);
app.use('/requests', requestRoutes);
app.use('/map', mapRoutes);

app.get('/', (req, res) => res.send('Medicine Rescue API is running'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 Map API: http://localhost:${PORT}/map/config`);
});
