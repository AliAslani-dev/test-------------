'use client';

import WholesaleOrderTab from '@/components/order';
import useDashboard from '../../../../hooks/useDashboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function OrdersPage() {
  const { role, activeUserId } = useDashboard();

  if (!role) return <LoadingSpinner />;

  return <WholesaleOrderTab userId={activeUserId} role={role} />;
}