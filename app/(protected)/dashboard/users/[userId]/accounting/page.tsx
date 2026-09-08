'use client';

import useDashboard from '../../../../../../hooks/useDashboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useParams } from 'next/navigation';
import AccountingTab from '@/components/accounting';

export default function GalleryAccountingPage() {
  const params = useParams();
  const { role } = useDashboard();

  if (!role) return <LoadingSpinner />;

  // گرفتن userId از پارامترهای URL
  const userId = params?.userId ? Number(params.userId) : null;

  return <AccountingTab userId={userId} role={role} />;
}
