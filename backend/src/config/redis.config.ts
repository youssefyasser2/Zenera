import Redis from 'ioredis';
import { logger } from '../utils/logger';

export const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: null,
});

redisClient.on('error', (err: Error) => {
  logger.error('❌ Redis Client Error', err);
});

export async function connectRedis(): Promise<void> {
logger.info('⏳Connecting to Redis...');
  try {
    await redisClient.ping();
  } catch (err) {
    logger.error('❌ Redis connection failed:', err);
    process.exit(1);
  }
}