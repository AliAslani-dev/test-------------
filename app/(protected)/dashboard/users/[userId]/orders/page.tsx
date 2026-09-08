'use client';

import WholesaleOrderTab from '@/components/order';
import useDashboard from '../../../../../../hooks/useDashboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useParams } from 'next/navigation';

export default function OrdersPage() {
  const params = useParams();
  const { role } = useDashboard();
  
  if (!role) return <LoadingSpinner />;

  // گرفتن userId از پارامترهای URL
  const userId = params?.userId ? Number(params.userId) : null;

  // اگه userId وجود نداشت، پیام خطا نشون بده
  if (!userId) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>لطفاً یک کاربر را انتخاب کنید</p>
      </div>
    );
  }

  return <WholesaleOrderTab userId={userId} role={role} />;
}