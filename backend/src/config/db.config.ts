// src/config/db.config.ts
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export async function connectDB(uri?: string): Promise<void> {
  if (!uri) {
    throw new Error('MongoDB connection URI is required');
  }

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect(uri, options);
    logger.info('✅ MongoDB connected');
  } catch (err) {
    logger.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}