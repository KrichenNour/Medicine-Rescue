// backend/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medsurplus';
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log('✅ Connected to MongoDB database');
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('⚠️ Make sure MongoDB is running on localhost:27017');
    console.error('   Or update MONGODB_URI in backend/.env with your MongoDB connection string');
    // Don't exit - let the server start and retry connection
    // The server can still handle requests, but database operations will fail
  }
};

module.exports = connectDB;
