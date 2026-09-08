'use client';

import TagsTab from '@/components/tags';
import useDashboard from '../../../../hooks/useDashboard';

export default function TagsPage() {
  const { userId, setActiveTagId } = useDashboard();

  return <TagsTab setActiveTagId={setActiveTagId} userId={userId} />;
}