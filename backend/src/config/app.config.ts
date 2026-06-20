import { rateLimit } from "express-rate-limit";

// src/config/app.config.ts
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const isProd = NODE_ENV === 'production';
export const isDev = NODE_ENV === 'development';
export const isTest = NODE_ENV === 'test';

export const PORT = parseInt(process.env.PORT || '5000', 10);
export const API_PREFIX = process.env.API_PREFIX || '/api';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5000';

export const limiter= rateLimit({

  max: parseInt(process.env.API_RATE_LIMIT || '100', 10),
  windowMs: (() => {
    const time = process.env.API_RATE_LIMIT_WINDOW || '15m';
    if (time.endsWith('h')) return parseInt(time) * 60 * 60 * 1000;
    if (time.endsWith('m')) return parseInt(time) * 60 * 1000;
    return parseInt(time) * 1000;
  })(),
  message: { status: 'error', message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const LOG_LEVEL = process.env.LOG_LEVEL || (isProd ? 'info' : 'debug');