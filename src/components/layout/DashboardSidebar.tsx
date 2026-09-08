'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Box, Toolbar, Typography } from '@mui/material';
import useText from '@/hooks/useText';
import { useLang } from '@/hooks/LanContext';
import Drawer from '@/components/drawer';
import useDashboard from '../../../hooks/useDashboard';
import { AdminTab, ProviderTab } from '@/constants';
import { drawerItems, drawerBottomItems } from '@/components/drawer/data';
import DrawerActivableList from '@/components/drawer/components/activable-list';
import DrawerClickableList from '@/components/drawer/components/clickable-list';
import { PERMISSIONS, Permission } from '@/constants/permissions';
import { USER_ROLES } from '@/constants/roles';
import SX from './styles';

const MENU_ITEM_PERMISSIONS: Record<string, Permission> = {
  buckets: PERMISSIONS.BUCKETS_VIEW,
  categories: PERMISSIONS.CATEGORIES_VIEW,
  users: PERMISSIONS.USERS_VIEW,
  'followers-provider': PERMISSIONS.FOLLOWERS_VIEW,
  'orders-provider': PERMISSIONS.ORDERS_VIEW,
  tags: PERMISSIONS.TAGS_VIEW,
  profile: PERMISSIONS.PROFILE_VIEW,
  accounting: PERMISSIONS.ACCOUNTING_VIEW,
  organization: PERMISSIONS.ORGANIZATION_VIEW,
};

const ROUTE_MAP: Record<string, string> = {
  buckets: '/dashboard/buckets',
  categories: '/dashboard/categories',
  users: '/dashboard/users',
  'followers-provider': '/dashboard/followers',
  'orders-provider': '/dashboard/orders',
  tags: '/dashboard/tags',
  profile: '/dashboard/profile',
  ccounting: '/dashboard/accounting',
  frames: '/dashboard/frames',
  products: '/dashboard/products',
  followers: '/dashboard/followers',
  orders: '/dashboard/orders',
  tag: '/dashboard/tag',
  organization: '/dashboard/organization',
};

function getDefaultTabByRole(hasPermission: (permission: Permission) => boolean): string {
  const accessibleItems = drawerItems.filter((it) => {
    const permission = MENU_ITEM_PERMISSIONS[it.title_en];
    return permission ? hasPermission(permission) : false;
  });

  return accessibleItems.length > 0 ? accessibleItems[0].title_en : 'dashboard';
}

function resolveActiveMenuKey(
  pathname: string,
  hasPermission: (permission: Permission) => boolean,
): AdminTab | ProviderTab {
  if (pathname === '/dashboard') {
    return getDefaultTabByRole(hasPermission) as AdminTab | ProviderTab;
  }

  if (pathname.startsWith('/dashboard/buckets')) return 'buckets';
  if (pathname.startsWith('/dashboard/categories')) return 'categories';
  if (pathname.startsWith('/dashboard/users')) return 'users';
  if (pathname.startsWith('/dashboard/followers')) return 'followers-provider';
  if (pathname.startsWith('/dashboard/orders')) return 'orders-provider';
  if (pathname.startsWith('/dashboard/accounting')) return 'accounting';
  if (pathname.startsWith('/dashboard/tags')) return 'tags';
  if (pathname.startsWith('/dashboard/profile')) return 'profile';
  if (pathname.startsWith('/dashboard/frames')) return 'frames';
  if (pathname.startsWith('/dashboard/products')) return 'products';
  if (pathname.startsWith('/dashboard/tag')) return 'tag';
  if (pathname.startsWith('/dashboard/organization')) return 'organization';
  return getDefaultTabByRole(hasPermission) as AdminTab | ProviderTab;
}

interface SidebarContentProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SidebarContent({ open, setOpen }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission } = useDashboard();

  const items = drawerItems
    .filter((it) => {
      const permission = MENU_ITEM_PERMISSIONS[it.title_en];
      return permission ? hasPermission(permission) : false;
    })
    .map((it) => ({ ...it, link: ROUTE_MAP[it.title_en] ?? it.link }));

  const activeTab = resolveActiveMenuKey(pathname, hasPermission);

  useEffect(() => {
    if (pathname === '/dashboard') {
      const defaultTab = getDefaultTabByRole(hasPermission);
      const redirectPath = ROUTE_MAP[defaultTab] || '/dashboard/buckets';
      router.replace(redirectPath);
    }
  }, [pathname, hasPermission, router]);

  return (
    <>
      <DrawerActivableList items={items} open={open} setOpen={setOpen} activeTab={activeTab} />
      <DrawerClickableList items={drawerBottomItems} open={open} />
    </>
  );
}

export default function DashboardSidebar() {
  const { lang } = useLang();
  const { t } = useText('base', lang);
  const { desktopDrawerOpen, setDesktopDrawerOpen, hasRole, role } = useDashboard();

  const isAdmin = hasRole(USER_ROLES.ADMIN, USER_ROLES.SELLER);

  return (
    <Drawer
      variant="permanent"
      anchor="right"
      open={desktopDrawerOpen}
      PaperProps={{ sx: SX.drawer }}
    >
      <Box sx={SX.drawer_wrapper}>
        <Toolbar sx={SX.toolbar}>
          <Box sx={SX.talasys_wrapper}>
            <Image
              src="/logos/ZarHubIcon.jpg"
              alt="ZarHubIcon"
              width={54}
              height={58.7}
              style={{ objectFit: 'cover' }}
            />
            {desktopDrawerOpen && (
              <Box sx={SX.talasys_user_wrapper}>
                <Typography variant="h1" sx={SX.talasys_value}>
                  {t('zar_hub')}
                </Typography>
                <Typography variant="body1" sx={SX.user_value}>
                  {role === USER_ROLES.ADMIN
                    ? t('admin')
                    : role === USER_ROLES.SELLER
                      ? t('banking-seller')
                      : role === USER_ROLES.PROVIDER
                        ? t('gold_wholesaler')
                        : t('user')}
                </Typography>
              </Box>
            )}
          </Box>
        </Toolbar>
        <Box sx={SX.lists_wrapper}>
          <SidebarContent open={desktopDrawerOpen} setOpen={setDesktopDrawerOpen} />
        </Box>
      </Box>
    </Drawer>
  );
}
