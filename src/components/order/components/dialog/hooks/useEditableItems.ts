import { useState, useEffect } from 'react';
import { EditableItem } from '../types';
import { generateUid, getItemKey } from '../utils/formatters';

interface UseEditableItemsProps {
  order: any;
  status: number;
  canEdit: boolean;
}

export const useEditableItems = ({ order, status, canEdit }: UseEditableItemsProps) => {
  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);

  useEffect(() => {
    if (!order) {
      setEditableItems([]);
      return;
    }

    // @ts-ignore - برای دسترسی به finalItems و items
    const finalItemsList = order.finalItems ?? null;

    const hasFinalItems = status >= 2 && Array.isArray(finalItemsList);
    let finalItemsPool = hasFinalItems ? [...finalItemsList] : [];

    // @ts-ignore
    const initialItems = order.items.map((item: any) => {
      const galleryWeight = item.weight || 0;
      const galleryQuantity = item.quantity || 0;
      const galleryDescription = item.description || '';

      let finalWeight = galleryWeight;
      let finalQuantity = galleryQuantity;
      let wholesalerDescription = '';

      if (hasFinalItems) {
        const itemKey = getItemKey(item);
        const matchIndex = finalItemsPool.findIndex((f: any) => getItemKey(f) === itemKey);

        if (matchIndex !== -1) {
          const match = finalItemsPool[matchIndex];
          finalWeight = match.weight || 0;
          finalQuantity = match.quantity || 0;

          const finalDesc = match.description || '';
          if (finalDesc.includes('\n---\n')) {
            wholesalerDescription = finalDesc.split('\n---\n')[1] || '';
          } else if (finalDesc !== galleryDescription) {
            wholesalerDescription = finalDesc;
          }
          finalItemsPool.splice(matchIndex, 1);
        } else {
          finalWeight = 0;
          finalQuantity = 0;
        }
      }

      return {
        uid: generateUid(),
        isNew: false,
        frame: item.frame,
        product: item.product || null,
        variant: item.variant || null,
        galleryWeight,
        galleryQuantity,
        finalWeight,
        finalQuantity,
        galleryDescription,
        wholesalerDescription,
        availableProducts: [],
      };
    });

    if (hasFinalItems && finalItemsPool.length > 0) {
      finalItemsPool.forEach((item: any) => {
        const finalDesc = item.description || '';
        let parsedWDesc = finalDesc.includes('\n---\n')
          ? finalDesc.split('\n---\n')[1] || ''
          : finalDesc;

        initialItems.push({
          uid: generateUid(),
          isNew: false,
          frame: item.frame,
          product: item.product || null,
          variant: item.variant || null,
          galleryWeight: 0,
          galleryQuantity: 0,
          finalWeight: item.weight || 0,
          finalQuantity: item.quantity || 0,
          galleryDescription: '',
          wholesalerDescription: parsedWDesc,
          availableProducts: [],
        });
      });
    }

    setEditableItems(initialItems);
  }, [order, status]);

  const updateItem = (uid: string, field: keyof EditableItem, value: any) => {
    if (!canEdit) return;
    setEditableItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, [field]: value } : item)),
    );
  };

  const addNewRow = () => {
    if (!canEdit) return;
    setEditableItems((prev) => [
      ...prev,
      {
        uid: generateUid(),
        isNew: true,
        frame: null,
        product: null,
        variant: null,
        galleryWeight: 0,
        galleryQuantity: 0,
        finalWeight: '',
        finalQuantity: 1,
        galleryDescription: '',
        wholesalerDescription: '',
        availableProducts: [],
      },
    ]);
  };

  const removeItem = (uid: string, isNew: boolean) => {
    if (!canEdit) return;
    if (isNew) {
      setEditableItems((prev) => prev.filter((item) => item.uid !== uid));
    } else {
      updateItem(uid, 'finalWeight', 0);
      updateItem(uid, 'finalQuantity', 0);
    }
  };

  const sortAndGroup = () => {
    setEditableItems((prev) => {
      return [...prev].sort((a, b) => {
        const typeA = a.variant ? 3 : a.product ? 2 : 1;
        const typeB = b.variant ? 3 : b.product ? 2 : 1;
        if (typeA !== typeB) return typeA - typeB;

        const frameA = a.frame?.id || 0;
        const frameB = b.frame?.id || 0;
        if (frameA !== frameB) return frameA - frameB;

        const prodA = a.product?.id || 0;
        const prodB = b.product?.id || 0;
        if (prodA !== prodB) return prodA - prodB;

        return (a.variant?.id || 0) - (b.variant?.id || 0);
      });
    });
  };

  return {
    editableItems,
    updateItem,
    addNewRow,
    removeItem,
    sortAndGroup,
    setEditableItems,
  };
};
