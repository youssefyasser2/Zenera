/**
 * UserRole: The role of a user in the system.
 */
export enum UserRole {
  /** System administrator with full access to all resources. */
  ADMIN = 'admin',
  /** Manager who manages employees. */
  MANAGER = 'manager',
  /** Employee. */
  EMPLOYEE = 'employee',
}

/** Mapping from role → list of permissions (immutable) */
type RolePermissionMap = Record<UserRole, readonly string[]>;

export const RolePermissions: RolePermissionMap = {
  [UserRole.ADMIN]: [
    'manageUsers',
    'viewReports',
    'editSettings',
    'assignRoles',
  ],
  [UserRole.MANAGER]: [
    'viewReports',
    'assignTasks',
    'addshifts',
    'addschedule',
    'manageEmployees',
  ],
  [UserRole.EMPLOYEE]: [
    'viewTasks',
    'updateProfile',
    'showShifts',
    'showSchedule',
    'updateStatus',
  ],
} as const;

/** Union of **all** permission strings that exist in the map */
export type Permission =
  (typeof RolePermissions)[keyof typeof RolePermissions][number];

/** Role hierarchy – higher number = higher privilege */
const RoleLevel: Record<UserRole, number> = {
  [UserRole.ADMIN]: 3,
  [UserRole.MANAGER]: 2,
  [UserRole.EMPLOYEE]: 1,
};

/** Cached list of **every** permission (ADMIN gets them all) */
const adminPermissionsCache: readonly Permission[] = (() => {
  const set = new Set<Permission>();
  Object.values(RolePermissions).forEach((perms) =>
    perms.forEach((p) => set.add(p))
  );
  return Array.from(set);
})();

/** --------------------------------------------------------------
 *  Public helpers
 *  -------------------------------------------------------------- */

/** Does the role have the requested permission? ADMIN always does. */
export const hasPermission = (
  role: UserRole,
  permission: Permission
): boolean => {
  if (role === UserRole.ADMIN) return true;
  return (RolePermissions[role] ?? []).includes(permission);
};

/** Can *actor* manage *target* (same or lower level)? */
export const canManageRole = (
  actorRole: UserRole,
  targetRole: UserRole
): boolean => RoleLevel[actorRole] >= RoleLevel[targetRole];

/** All permissions for a role – ADMIN receives the full cache. */
export const getPermissionsForRole = (
  role: UserRole
): readonly Permission[] => {
  return role === UserRole.ADMIN ? adminPermissionsCache : RolePermissions[role];
};

/** Runtime guard – useful for DB values or token claims */
export const isValidRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && Object.values(UserRole).includes(value as UserRole);