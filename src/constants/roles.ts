export const USER_ROLES = {
  ADMIN: 'banking-admin',
  PROVIDER: 'banking-provider',
  SELLER: 'banking-seller',
  ORGANIZATIONAL: 'organizational',
  GALLERY: 'gallery',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

const ALL_ROLES: readonly string[] = Object.values(USER_ROLES);

export function isValidUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && ALL_ROLES.includes(value);
}
