'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useDashboard from './useDashboard';
import { resolveRoutePermission } from '@/constants/permissions';

/**
 * Route Guard سمت کلاینت — فقط برای UX (جلوگیری از نمایش UI نامرتبط).
 * این لایه امنیتی واقعی نیست؛ Backend باید روی هر API، Role/Permission را
 * مستقل بررسی کند.
 */
export function useRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoadingUser, isAuthenticated, hasPermission } = useDashboard();

  useEffect(() => {
    if (isLoadingUser || !isAuthenticated) return;

    const requiredPermission = resolveRoutePermission(pathname);
    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.replace('/login');
    }
  }, [isLoadingUser, isAuthenticated, pathname, hasPermission, router]);
}