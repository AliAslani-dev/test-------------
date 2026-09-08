'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import { useRouter } from 'next/navigation';
import { get2FStatus } from '@/api/auth/service';
import { CurrentUser } from '@/api/auth/dto';
import { USER_ROLES, UserRole } from '@/constants/roles';
import { Permission, ROLE_PERMISSIONS } from '@/constants/permissions';
import { removeToken } from '@/utils/auth';

interface DashboardContextType {
  // --- منبع اصلی احراز هویت/کاربر (فقط از get2FStatus) ---
  user: CurrentUser | null;
  isLoadingUser: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
  hasPermission: (permission: Permission) => boolean;

  // --- دسترسی سریع؛ اینها State جدا نیستند، فقط از user مشتق می‌شوند ---
  role: UserRole | null;
  userId: number | null;
  email: string | null;
  isAdmin: boolean;

  // --- state های ناوبری داشبورد (بدون تغییر نسبت به قبل) ---
  activeBucketId: number | null;
  setActiveBucketId: Dispatch<SetStateAction<number | null>>;
  activeFrameId: number | null;
  setActiveFrameId: Dispatch<SetStateAction<number | null>>;
  activeUserId: number | null;
  setActiveUserId: Dispatch<SetStateAction<number | null>>;
  activeZarplusUserId: number | null;
  setActiveZarplusUserId: Dispatch<SetStateAction<number | null>>;
  activeTagId: number | null;
  setActiveTagId: Dispatch<SetStateAction<number | null>>;
  desktopDrawerOpen: boolean;
  setDesktopDrawerOpen: Dispatch<SetStateAction<boolean>>;
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: Dispatch<SetStateAction<boolean>>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [activeBucketId, setActiveBucketId] = useState<number | null>(null);
  const [activeFrameId, setActiveFrameId] = useState<number | null>(null);
  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const [activeZarplusUserId, setActiveZarplusUserId] = useState<number | null>(null);
  const [activeTagId, setActiveTagId] = useState<number | null>(null);

  const [desktopDrawerOpen, setDesktopDrawerOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const fetchUser = useCallback(async () => {
    setIsLoadingUser(true);
    try {
      const currentUser = await get2FStatus();

      if (!currentUser.enabled) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (err: any) {
      setUser(null);
      setIsAuthenticated(false);

      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        removeToken();
        router.replace('/login');
      }
    } finally {
      setIsLoadingUser(false);
    }
  }, [router]);

  // فقط یک‌بار موقع Mount شدن Provider اجرا می‌شود (بعد از هر Refresh هم دوباره)
  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  const hasPermission = useCallback(
    (permission: Permission) => (user ? (ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false) : false),
    [user],
  );

  const isAdmin = useMemo(
    () => hasRole(USER_ROLES.ADMIN, USER_ROLES.SELLER),
    [hasRole],
  );

  const value: DashboardContextType = {
    user,
    isLoadingUser,
    isAuthenticated,
    refreshUser: fetchUser,
    hasRole,
    hasPermission,

    role: user?.role ?? null,
    userId: user?.id ?? null,
    email: user?.email ?? null,
    isAdmin,

    activeBucketId,
    setActiveBucketId,
    activeFrameId,
    setActiveFrameId,
    activeUserId,
    setActiveUserId,
    activeZarplusUserId,
    setActiveZarplusUserId,
    activeTagId,
    setActiveTagId,

    desktopDrawerOpen,
    setDesktopDrawerOpen,
    mobileDrawerOpen,
    setMobileDrawerOpen,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboardContext must be used within a DashboardProvider');
  return ctx;
}