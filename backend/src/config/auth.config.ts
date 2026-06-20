/***********************************************************************
/* Auth Configuration
***********************************************************************/
type JwtConfig = {
  secret: string;
  expiresIn: string | number;
  refreshSecret: string;
  refreshExpiresIn: string | number;
  refresh: {
    rotationThreshold: number;
  };
  cookieName: string;
  cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge?: number;
  };
};

export const jwt: JwtConfig = {
  // Use non-null assertion since we validate below
  secret: process.env.JWT_SECRET!,
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  refresh: {
    rotationThreshold: process.env.JWT_REFRESH_ROTATION_THRESHOLD
      ? parseInt(process.env.JWT_REFRESH_ROTATION_THRESHOLD, 10)
      : 7 * 24 * 60 * 60,
  },
  cookieName: 'refreshToken',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

// Validate environment variables
const validateEnv = () => {
  const errors: string[] = [];
  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET is not set in .env');
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    errors.push('JWT_REFRESH_SECRET is not set in .env');
  }
  if (!process.env.JWT_EXPIRES_IN) {
    errors.push('JWT_EXPIRES_IN is not set in .env, defaulting to 1d');
  }
  if (!process.env.JWT_REFRESH_EXPIRES_IN) {
    errors.push('JWT_REFRESH_EXPIRES_IN is not set in .env, defaulting to 7d');
  }
  if (errors.length > 0) {
    errors.forEach(error => console.error(`❌ ${error}`));
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Critical environment variables missing. Exiting...');
    }
  }
};

// Run validation on import
validateEnv();