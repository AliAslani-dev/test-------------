'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Dialog, DialogContent, Typography, useMediaQuery } from '@mui/material';
import Slide from '@mui/material/Slide';
import { useLang } from '@/hooks/LanContext';
import useText from '@/hooks/useText';
import theme from '@/styles/Theme';

// Types
import { WholesaleOrderDialogProps, EditableItem } from './types';

// Hooks
import { useEditableItems } from './hooks/useEditableItems';
import { useOrderActions } from './hooks/useOrderActions';
import { useOrderData } from './hooks/useOrderData';

// Components
import { OrderHeader } from './components/OrderHeader';
import { OrderInfoBar } from './components/OrderInfoBar';
import { OrderTable } from './components/OrderTable';
import { ActionButtons } from './components/ActionButtons';
import CustomTextField from '@/components/shared/custom-text-field';

// Utils
import { generateExcelFile } from './utils/excelExport';

// Constants
import { EDITABLE_STATUSES } from './constants';

// Styles
import DialogSX from '@/components/shared/dialog/styles';

// API
import { getProductsByFrame } from '@/api/product/service';

const WholesaleOrderDialog: React.FC<WholesaleOrderDialogProps> = (props) => {
  const { lang } = useLang();
  const { t } = useText('order', lang);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { open, onClose, showingWholesaleOrder, setShowingWholesaleOrder, onRefreshList } = props;

  const [exporting, setExporting] = useState(false);

  const [deliverAdditionalFields, setDeliverAdditionalFields] = useState<Record<string, string>>(
    {},
  );
  const order = showingWholesaleOrder;
  const status = order?.status ?? -1;
  const canEdit = EDITABLE_STATUSES.includes(status);

  const { catalogFrames, getSettlementName, getSendName, getSendType } = useOrderData(
    order,
    canEdit,
  );

  const selectedSendType = getSendType(order?.sendTypeId);

  const zarhubAdditionalFieldNames = useMemo(() => {
    const fields = selectedSendType?.zarhubAdditionalFields;

    if (!Array.isArray(fields)) return [];

    return fields

      .map((field: any) => (typeof field === 'string' ? field : field?.name))

      .filter(
        (fieldName: any): fieldName is string =>
          typeof fieldName === 'string' && fieldName.trim() !== '',
      );
  }, [selectedSendType]);

  useEffect(() => {
    if (status !== 3) {
      setDeliverAdditionalFields({});

      return;
    }

    const initialFields = Object.fromEntries(
      zarhubAdditionalFieldNames.map((fieldName) => [fieldName, '']),
    );

    setDeliverAdditionalFields(initialFields);
  }, [order?.id, order?.sendTypeId, status, zarhubAdditionalFieldNames]);

  const isDeliverAdditionalFieldsValid = useMemo(() => {
    return zarhubAdditionalFieldNames.every((fieldName) => {
      return /\S+/.test(deliverAdditionalFields[fieldName] || '');
    });
  }, [zarhubAdditionalFieldNames, deliverAdditionalFields]);

  const { editableItems, updateItem, addNewRow, removeItem, sortAndGroup, setEditableItems } =
    useEditableItems({ order, status, canEdit });

  const { loadingAction, onReject, onInProgress, onDeliver, onApprove } = useOrderActions(
    onRefreshList,
    onClose,
  );

  const totalInitialWeight = useMemo(() => {
    if (!order?.items) return 0;
    return (order.items as any[]).reduce((sum, item) => {
      if (item.variant && item.variant.weight && item.quantity) {
        return (
          sum + ((Number(item.variant.weight) * Number(item.frame.carat)) / 750) * item.quantity
        );
      }
      if (item.weight) {
        return sum + (Number(item.weight) * Number(item.frame.carat)) / 750;
      }
      return sum;
    }, 0);
  }, [order]);

  const totalFinalWeight = useMemo(() => {
    return editableItems.reduce((sum, item) => {
      const carat = Number(item.frame?.carat || 0);

      if (item.variant && item.finalQuantity) {
        return (
          sum + ((Number(item.variant.weight || 0) * carat) / 750) * Number(item.finalQuantity)
        );
      }
      if (item.finalWeight) {
        return sum + (Number(item.finalWeight) * carat) / 750;
      }
      return sum;
    }, 0);
  }, [editableItems]);

  const nonZeroGalleryItemsCount = useMemo(() => {
    return editableItems.filter((item) => {
      if (item.variant) return Number(item.galleryQuantity) > 0;
      return Number(item.galleryWeight) > 0;
    }).length;
  }, [editableItems]);

  const nonZeroFinalItemsCount = useMemo(() => {
    return editableItems.filter((item) => {
      if (item.variant) return Number(item.finalQuantity) > 0;
      return Number(item.finalWeight) > 0;
    }).length;
  }, [editableItems]);

  const displaySettlementName = getSettlementName(order?.settlementTypeId);

  const displaySendName = getSendName(order?.sendTypeId);

  const handleClose = () => {
    if (!loadingAction && !exporting) onClose();
  };

  const handleExportExcel = async () => {
    if (!order) return;
    setExporting(true);
    try {
      await generateExcelFile({
        order,
        items: editableItems,
        totalInitialWeight,
        totalFinalWeight,
        nonZeroGalleryItemsCount,
        nonZeroFinalItemsCount,
        finalGoldCredit: order.finalGoldCredit,
        finalRialCredit: order.finalRialCredit,
        displaySettlementName,
        displaySendName,
        t,
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleFrameSelect = async (uid: string, frame: any) => {
    if (!canEdit) return;
    updateItem(uid, 'frame', frame);
    updateItem(uid, 'product', null);
    updateItem(uid, 'variant', null);
    updateItem(uid, 'availableProducts', []);

    if (frame && order) {
      try {
        const res = await getProductsByFrame(order.bucketId, frame.id, {
          page: 1,
          per_page: 500,
        });
        if (res && res.products) {
          updateItem(uid, 'availableProducts', res.products);
        }
      } catch (e) {
        console.error('Failed to fetch products', e);
      }
    }
  };

  const handleApprove = () => {
    if (!order) return;
    onApprove(order.id, editableItems);
  };

  const handleDeliver = () => {
    if (!order) return;

    if (!isDeliverAdditionalFieldsValid) return;

    const payload =
      zarhubAdditionalFieldNames.length > 0
        ? Object.fromEntries(
            zarhubAdditionalFieldNames.map((fieldName) => [
              fieldName,

              (deliverAdditionalFields[fieldName] || '').trim(),
            ]),
          )
        : undefined;

    onDeliver(order.id, payload);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullScreen={isMobile}
      slots={isMobile ? { transition: Slide } : undefined}
      slotProps={isMobile ? { transition: { direction: 'up' as const } } : undefined}
      sx={{
        ...DialogSX.dialog,
        ...(isMobile ? DialogSX.bottom_sheet_dialog : {}),
        '& .MuiPaper-root': {
          ...(DialogSX.dialog['& .MuiPaper-root'] as any),
          ...(isMobile ? (DialogSX.bottom_sheet_dialog['& .MuiPaper-root'] as any) : {}),
          width: isMobile ? '100%' : 'calc(100vw - 24px)',
          maxWidth: '1600px',
          height: isMobile ? 'auto' : 'calc(100vh - 24px)',
          maxHeight: isMobile ? '90%' : 'auto',
          m: isMobile ? 0 : 'auto',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: { xs: '20px 20px 0 0', sm: '16px' },
        },
      }}
    >
      <OrderHeader
        orderTitle={order?.title}
        onClose={handleClose}
        disabled={loadingAction || exporting}
      />

      <DialogContent
        sx={{
          ...DialogSX.dialog_content,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          p: { xs: 1, sm: 3 },
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {order && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden',
              gap: 1.5,
              width: '100%',
            }}
          >
            <OrderInfoBar
              zarplusUser={order.zarplusUser}
              orderTitle={order.title}
              status={status}
              onExport={handleExportExcel}
              onSort={sortAndGroup}
              isExporting={exporting}
              hasItems={editableItems.length > 0}
              t={t}
            />

            <OrderTable
              items={editableItems}
              catalogFrames={catalogFrames}
              canEdit={canEdit}
              status={status}
              totalInitialWeight={totalInitialWeight}
              totalFinalWeight={totalFinalWeight}
              nonZeroGalleryItemsCount={nonZeroGalleryItemsCount}
              nonZeroFinalItemsCount={nonZeroFinalItemsCount}
              finalGoldCredit={order.finalGoldCredit}
              finalRialCredit={order.finalRialCredit}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
              onAddNewRow={addNewRow}
              onFrameSelect={handleFrameSelect}
              t={t}
              isMobile={isMobile}
            />

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', md: 'flex-start' },
                gap: 1.5,
                pt: 1,
                flexShrink: 0,
              }}
            >
              {status > 2 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    width: { xs: '100%', md: 'auto' },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 3,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      height: '100%',
                      pt: 1,
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.secondary' }}
                    >
                      {t('dialog.settlement_type')}:{' '}
                      <Box component="span" sx={{ color: 'text.primary', fontWeight: 800 }}>
                        {displaySettlementName}
                      </Box>
                    </Typography>

                    {order?.settlementTypeAdditionalFields &&
                      Object.entries(order.settlementTypeAdditionalFields).map(([key, value]) => (
                        <Typography
                          key={key}
                          sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.secondary' }}
                        >
                          {key}:{' '}
                          <Box component="span" sx={{ color: 'text.primary', fontWeight: 800 }}>
                            {value as React.ReactNode}
                          </Box>
                        </Typography>
                      ))}

                    <Typography
                      sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.secondary' }}
                    >
                      {t('dialog.send_type')}:{' '}
                      <Box component="span" sx={{ color: 'text.primary', fontWeight: 800 }}>
                        {displaySendName}
                      </Box>
                    </Typography>

                    {order?.sendTypeAdditionalFields &&
                      Object.entries(order.sendTypeAdditionalFields).map(([key, value]) => (
                        <Typography
                          key={key}
                          sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.secondary' }}
                        >
                          {key}:{' '}
                          <Box component="span" sx={{ color: 'text.primary', fontWeight: 800 }}>
                            {value as React.ReactNode}
                          </Box>
                        </Typography>
                      ))}

                    {order?.zarhubSendTypeAdditionalFields &&
                      Object.entries(order.zarhubSendTypeAdditionalFields).map(([key, value]) => (
                        <Typography
                          key={key}
                          sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.secondary' }}
                        >
                          {key}:{' '}
                          <Box component="span" sx={{ color: 'text.primary', fontWeight: 800 }}>
                            {value as React.ReactNode}
                          </Box>
                        </Typography>
                      ))}
                  </Box>
                </Box>
              )}

              {status === 3 && zarhubAdditionalFieldNames.length > 0 && (
                <Box
                  sx={{
                    display: 'grid',

                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(200px, 1fr))' },

                    gap: 1.5,

                    width: { xs: '100%', md: 'auto' },

                    minWidth: { md: '420px' },
                  }}
                >
                  {zarhubAdditionalFieldNames.map((fieldName, index) => (
                    <CustomTextField
                      key={fieldName}
                      id={`zarhub-send-field-${index}`}
                      title={fieldName}
                      value={deliverAdditionalFields[fieldName] || ''}
                      setValue={(value) =>
                        setDeliverAdditionalFields((prev) => ({
                          ...prev,

                          [fieldName]: value,
                        }))
                      }
                      hasStar
                      validate={(value) => /\S+/.test(value)}
                    />
                  ))}
                </Box>
              )}

              <ActionButtons
                status={status}
                loadingAction={loadingAction}
                isMobile={isMobile}
                hasItems={
                  editableItems.filter((item) => {
                    if (item.variant) return Number(item.finalQuantity) > 0;
                    return Number(item.finalWeight) > 0;
                  }).length > 0
                }
                onReject={() => order && onReject(order.id)}
                onInProgress={() => order && onInProgress(order.id)}
                onApprove={handleApprove}
                onDeliver={handleDeliver}
                deliverDisabled={!isDeliverAdditionalFieldsValid}
                t={t}
              />
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WholesaleOrderDialog;
