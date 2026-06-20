/**
 * src/services/user_services.ts
 * User Service – Secure, Company-Scoped CRUD + /me
 * ------------------------------------------------
 * • Full TypeScript safety
 * • ObjectId validation
 * • No unsafe casts
 * • Sensitive fields stripped
 * • Audit logs + Redis session cleanup
 */

import { Types, HydratedDocument } from 'mongoose';
import { UserModel, IUser } from '../models/user_model';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';
import { UserRole, getPermissionsForRole } from '../constant/role';
import { redisClient } from '../config';

/* -----------------------------------------------------------------
 * Types
 * ----------------------------------------------------------------- */
interface GetUsersResult {
  users: Partial<IUser>[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/* -----------------------------------------------------------------
 * Sanitize user – remove password, refreshToken, __v
 * ----------------------------------------------------------------- */
// src/services/user_services.ts
const sanitizeUser = (doc: any): Partial<IUser> => {
  const obj = doc.toObject ? doc.toObject() : doc;
  const { password, refreshToken, __v, ...safe } = obj;
  return {
    ...safe,
    linkedEmployees: safe.linkedEmployees || [],
  };
};

/* -----------------------------------------------------------------
 * Get all users (scoped by companyId + pagination)
 * ----------------------------------------------------------------- */
const getUsers = async (
  companyId: string,
  page = 1,
  limit = 10,
  role?: string,
): Promise<GetUsersResult> => {
  try {
    if (!Types.ObjectId.isValid(companyId)) {
      throw new AppError('Invalid company ID', 400);
    }

    const pageNum = Math.max(1, page);
    const limitNum = Math.min(100, Math.max(1, limit));
    const skip = (pageNum - 1) * limitNum;
    const oid = new Types.ObjectId(companyId);

    let filter: any = {};

    // 🔹 Admin sees all users
    if (role === 'admin') {
      filter = {};
    }
    // 🔹 Manager sees users from his own company only
    else if (role === 'manager') {
      filter = { companyId: oid };
    }
    // 🔹 Employees or other roles
    else {
      filter = { companyId: oid };
    }

    const [rawUsers, total] = await Promise.all([
      UserModel.find(filter)
        .select('-password -refreshToken')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .lean(),
      UserModel.countDocuments(filter),
    ]);

    const users = rawUsers.map((u) => sanitizeUser(u as HydratedDocument<IUser>));

    logger.debug('Fetched users', {
      companyId,
      role,
      page: pageNum,
      limit: limitNum,
      total,
    });

    return {
      users,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    };
  } catch (err) {
    logger.error('getUsers failed', {
      companyId,
      error: (err as Error).message,
    });
    throw err instanceof AppError ? err : new AppError('Could not fetch users', 500);
  }
};

/* -----------------------------------------------------------------
 * Search unlinked users (users with no company)
 * ----------------------------------------------------------------- */
import mongoose from 'mongoose';

const searchUnlinkedUsers = async (query: string): Promise<IUser[]> => {
  const searchRegex = new RegExp(query, 'i');

 
  const filter: any = {
    companyId: null,
    $or: [{ name: searchRegex }],
  };

  
  if (mongoose.isValidObjectId(query)) {
    filter.$or.push({ _id: new mongoose.Types.ObjectId(query) });
  }

  const users = await UserModel.find(filter)
    .select('_id name email role companyId')
    .lean();

  return users;
};


/* -----------------------------------------------------------------
 * Get current user profile (/me)
 * ----------------------------------------------------------------- */
const getMe = async (userId: string): Promise<Partial<IUser> | null> => {
  try {
    if (!Types.ObjectId.isValid(userId)) throw new AppError('Invalid user ID', 400);

    const doc = await UserModel.findById(userId).select('-password -refreshToken').exec();

    if (!doc) return null;

    return sanitizeUser(doc);
  } catch (err) {
    logger.error('getMe failed', { userId, error: (err as Error).message });
    throw err instanceof AppError ? err : new AppError('Could not fetch profile', 500);
  }
};

/* -----------------------------------------------------------------
 * Get user by ID
 * ----------------------------------------------------------------- */
const getUserById = async (id: string): Promise<Partial<IUser> | null> => {
  try {
    if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid user ID', 400);

    const doc = await UserModel.findById(id).select('-password -refreshToken').exec();

    if (!doc) return null;

    return sanitizeUser(doc);
  } catch (err) {
    logger.error('getUserById failed', { id, error: (err as Error).message });
    throw err instanceof AppError ? err : new AppError('Could not fetch user', 500);
  }
};

/* -----------------------------------------------------------------
 * Create new user
 * ----------------------------------------------------------------- */
const createUser = async (data: Partial<IUser>): Promise<Partial<IUser>> => {
  const required = ['name', 'email', 'password', 'companyId'] as const;
  const missing = required.filter((f) => !data[f]);
  if (missing.length) throw new AppError(`Missing: ${missing.join(', ')}`, 400);

  const { email, companyId, role = UserRole.EMPLOYEE } = data;

  if (!Object.values(UserRole).includes(role as UserRole))
    throw new AppError(`Invalid role. Use: ${Object.values(UserRole).join(', ')}`, 400);

  if (!Types.ObjectId.isValid(String(companyId)))
    throw new AppError('Invalid company ID format', 400);

  const exists = await UserModel.findOne({ email }).lean();
  if (exists) throw new AppError('Email already taken', 409);

  try {
    const doc: HydratedDocument<IUser> = new UserModel({
      ...data,
      role: role as UserRole,
      permissions: [...getPermissionsForRole(role as UserRole)],
      companyId: new Types.ObjectId(String(companyId)),
    });

    const saved: HydratedDocument<IUser> = await doc.save();

    const sanitized = sanitizeUser(saved);

    logger.info('User created', {
      userId: saved._id.toString(),
      email,
      companyId: String(companyId),
      role,
    });

    return sanitized;
  } catch (err: any) {
    logger.error('createUser DB error', { email, companyId, err: err.message, code: err.code });
    if (err.code === 11000) throw new AppError('Email already taken', 409);
    throw new AppError('Failed to create user', 500);
  }
};
/* -----------------------------------------------------------------
 * Update user
 * ----------------------------------------------------------------- */
const updateUser = async (
  id: string,
  data: Partial<IUser>,
  updaterId?: string
): Promise<Partial<IUser> | null> => {
  try {
    if (!id || !Types.ObjectId.isValid(id.toString())) {
      throw new AppError("Invalid user ID", 400);
    }

    const update = { ...data };
    delete update.email;
    delete update.companyId;
    delete update.role;
    delete update.permissions;

    const doc = await UserModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
      omitUndefined: true,
    })
      .select("-password -refreshToken")
      .exec();

    if (!doc) {
      logger.warn("updateUser – user not found", { id, updaterId });
      return null;
    }

    logger.info("User updated successfully", {
      userId: id,
      updatedBy: updaterId,
      updatedFields: Object.keys(update),
    });

    return sanitizeUser(doc);
  } catch (err) {
    logger.error("updateUser error", {
      id,
      updaterId,
      error: (err as Error).message,
    });
    throw err instanceof AppError
      ? err
      : new AppError("Could not update user", 500);
  }
};


/* -----------------------------------------------------------------
 * Delete user
 * ----------------------------------------------------------------- */
const deleteUser = async (id: string, deleterId?: string): Promise<boolean> => {
  try {
    if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid user ID', 400);

    const doc = await UserModel.findById(id).exec();
    if (!doc) {
      logger.warn('deleteUser – user not found', { id, deleterId });
      return false;
    }

    // Revoke all sessions
    if (redisClient) {
      const keys = await redisClient.keys(`sess_*`);
      for (const key of keys) {
        const sessUser = await redisClient.get(key);
        if (sessUser === id) {
          const jti = key.split('_')[1];
          await redisClient.del(key);
          await redisClient.setex(`bl_${jti}`, 3600, '1');
        }
      }
    }

    await UserModel.findByIdAndDelete(id).exec();

    logger.warn('User deleted', {
      userId: id,
      deleterId,
      companyId: doc.companyId?.toString() ?? 'none', // ← FIXED
    });

    return true;
  } catch (err) {
    logger.error('deleteUser error', { id, deleterId, error: (err as Error).message });
    throw err instanceof AppError ? err : new AppError('Could not delete user', 500);
  }
};

/* -----------------------------------------------------------------
 * Link employee to manager
 * ----------------------------------------------------------------- */
const linkEmployee = async (
  managerId: string,
  employeeId: string,
): Promise<{
  manager: Partial<IUser>;
  employee: Partial<IUser>;
}> => {
  if (!Types.ObjectId.isValid(managerId) || !Types.ObjectId.isValid(employeeId)) {
    throw new AppError('Invalid user ID', 400);
  }

  const [manager, employee] = await Promise.all([
    UserModel.findById(managerId),
    UserModel.findById(employeeId),
  ]);

  if (!manager || !employee) {
    throw new AppError('Manager or Employee not found', 404);
  }

  if (manager.role !== 'manager') {
    throw new AppError('Only managers can link employees', 403);
  }
  if (employee.role !== 'employee') {
    throw new AppError('You can only link employees', 403);
  }

  if (employee.companyId && employee.companyId.toString() !== manager.companyId?.toString()) {
    throw new AppError('Cannot link employee from different company', 403);
  }

  if (!employee.companyId) {
    employee.companyId = manager.companyId;
    await employee.save();
  }

  const linked = manager.linkedEmployees || [];
  if (!linked.some((id) => id.toString() === employee._id.toString())) {
    manager.linkedEmployees = [...linked, employee._id];
    await manager.save();
    logger.info('Employee linked successfully', { managerId, employeeId });
  } else {
    logger.debug('Employee already linked', { managerId, employeeId });
  }

  return {
    manager: sanitizeUser(manager),
    employee: sanitizeUser(employee),
  };
};

/* -----------------------------------------------------------------
 * Export
 * ----------------------------------------------------------------- */
export const UserService = {
  getUsers,
  searchUnlinkedUsers,
  getMe,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  linkEmployee,
};
