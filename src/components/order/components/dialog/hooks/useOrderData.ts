import { useState, useEffect } from 'react';
import { getFramesByBucket } from '@/api/frame/service';
import { getPurchaseSettlementTypes, getSendTypes } from '@/api/order/service';

export const useOrderData = (order: any, canEdit: boolean) => {
  const [catalogFrames, setCatalogFrames] = useState<any[]>([]);
  const [allSettlementTypes, setAllSettlementTypes] = useState<any[]>([]);
  const [allSendTypes, setAllSendTypes] = useState<any[]>([]);

  useEffect(() => {
    if (canEdit && order) {
      getFramesByBucket(order.bucketId, { page: 1, per_page: 500 })
        .then((res) => {
          if (res?.frames) setCatalogFrames(res.frames);
        })
        .catch(console.error);
    }
  }, [order, canEdit]);

  useEffect(() => {
    if (order?.status > 2) {
      getPurchaseSettlementTypes().then((res) => setAllSettlementTypes(res || []));
      getSendTypes().then((res) => setAllSendTypes(res || []));
    }
  }, [order?.status]);

  /* تغییر تایپ ورودی به number | null | undefined */
  const getSettlementName = (settlementTypeId: number | null | undefined): string => {
    if (!settlementTypeId) return '—';
    return allSettlementTypes.find((t) => t.id === settlementTypeId)?.name || '—';
  };

  const getSendName = (sendTypeId: number | null | undefined): string => {
    if (!sendTypeId) return '—';
    return allSendTypes.find((t) => t.id === sendTypeId)?.name || '—';
  };

  const getSendType = (sendTypeId: number | null | undefined) => {
    if (!sendTypeId) return null;
    return allSendTypes.find((t) => t.id === sendTypeId) || null;
  };

  return {
    catalogFrames,
    allSettlementTypes,
    allSendTypes,
    getSettlementName,
    getSendName,
    getSendType,
  };
};
