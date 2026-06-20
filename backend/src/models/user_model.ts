/**
 * =================================================================
 * USER MODEL – UPDATED FOR EMPLOYEE SELF-REGISTRATION
 * =================================================================
 */
import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserRole, getPermissionsForRole } from '../constant/role';
import { logger } from '../utils/logger';

// ================================================================
// USER INTERFACE
// ================================================================
export interface IUser extends Document {
  // Authentication & Identity
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: string[];

  // Company Association – NOW OPTIONAL
  companyId?: Types.ObjectId | null;  // ← NULLABLE

  linkedEmployees?: Types.ObjectId[];

  // Personal & Profile Info
  avatar?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  languages?: string[];
  bio?: string;
  jobTitle?: string;

  // Account Verification
  isProfileVerified: boolean;
  profileVerificationNotes?: string;

  // Security (never exposed)
  refreshToken?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ================================================================
// USER SCHEMA
// ================================================================
const UserSchema = new Schema<IUser>(
  {
    // Required Identity
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },

    // Role & Permissions
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.EMPLOYEE, // ← DEFAULT IS NOW EMPLOYEE
    },
    permissions: { type: [String], default: [] },

    // Company Association – NOW OPTIONAL
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      default: null,        // ← NULL FOR UNASSIGNED EMPLOYEES
      required: false,      // ← NOT REQUIRED
    },

    linkedEmployees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Profile Info
    avatar: {
      type: String,
      default: 'https://yourdomain.com/avatars/default.jpg',
    },
    age: { type: Number, min: 13, default: 18 },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0], // [longitude, latitude]
      },
    },
    languages: [String],
    bio: { type: String, maxlength: 500 },
    jobTitle: String,

    // Profile Verification
    isProfileVerified: { type: Boolean, default: false },
    profileVerificationNotes: String,

    // Security Tokens (hidden from responses)
    refreshToken: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const safeRet = ret as Record<string, unknown>;
        delete safeRet.password;
        delete safeRet.refreshToken;
        return safeRet;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        const safeRet = ret as Record<string, unknown>;
        delete safeRet.password;
        delete safeRet.refreshToken;
        return safeRet;
      },
    },
  }
);

// ================================================================
// MIDDLEWARE
// ================================================================
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  logger.info('Hashing user password', { email: this.email });
  try {
    this.password = await bcrypt.hash(this.password, 10);
    logger.info('Password hashed successfully');
    next();
  } catch (error) {
    logger.error('Failed to hash password', {
      error: (error as Error).message,
      email: this.email,
    });
    next(error as Error);
  }
});

UserSchema.pre('save', function (next) {
  if (this.isModified('role')) {
    this.permissions = [...getPermissionsForRole(this.role)];
    logger.info('Updated permissions based on role', {
      userId: this._id,
      role: this.role,
      permissions: this.permissions,
    });
  }
  next();
});

// ================================================================
// INDEXES
// ================================================================
UserSchema.index({ role: 1 });
UserSchema.index({ companyId: 1 });        // ← allows fast lookup by company
// UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ jobTitle: 1 });
UserSchema.index({ linkedEmployees: 1 });
UserSchema.index({ refreshToken: 1 });

// ================================================================
// MODEL EXPORT
// ================================================================
export const UserModel = model<IUser>('User', UserSchema);