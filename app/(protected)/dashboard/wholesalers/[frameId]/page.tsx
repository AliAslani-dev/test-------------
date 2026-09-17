'use client';

import { useParams } from 'next/navigation';
import FrameTab from '@/components/wholesalers/frame';

export default function WholesalerFrameProductsPage() {
  const params = useParams<{ id: string; frameId: string }>();
  const wholesalerId = Number(params.id);
  const frameId = Number(params.frameId);

  if (Number.isNaN(wholesalerId) || Number.isNaN(frameId)) return null;

  return <FrameTab wholesalerId={wholesalerId} frameId={frameId} tagContext={null} />;
}