import jwt, {
  SignOptions,
  VerifyOptions,
  TokenExpiredError,
  JsonWebTokenError,
  NotBeforeError,
} from 'jsonwebtoken';
import ms from 'ms';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../constant/role';

export interface TokenPayload {
  userId: string;
  role?: UserRole;
  jti?: string;
  type?: 'access' | 'refresh';
  exp?: number;
  iat?: number;
  permissions?: string[];
}

export interface DecodedToken extends TokenPayload {
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
  jti: string;
}

export { TokenExpiredError, JsonWebTokenError, NotBeforeError };

// ================================================================
// JWT CONFIGURATION & VALIDATION (DIRECT FROM process.env)
// ================================================================
const JWT_ALGORITHM = 'HS256';

/**
 * Get JWT secret directly from process.env
 */
function getSecret(type: 'access' | 'refresh'): string {
  const secret = type === 'access' ? process.env.JWT_SECRET : process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error(`JWT ${type} secret is not defined in environment variables`);
  }
  return secret;
}

/**
 * Get expiresIn directly from process.env
 */
function getExpiresIn(type: 'access' | 'refresh'): string | number {
  const expiresIn = type === 'access' ? process.env.JWT_EXPIRES_IN : process.env.JWT_REFRESH_EXPIRES_IN;
  if (!expiresIn) {
    throw new Error(`JWT ${type} token expiration is not defined`);
  }
  return expiresIn;
}

// ================================================================
// JWT FUNCTIONS
// ================================================================
/**
 * Signs a JWT token (access or refresh)
 */
export const signToken = (payload: any, type: 'access' | 'refresh') => {
  const secret = getSecret(type);
  const expiresIn = getExpiresIn(type);
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

/**
 * Verifies and decodes a JWT token with proper error handling
 */
export const verifyToken = (token: string, type: 'access' | 'refresh'): DecodedToken => {
  const secret = getSecret(type);
  return jwt.verify(token, secret, { algorithms: [JWT_ALGORITHM] }) as DecodedToken;
};

/**
 * Decodes a JWT token without verification (for inspection only)
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.decode(token);
    if (typeof decoded === 'string' || decoded === null) {
      return null;
    }
    return decoded as DecodedToken;
  } catch {
    return null;
  }
}

/**
 * Checks if a token is expired without verification
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
}

/**
 * Extracts JTI from token without verification
 */
export function extractJti(token: string): string | null {
  const decoded = decodeToken(token);
  return decoded?.jti || null;
}

/**
 * Gets time until token expiration in seconds
 */
export function getTokenExpiry(token: string): number {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return 0;
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, decoded.exp - now);
}


// ================================================================
// TOKEN BLACKLIST (IN-MEMORY)
// ================================================================
export const tokenBlacklist = new Set<string>();

export const addToBlacklist = (token: string, expiresIn: number) => {
  tokenBlacklist.add(token);
  setTimeout(() => tokenBlacklist.delete(token), expiresIn * 1000);
};

export const isBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};