'use client';

import ProductTab from '@/components/product';
import useDashboard from '../../../../hooks/useDashboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ProductsPage() {
  const { role, activeBucketId, activeFrameId } = useDashboard();

  if (!role) return <LoadingSpinner />;

  return <ProductTab role={role} bucketId={activeBucketId} frameId={activeFrameId} />;
}