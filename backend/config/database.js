/**
 * MongoDB Database Configuration
 * Connects to MongoDB using Mongoose
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/verifyai';

let isConnected = false;

async function connectDb() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    console.log('✓ MongoDB connected:', mongoose.connection.name);
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    throw error;
  }
}

function getDb() {
  return mongoose.connection;
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDb, getDb, isDbConnected };
