'use client';

import GalleryAccountingTab from '@/components/gallery-accounting';
import useDashboard from '../../../../../../../hooks/useDashboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useParams } from 'next/navigation';

export default function GalleryAccountingPage() {
  const params = useParams();
  const { role } = useDashboard(); // حذف activeZarplusUserId از useDashboard

  if (!role) return <LoadingSpinner />;

  // گرفتن userId از پارامترهای URL
  const userId = params?.userId ? Number(params.userId) : null;

  // گرفتن zarplusUserId از پارامترهای URL
  const zarplusUserId = params?.id ? Number(params.id) : null;
  if (Number.isNaN(zarplusUserId)) return null;

  return (
    <GalleryAccountingTab
      userId={userId}
      zarplusUserId={zarplusUserId!} // استفاده از zarplusUserId دریافت شده از params
      role={role}
    />
  );
}
