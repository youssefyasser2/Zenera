// src/types/global.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'staging' | 'production' | 'test';
    PORT?: string;
    DATABASE_URL?: string;
    JWT_SECRET?: string;
    JWT_EXPIRES_IN?: string;
    REDIS_URL?: string;
    LOG_LEVEL?: string;
    API_PREFIX?: string;
    API_RATE_LIMIT?: string;
    API_RATE_LIMIT_WINDOW?: string;
  }
}