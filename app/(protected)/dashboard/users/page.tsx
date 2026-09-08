'use client';

import UserTab from '@/components/user';
import useDashboard from '../../../../hooks/useDashboard';

export default function UsersPage() {
  const { setActiveUserId } = useDashboard();

  return <UserTab setActiveUserId={setActiveUserId} />;
}