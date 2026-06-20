import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';

import { AppError } from './errors/AppError';
import { errorMiddleware } from './middlewares/error.middleware';
import { logger } from './utils/logger';
import { limiter } from './config'; 
import auth_route from './routes/auth.route';
import user_route from './routes/user.route';
import shift_route from './routes/shifts.route'; 

const app = express();

const isProd = process.env.NODE_ENV === 'production';


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());


app.use(
  cors({
    origin: isProd
      ? [/^https:\/\/yourdomain\.com$/] // Replace with your real domain
      : [/http:\/\/localhost(:\d+)?$/, /http:\/\/127\.0\.0\.1(:\d+)?$/],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'],
    optionsSuccessStatus: 204,     // Critical: 204 for preflight
    preflightContinue: false,      // Critical: Stop after preflight
  })
);


app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        childSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: isProd
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
  })
);

// ================================================================
// 6. RATE LIMITING
// ===============================================================

app.use('/api/', limiter);           // Apply to all /api/*
app.use('/api/auth', limiter);          // Stricter for auth routes


app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// ================================================================
// 7. LOGGING: Morgan + Custom Debug (Dev Only)
// ================================================================
app.use(
  morgan('dev', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  })
);

// Detailed request logging in development
if (!isProd) {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.debug('Incoming Request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      auth: !!req.headers.authorization,
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : undefined,
    });
    next();
  });
}

// ================================================================
// 8. STATIC FILES & VIEWS
// ================================================================
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// ================================================================
// 9. HEALTH & PING ENDPOINTS
// ================================================================
app.get('/ping', (_req, res) =>
  res.json({ message: 'pong', timestamp: new Date().toISOString() })
);

app.get('/health', (_req, res) =>
  res.status(200).json({
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
);

// ================================================================
// 10. ROOT ROUTE
// ================================================================
app.get('/', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// ================================================================
// 11. API ROUTES
// ================================================================
app.use('/api/users', user_route);
app.use('/api/auth', auth_route)
app.use('/api/shifts', shift_route); 

// Test route
app.post('/test', (req, res) => {
  logger.debug('Test endpoint hit', { body: req.body });
  res.json({ received: req.body, echo: true });
});

// ================================================================
// 12. 404 HANDLERS
// ================================================================
// API 404
app.use(/^\/api(\/.*)?$/, (req, _res, next) => {
  next(new AppError(`API route not found: ${req.method} ${req.originalUrl}`, 404));
});

// Web 404
app.use((req, _res, next) => {
  next(new AppError(`Page not found: ${req.originalUrl}`, 404));
});

// ================================================================
// 13. GLOBAL ERROR HANDLER (MUST BE LAST!)
// ================================================================
app.use(errorMiddleware);

// ================================================================
// 14. UNHANDLED EXCEPTIONS & REJECTIONS
// ================================================================
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', {
    reason: reason?.toString() || 'Unknown',
  });
  process.exit(1);
});

export default app;