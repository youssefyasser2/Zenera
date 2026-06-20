/**
 * src/services/auth.service.ts
 * Auth Service – Secure JWT, Refresh Tokens, Registration, Login
 * ---------------------------------------------------------------
 * - Uses `userId` consistently in JWT payload
 * - Auto-creates default company
 * - Full TypeScript safety
 * - Audit logging
 * - Refresh token rotation
 */
import { sign, verify, SignOptions } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { IUser, UserModel } from '../models/user_model';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';
import { UserRole } from '../constant/role';
import ms from 'ms';
import { CompanyModel, CompanyDocument } from '../models/Company_model';
import { RegisterResponse } from '../types/auth.types';

export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly REFRESH_TOKEN_SECRET: string;
  private readonly REFRESH_TOKEN_EXPIRES_IN: string;
  private defaultCompanyId: string | null = null;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';
    this.REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';

    const jwtExp = process.env.JWT_EXPIRES_IN?.trim() || '15m';
    const refreshExp = process.env.JWT_REFRESH_EXPIRES_IN?.trim() || '7d';

    const isValidMs = (v: string) => {
      try {
        return ms(v as any) != null;
      } catch {
        return false;
      }
    };

    this.JWT_EXPIRES_IN = isValidMs(jwtExp) ? jwtExp : '15m';
    this.REFRESH_TOKEN_EXPIRES_IN = isValidMs(refreshExp) ? refreshExp : '7d';

    if (!isValidMs(jwtExp)) logger.warn(`Invalid JWT_EXPIRES_IN: "${jwtExp}". Using "15m".`);
    if (!isValidMs(refreshExp)) logger.warn(`Invalid REFRESH_TOKEN_EXPIRES_IN: "${refreshExp}". Using "7d".`);
  }

  /* -------------------------------------------------
   * Initialise default company (once)
   * ------------------------------------------------- */
  private async initialize(): Promise<void> {
    if (this.defaultCompanyId) return;

    try {
      let defaultCompany: CompanyDocument | null = await CompanyModel.findOne({
        name: 'Default Company',
      });

      if (!defaultCompany) {
        defaultCompany = (await new CompanyModel({
          name: 'Default Company',
          address: 'Default Address',
          typeOfBusiness: 'General',
          email: 'admin@default.com',
          phone: '+1234567890',
        }).save()) as CompanyDocument;

        logger.info('Created default company', {
          id: defaultCompany._id.toString(),
        });
      }

      this.defaultCompanyId = defaultCompany._id.toString();
    } catch (err) {
      logger.error('Failed to initialise default company', err);
      throw new Error('Failed to initialise default company');
    }
  }

  /* -------------------------------------------------
   * Register – auto‑creates company if needed
   * Returns clean RegisterResponse with companyName
   * ------------------------------------------------- */
/* -------------------------------------------------
 * Register – auto-creates company if needed
 * Returns clean RegisterResponse with companyName
 * ------------------------------------------------- */
async register(
  name: string,
  email: string,
  password: string,
  role: string = 'manager',
  companyName?: string
): Promise<RegisterResponse> {
  // 1. Validate role
  if (!Object.values(UserRole).includes(role as UserRole)) {
    throw new AppError(
      `Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}`,
      400
    );
  }

  // 2. Check existing user
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // 3. Resolve / create company
  await this.initialize();
  let company: CompanyDocument | null = null;

  if (companyName) {
    const existing = await CompanyModel.findOne({ name: companyName });
    if (existing) {
      company = existing;
    } else {
      const uniqueEmail = `${companyName
        .toLowerCase()
        .replace(/\s+/g, '.')}-${Date.now()}@example.com`;

      company = (await new CompanyModel({
        name: companyName,
        address: 'Not provided',
        typeOfBusiness: 'General',
        email: uniqueEmail,
        phone: '+1234567890',
      }).save()) as CompanyDocument;

      logger.info('Auto-created company', {
        companyId: company._id.toString(),
        companyName,
        email: uniqueEmail,
      });
    }
  }

  // 4. Create user
const userData: Partial<IUser> = {
  name,
  email,
  password,
  role: role as UserRole,
  companyId: company ? company._id : null,
};

if (role === UserRole.MANAGER) {
  (userData as any).linkedEmployees = [];
}

const user = await new UserModel(userData).save();


  // 5. Build clean response
  const response: RegisterResponse = {
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    companyId: company ? company._id.toString() : null,
    companyName: company ? company.name : null,
    avatar: user.avatar,
    age: user.age,
    gender: user.gender,
    location: user.location,
    languages: user.languages,
    bio: user.bio,
    jobTitle: user.jobTitle,
    isProfileVerified: user.isProfileVerified,
    profileVerificationNotes: user.profileVerificationNotes,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  logger.info('New user registered', {
    userId: user.id,
    email,
    role,
    companyId: company ? company._id.toString() : null,
    companyName: company ? company.name : null,
  });

  return response;
}


  /* -------------------------------------------------
   * Login – returns access + refresh token
   * ------------------------------------------------- */
  async login(email: string, password: string) {
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user || !(await compare(password, user.password))) {
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = this.generateAccessToken(
      user.id,
      user.role,
      user.companyId ? user.companyId.toString() : undefined
    );

    const refreshToken = this.generateRefreshToken(user.id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    logger.info('User logged in', { userId: user.id, email });

    return {
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId ? user.companyId.toString() : null,
      },
      accessToken,
      refreshToken,
    };
  }

  /* -------------------------------------------------
   * Refresh Access Token
   * ------------------------------------------------- */
  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = verify(refreshToken, this.REFRESH_TOKEN_SECRET) as {
        id: string;
      };

      const user = await UserModel.findById(decoded.id).select('+refreshToken');
      if (!user || user.refreshToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      const newAccessToken = this.generateAccessToken(
        user.id,
        user.role,
        user.companyId ? user.companyId.toString() : undefined
      );

      return { accessToken: newAccessToken };
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  /* -------------------------------------------------
   * Logout – clear refresh token
   * ------------------------------------------------- */
  async logout(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { refreshToken: null });
    logger.info('User logged out', { userId });
  }

  /* -------------------------------------------------
   * Delete Account
   * ------------------------------------------------- */
  async deleteAccount(userId: string): Promise<void> {
    const result = await UserModel.findByIdAndDelete(userId);
    if (!result) throw new AppError('User not found', 404);
    logger.info('User account deleted', { userId });
  }

  /* -------------------------------------------------
   * JWT Helpers – companyId is OPTIONAL
   * ------------------------------------------------- */
  private generateAccessToken(
    userId: string,
    role: string,
    companyId?: string  // ← NOW OPTIONAL
  ): string {
    const payload: any = {
      userId,
      role,
    };

    if (companyId) {
      payload.companyId = companyId;
    }

    return sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    } as SignOptions);
  }

  private generateRefreshToken(userId: string): string {
    return sign({ id: userId }, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    } as SignOptions);
  }
}
