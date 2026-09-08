'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import FrameTab from '@/components/frame';
import useDashboard from '../../../../../../hooks/useDashboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function BucketFramesPage() {
  const params = useParams<{ bucketId: string }>();
  const bucketId = Number(params.bucketId);
  const { role, setActiveBucketId, setActiveFrameId } = useDashboard();

  useEffect(() => {
    if (!Number.isNaN(bucketId)) setActiveBucketId(bucketId);
  }, [bucketId, setActiveBucketId]);

  if (!role) return <LoadingSpinner />;
  if (Number.isNaN(bucketId)) return null;

  return (
    <FrameTab
      role={role}
      bucketId={bucketId}
      setActiveBucketId={setActiveBucketId}
      setActiveFrameId={setActiveFrameId}
    />
  );
}
