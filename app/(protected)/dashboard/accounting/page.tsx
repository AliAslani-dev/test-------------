'use client';

import useDashboard from '../../../../hooks/useDashboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import AccountingTab from '@/components/accounting';

export default function GalleryAccountingPage() {
  const { role, userId } = useDashboard();
  if (!role) return <LoadingSpinner />;

  return <AccountingTab userId={userId} role={role} />;
}
