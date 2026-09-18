'use client';

import { useParams } from 'next/navigation';
import WholesalerTab from '@/components/wholesaler'; // ← همون WholesalerTab قبلی

export default function WholesalerPage() {
  const params = useParams<{ id: string }>();
  const wholesalerId = Number(params.id);

  if (Number.isNaN(wholesalerId)) return null;

  return <WholesalerTab wholesalerId={wholesalerId} />;
}