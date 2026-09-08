'use client';

import { useRouter } from 'next/navigation';
import BucketTab from '@/components/bucket';
import BucketProviderTab from '@/components/bucket-provider';
import useDashboard from '../../../../hooks/useDashboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function BucketsPage() {
  const router = useRouter();
  const { role, isAdmin, setActiveBucketId } = useDashboard();

  if (!role) return <LoadingSpinner />;

  // فقط برای sync کردن context، navigation از طریق href در columns انجام می‌شود
  const handleSetActiveBucketId: React.Dispatch<React.SetStateAction<number | null>> = (value) => {
    setActiveBucketId((prev) => {
      const next =
        typeof value === 'function' ? (value as (p: number | null) => number | null)(prev) : value;
      return next;
    });
  };

  return isAdmin ? (
    <BucketTab setActiveBucketId={handleSetActiveBucketId} />
  ) : (
    <BucketProviderTab setActiveBucketProviderId={handleSetActiveBucketId} />
  );
}
