'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import TagTab from '@/components/tag';
import useDashboard from '../../../../../hooks/useDashboard';

export default function TagDetailPage() {
  const params = useParams<{ tagId: string }>();
  const tagId = Number(params.tagId);
  const { setActiveTagId } = useDashboard();

  useEffect(() => {
    if (!Number.isNaN(tagId)) setActiveTagId(tagId);
  }, [tagId, setActiveTagId]);

  return <TagTab tagId={Number.isNaN(tagId) ? null : tagId} />;
}