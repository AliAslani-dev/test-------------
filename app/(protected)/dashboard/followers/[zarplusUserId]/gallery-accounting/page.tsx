'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import GalleryAccountingTab from '@/components/gallery-accounting';
import useDashboard from '../../../../../../hooks/useDashboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function OwnGalleryAccountingPage() {
  const params = useParams<{ zarplusUserId: string }>();
  const zarplusUserId = Number(params.zarplusUserId);
  const { role, userId, setActiveZarplusUserId } = useDashboard();

  useEffect(() => {
    if (!Number.isNaN(zarplusUserId)) setActiveZarplusUserId(zarplusUserId);
  }, [zarplusUserId, setActiveZarplusUserId]);

  if (!role) return <LoadingSpinner />;
  if (Number.isNaN(zarplusUserId)) return null;

  return <GalleryAccountingTab userId={userId} zarplusUserId={zarplusUserId} role={role} />;
}