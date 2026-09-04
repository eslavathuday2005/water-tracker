const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    let connectionUri = MONGO_URI;

    if (!connectionUri) {
      console.log('ℹ️  No MONGO_URI provided in environment. Initializing in-memory MongoDB server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      connectionUri = mongoMemoryServer.getUri();
      console.log('✅ In-memory MongoDB server started successfully at:', connectionUri);
    }

    const conn = await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error (${error.message}). Attempting in-memory fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const fallbackUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log('✅ Fallback in-memory MongoDB started successfully at:', fallbackUri);
      return conn;
    } catch (fallbackError) {
      console.error('❌ Failed to connect to any MongoDB instance:', fallbackError.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('MongoDB connection closed.');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
