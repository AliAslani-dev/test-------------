'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import ProductTab from '@/components/product';
import useDashboard from '../../../../../../../../hooks/useDashboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function FrameProductsPage() {
  const params = useParams<{ bucketId: string; frameId: string }>();
  const bucketId = Number(params.bucketId);
  const frameId = Number(params.frameId);
  const { role, setActiveBucketId, setActiveFrameId } = useDashboard();

  useEffect(() => {
    if (!Number.isNaN(bucketId)) setActiveBucketId(bucketId);
    if (!Number.isNaN(frameId)) setActiveFrameId(frameId);
  }, [bucketId, frameId, setActiveBucketId, setActiveFrameId]);

  if (!role) return <LoadingSpinner />;
  if (Number.isNaN(bucketId) || Number.isNaN(frameId)) return null;

  return <ProductTab role={role} bucketId={bucketId} frameId={frameId} />;
}