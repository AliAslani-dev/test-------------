import { USER_ROLES, UserRole } from './roles';

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  BUCKETS_VIEW: 'buckets.view',
  CATEGORIES_VIEW: 'categories.view',
  USERS_VIEW: 'users.view',
  USERS_MANAGE: 'users.manage',
  FRAMES_VIEW: 'frames.view',
  PRODUCTS_VIEW: 'products.view',
  FOLLOWERS_VIEW: 'followers.view',
  ACCOUNTING_VIEW: 'accounting.view',
  ORDERS_VIEW: 'orders.view',
  TAGS_VIEW: 'tags.view',
  PROFILE_VIEW: 'profile.view',
  ORGANIZATION_VIEW: 'organization.view',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Role → Permission (تنها جای مجاز برای تعریف این رابطه) */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.BUCKETS_VIEW,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.FRAMES_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.TAGS_VIEW,
    PERMISSIONS.ORGANIZATION_VIEW,
  ],
  [USER_ROLES.SELLER]: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.TAGS_VIEW, PERMISSIONS.ORDERS_VIEW],
  [USER_ROLES.PROVIDER]: [
    PERMISSIONS.BUCKETS_VIEW,
    PERMISSIONS.FRAMES_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.FOLLOWERS_VIEW,
    PERMISSIONS.ACCOUNTING_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  [USER_ROLES.ORGANIZATIONAL]: [],
  [USER_ROLES.GALLERY]: [],
};

/** Route (پیشوند) → Permission لازم برای دسترسی به آن مسیر و زیرمسیرهایش */
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/dashboard': PERMISSIONS.DASHBOARD_VIEW,
  '/dashboard/buckets': PERMISSIONS.BUCKETS_VIEW,
  '/dashboard/categories': PERMISSIONS.CATEGORIES_VIEW,
  '/dashboard/users': PERMISSIONS.USERS_VIEW,
  '/dashboard/followers': PERMISSIONS.FOLLOWERS_VIEW,
  '/dashboard/gallery-accounting': PERMISSIONS.ACCOUNTING_VIEW,
  '/dashboard/orders': PERMISSIONS.ORDERS_VIEW,
  '/dashboard/tags': PERMISSIONS.TAGS_VIEW,
  '/dashboard/profile': PERMISSIONS.PROFILE_VIEW,
};

/** طولانی‌ترین پیشوند منطبق را پیدا می‌کند تا مسیرهای Nested هم پوشش داده شوند */
export function resolveRoutePermission(pathname: string): Permission | null {
  const matched = Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname === route || pathname.startsWith(`${route}/`));

  return matched ? ROUTE_PERMISSIONS[matched] : null;
}
