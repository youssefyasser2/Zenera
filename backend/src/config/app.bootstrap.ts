import path from 'path';
import { connectDB } from './db.config';
import { connectRedis } from './redis.config';
import fs from 'fs';
import { logger } from '../utils/logger';




export const ensureLogDirectory = () => {
  const logDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
};
export async function bootstrap() {
  // Database Connection
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      logger.warn("🟡 MONGO_URI is not set. Using fallback (check db.config.ts).");
    }
    await connectDB(uri);

    logger.info("✅ Database connected");
  } catch (err) {

  logger.error("❌ Database connection failed:", err);}

  // Redis Connection (if enabled)
  try {
    await connectRedis();
    logger.info("✅ Redis connected successfully");
  } catch (err) {
    logger.error("❌ Redis connection failed. Caching/sessions may not work:", err);
  }
  logger.info("🚀 Application is completed");
}
