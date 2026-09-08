'use client';

import FollowerTab from '@/components/follower';
import useDashboard from '../../../../../../hooks/useDashboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useParams } from 'next/navigation';

export default function FollowersPage() {
  const params = useParams();
  const { role, setActiveUserId, setActiveZarplusUserId } = useDashboard();
  
  if (!role) return <LoadingSpinner />;

  // گرفتن userId از پارامترهای URL
  const userId = params?.userId ? Number(params.userId) : null;

  return (
    <FollowerTab
      userId={userId as number}
      role={role}
      setActiveZarPlusUserId={setActiveZarplusUserId}
      setActiveUserId={setActiveUserId}
    />
  );
}