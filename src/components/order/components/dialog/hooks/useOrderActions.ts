import { useState } from 'react';
import {
  approveOrder,
  rejectOrder,
  inProgressOrder,
  deliverOrder,
  OrderItemsType,
} from '@/api/order/service';

import { EditableItem } from '../types';

export const useOrderActions = (onRefreshList?: () => void, onClose?: () => void) => {
  const [loadingAction, setLoadingAction] = useState(false);

  const executeAction = async (actionFn: () => Promise<any>) => {
    setLoadingAction(true);
    try {
      await actionFn();
      if (onRefreshList) onRefreshList();
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const buildApprovePayload = (items: EditableItem[]): OrderItemsType => {
    return items
      .filter((item) => {
        if (item.variant) return Number(item.finalQuantity) > 0;
        return Number(item.finalWeight) > 0;
      })
      .map((item) => {
        const combinedDesc = item.wholesalerDescription
          ? `${item.galleryDescription ? item.galleryDescription + '\n---\n' : ''}${item.wholesalerDescription}`
          : item.galleryDescription;

        if (item.variant) {
          return {
            variant_id: item.variant.id,
            quantity: Number(item.finalQuantity),
            description: combinedDesc,
          };
        } else if (item.product) {
          return {
            product_id: item.product.id,
            weight: Number(item.finalWeight),
            description: combinedDesc,
          };
        } else {
          return {
            frame_id: item.frame?.id || 0,
            weight: Number(item.finalWeight),
            description: combinedDesc,
          };
        }
      });
  };

  const onReject = (orderId: number) => executeAction(() => rejectOrder(orderId));

  const onInProgress = (orderId: number) => executeAction(() => inProgressOrder(orderId));

  const onDeliver = (orderId: number, sendTypeAdditionalFields?: Record<string, string>) =>
    executeAction(() => deliverOrder(orderId, sendTypeAdditionalFields));

  const onApprove = (orderId: number, items: EditableItem[]) => {
    const payload = buildApprovePayload(items);
    if (payload.length === 0) return;
    executeAction(() => approveOrder(orderId, payload));
  };

  return {
    loadingAction,
    onReject,
    onInProgress,
    onDeliver,
    onApprove,
  };
};
