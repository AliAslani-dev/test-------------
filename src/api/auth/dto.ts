import { UserRole, isValidUserRole } from '@/constants/roles';
export interface CurrentUser {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  enabled: boolean;
}

/**
 * پاسخ خام API را Validate می‌کند.
 * اگر id/email/username غایب یا role نامعتبر باشد، null برمی‌گرداند.
 * هرگز Role پیش‌فرض قرار نمی‌دهد.
 */
export const mapToCurrentUser = (response: any): CurrentUser | null => {
  if (!response || typeof response !== 'object') return null;

  const { id, email, username, role, enabled } = response;

  if (typeof id !== 'number') return null;
  if (typeof email !== 'string' || typeof username !== 'string') return null;
  if (!isValidUserRole(role)) return null;

  return {
    id,
    email,
    username,
    role,
    enabled: enabled === 1 || enabled === true,
  };
};

// برای سازگاری با ایمپورت‌های قدیمی که این نام‌ها را استفاده می‌کنند
export type TwoFStatusDTO = CurrentUser;
export const get2FStatusDTO = mapToCurrentUser;
