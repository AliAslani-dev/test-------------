'use client';

import { useRouter } from 'next/navigation';
import FrameTab from '@/components/frame';
import useDashboard from '../../../../hooks/useDashboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function FramesPage() {
  const router = useRouter();
  const { role, activeBucketId, setActiveBucketId, setActiveFrameId } = useDashboard();

  if (!role) return <LoadingSpinner />;

  const handleSetActiveFrameId: React.Dispatch<React.SetStateAction<number | null>> = (
    value,
  ) => {
    setActiveFrameId((prev) => {
      const next = typeof value === 'function' ? (value as (p: number | null) => number | null)(prev) : value;
      if (next) router.push('/products');
      return next;
    });
  };

  return (
    <FrameTab
      role={role}
      bucketId={activeBucketId}
      setActiveBucketId={setActiveBucketId}
      setActiveFrameId={handleSetActiveFrameId}
    />
  );
}