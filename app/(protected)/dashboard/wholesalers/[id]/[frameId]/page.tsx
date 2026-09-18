'use client';

import { useParams } from 'next/navigation';
import FrameTab from '@/components/wholesaler/frame/index';
import { useDashboardContext } from '../../../../../../contexts/DashboardContext';

export default function WholesalerFrameProductsPage() {
  const params = useParams<{ id: string; frameId: string }>();
  const { userId } = useDashboardContext();

  const frameId = Number(params.frameId);
  const wholesalerId = Number(params.id);

  return (
    <FrameTab
      wholesalerId={wholesalerId}
      frameId={frameId}
      userId={userId}
      tagContext={null}
    />
  );
}