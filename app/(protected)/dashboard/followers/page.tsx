'use client';

import FollowerTab from '@/components/follower';
import useDashboard from '../../../../hooks/useDashboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function FollowersPage() {
  const { role, userId, activeUserId, setActiveUserId, setActiveZarplusUserId } = useDashboard();

  if (!role) return <LoadingSpinner />;

  const isAdmin = role === 'banking-admin';

  return (
    <FollowerTab
      userId={(isAdmin ? activeUserId : userId) as number}
      role={role}
      setActiveZarPlusUserId={setActiveZarplusUserId}
      setActiveUserId={setActiveUserId}
    />
  );
}