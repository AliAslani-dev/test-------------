'use client';

import WholesaleOrderTab from '@/components/order';
import useDashboard from '../../../../hooks/useDashboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { USER_ROLES } from '@/constants/roles';

//  ایمپورت کامپوننت تب سفارش مخصوص این دو رول سازمانی و گالری
import OrganGalleryOrderTab from '@/components/wholesale-orders';

export default function OrdersPage() {
  const { role, activeUserId, hasRole } = useDashboard();

  if (!role) return <LoadingSpinner />;

  //  اگه organizational یا gallery بود → تب سفارش دیگه
  const isOrgOrGallery = hasRole(USER_ROLES.ORGANIZATIONAL, USER_ROLES.GALLERY);

  if (isOrgOrGallery) {
    return <OrganGalleryOrderTab />;
  }

  // پیشفرض: همون قبلی
  return <WholesaleOrderTab userId={activeUserId} role={role} />;
}
