'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  TextField,
  Autocomplete,
  Slide,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import { tPD } from '@/utils';
import theme from '@/styles/Theme';
import useText from '@/hooks/useText';
import DialogSX from '@/components/shared/dialog/styles';

import { getWholesalerFrames, getWholesalerFrameProducts } from '@/api/zarhub/service';
import { WholesaleOrderTable } from '../table';
import { useNotification } from '@/hooks/useNotification';
import { BasketItem } from '@/components/basket';

interface CloneOrderDialogProps {
  open: boolean;
  onClose: () => void;
  initialOrder: WholesaleOrderTable | undefined;
}

type EditableItem = {
  uid: string;
  isNew: boolean;
  frame: any | null;
  product: any | null;
  variant: any | null;
  weight: number | string;
  quantity: number | string;
  description: string;
  availableProducts: any[];
};

const convertToEnglishNumber = (value: string) => {
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = value;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persian[i], 'g'), String(i));
    result = result.replace(new RegExp(arabic[i], 'g'), String(i));
  }
  result = result.replace(/[^0-9.]/g, '');
  const parts = result.split('.');
  if (parts.length > 2) {
    result = parts[0] + '.' + parts.slice(1).join('');
  }
  return result;
};

const CloneOrderDialog: React.FC<CloneOrderDialogProps> = ({ open, onClose, initialOrder }) => {
  const { t } = useText('wholesaleOrder');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showNotification } = useNotification();

  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);
  const [catalogFrames, setCatalogFrames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && initialOrder) {
      // 1. Map existing order items into editable state
      const initial: EditableItem[] = initialOrder.items.map((item: any) => ({
        uid: Math.random().toString(36).substring(7),
        isNew: false,
        frame: item.frame,
        product: item.product || null,
        variant: item.variant || null,
        weight: item.weight || 0,
        quantity: item.quantity || 0,
        description: item.description || '',
        availableProducts: [],
      }));
      setEditableItems(initial);

      // 2. Fetch frames for adding new rows using gallery-side API
      // Using userId (zarhub_user_id) and zarplusUserId from the order
      getWholesalerFrames(initialOrder.userId, initialOrder.zarplusUserId).then((res) => {
        if (res && res.length > 0) setCatalogFrames(res);
      });
    } else {
      setEditableItems([]);
    }
  }, [open, initialOrder]);

  const handleUpdateItem = (uid: string, field: keyof EditableItem, value: any) => {
    setEditableItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, [field]: value } : item)),
    );
  };

  const handleFrameSelect = async (uid: string, frame: any) => {
    handleUpdateItem(uid, 'frame', frame);
    handleUpdateItem(uid, 'product', null);
    handleUpdateItem(uid, 'variant', null);
    handleUpdateItem(uid, 'availableProducts', []);

    if (frame && initialOrder) {
      try {
        const res = await getWholesalerFrameProducts(
          initialOrder.userId,
          initialOrder.zarplusUserId,
          frame.id,
          { page: 1, per_page: 500 },
        );
        if (res && res.products) {
          handleUpdateItem(uid, 'availableProducts', res.products);
        }
      } catch (e) {
        console.error('Failed to fetch products', e);
      }
    }
  };

  const handleTrashClick = (uid: string) => {
    setEditableItems((prev) => prev.filter((item) => item.uid !== uid));
  };

  const handleAddNewRow = () => {
    setEditableItems((prev) => [
      ...prev,
      {
        uid: Math.random().toString(36).substring(7),
        isNew: true,
        frame: null,
        product: null,
        variant: null,
        weight: '',
        quantity: 1,
        description: '',
        availableProducts: [],
      },
    ]);
  };

  const handleAddToBasket = () => {
    if (!initialOrder) return;
    setLoading(true);

    try {
      // 1. Get current basket
      const stored = localStorage.getItem('zarhub_basket');
      const currentBasket: BasketItem[] = stored ? JSON.parse(stored) : [];

      // 2. Map editable items to BasketItem type
      const newBasketItems: BasketItem[] = editableItems
        .filter((item) => item.frame) // Ensure empty rows aren't added
        .map((item) => {
          const imageUrl =
            item.product?.image ||
            item.product?.images?.[0] ||
            item.frame?.cover ||
            item.frame?.covers?.[0] ||
            '';

          return {
            id: Math.random().toString(36).substring(7),
            wholesaler_id: initialOrder.userId,
            bucket_id: initialOrder.bucketId,
            bucket_name: initialOrder.bucketName,
            frame_id: item.frame.id,
            frame_model: item.frame.model,
            carat: item.frame.carat,
            product_id: item.product?.id,
            product_model: item.product?.model,
            variant_id: item.variant?.id,
            variant_weight: item.variant?.weight,
            weight: Number(item.weight) || undefined,
            quantity: Number(item.quantity) || undefined,
            description: item.description,
            image_url: imageUrl,
          };
        });

      // 3. Save to Local Storage and trigger basket update
      const updatedBasket = [...currentBasket, ...newBasketItems];
      localStorage.setItem('zarhub_basket', JSON.stringify(updatedBasket));
      window.dispatchEvent(new Event('basket-updated'));

      showNotification(t('dialog.clone_order.added_to_basket_successfully'), 'success');
      onClose(); // Close dialog after successful clone
    } catch (e) {
      showNotification(t('error_notif') || 'Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <Box sx={{ ...DialogSX.header_container, flexShrink: 0 }}>
        <DialogTitle sx={DialogSX.header_title}>
          {t('dialog.clone_order.title')} - {initialOrder?.bucketName}
        </DialogTitle>
        <IconButton onClick={onClose} disabled={loading}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent
        sx={{ p: { xs: 1, sm: 3 }, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <Paper
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'hidden',
            border: '1px solid #f0f0f0',
            boxShadow: 'none',
          }}
        >
          <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Table stickyHeader sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ bgcolor: '#fafafa', fontWeight: 800 }}>
                    {t('dialog.row')}
                  </TableCell>
                  <TableCell align="center" sx={{ bgcolor: '#fafafa', fontWeight: 800 }}>
                    {t('dialog.image')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ bgcolor: '#fafafa', fontWeight: 800, minWidth: 150 }}
                  >
                    {t('dialog.frame')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ bgcolor: '#fafafa', fontWeight: 800, minWidth: 150 }}
                  >
                    {t('dialog.product')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ bgcolor: '#fafafa', fontWeight: 800, minWidth: 150 }}
                  >
                    {t('dialog.weight_of_variant')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ bgcolor: '#fafafa', fontWeight: 800, minWidth: 120 }}
                  >
                    {t('dialog.amount')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ bgcolor: '#fafafa', fontWeight: 800 }}
                  ></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {editableItems.map((item, index) => {
                  const isVariant = !!item.variant;
                  const isProduct = !!item.product && !isVariant;

                  const imageUrl =
                    item.product?.image ||
                    item.product?.images?.[0] ||
                    item.frame?.cover ||
                    item.frame?.covers?.[0];
                  const validImage =
                    imageUrl && imageUrl !== '/images/BlurProduct.jpg' ? imageUrl : null;

                  return (
                    <React.Fragment key={item.uid}>
                      <TableRow hover>
                        <TableCell align="center" sx={{ fontWeight: 800 }}>
                          {tPD(index + 1)}
                        </TableCell>
                        <TableCell align="center">
                          <Avatar
                            src={validImage || undefined}
                            variant="rounded"
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: '#f4f4f4',
                              border: '1px solid #eee',
                              mx: 'auto',
                            }}
                          >
                            {!validImage && <Inventory2OutlinedIcon />}
                          </Avatar>
                        </TableCell>

                        {/* Frame Column */}
                        <TableCell align="center">
                          {item.isNew ? (
                            <Autocomplete
                              size="small"
                              options={catalogFrames}
                              getOptionLabel={(opt: any) => opt?.model || ''}
                              onChange={(_, val: any) => handleFrameSelect(item.uid, val)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="standard"
                                  placeholder={t('dialog.frame')}
                                />
                              )}
                            />
                          ) : (
                            <Typography sx={{ fontWeight: 800 }}>{item.frame?.model}</Typography>
                          )}
                        </TableCell>

                        {/* Product Column */}
                        <TableCell align="center">
                          {item.isNew && item.frame ? (
                            <Autocomplete
                              size="small"
                              options={item.availableProducts || []}
                              getOptionLabel={(opt: any) => opt?.model || ''}
                              onChange={(_, val: any) => {
                                handleUpdateItem(item.uid, 'product', val);
                                handleUpdateItem(item.uid, 'variant', null);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="standard"
                                  placeholder={t('dialog.product')}
                                />
                              )}
                            />
                          ) : (
                            <Typography sx={{ fontWeight: isProduct ? 800 : 500 }}>
                              {item.product?.model || '—'}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Variant Column */}
                        <TableCell align="center">
                          {item.isNew && item.product ? (
                            <Autocomplete
                              size="small"
                              options={item.product?.variants || []}
                              getOptionLabel={(opt: any) =>
                                `${opt?.weight || 0} ${t('dialog.grams')}`
                              }
                              onChange={(_, val: any) => handleUpdateItem(item.uid, 'variant', val)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="standard"
                                  placeholder={t('dialog.variant')}
                                />
                              )}
                            />
                          ) : (
                            <Typography sx={{ fontWeight: isVariant ? 800 : 500 }}>
                              {item.variant?.weight
                                ? `${tPD(item.variant.weight)} ${t('dialog.grams')}`
                                : '—'}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Editable Amount Column */}
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                            <TextField
                              type="text"
                              size="small"
                              variant="standard"
                              value={isVariant ? item.quantity : item.weight}
                              onChange={(e) => {
                                let val = convertToEnglishNumber(e.target.value);
                                if (isVariant) val = val.replace(/[^0-9]/g, '');
                                handleUpdateItem(item.uid, isVariant ? 'quantity' : 'weight', val);
                              }}
                              inputProps={{
                                style: { textAlign: 'center', fontWeight: 800, color: '#9C7A2B' },
                              }}
                              sx={{ width: 60 }}
                            />
                            <Typography sx={{ color: '#9C7A2B', fontSize: '0.8rem' }}>
                              {isVariant ? t('dialog.count') : t('dialog.grams')}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Trash Column */}
                        <TableCell align="center">
                          <IconButton color="error" onClick={() => handleTrashClick(item.uid)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      {/* Description Row */}
                      <TableRow>
                        <TableCell colSpan={2} />
                        <TableCell colSpan={5} sx={{ pt: 0, pb: 2 }}>
                          <TextField
                            size="small"
                            fullWidth
                            variant="standard"
                            placeholder={t('dialog.gallery_description')}
                            value={item.description}
                            onChange={(e) =>
                              handleUpdateItem(item.uid, 'description', e.target.value)
                            }
                            sx={{ '& input': { fontSize: '0.85rem' } }}
                          />
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              p: 1,
              bgcolor: '#fcfcfc',
              borderTop: '1px dashed #e0e0e0',
              flexShrink: 0,
            }}
          >
            <Button
              endIcon={<AddCircleOutlineIcon sx={{ mr: '4px' }} />}
              onClick={handleAddNewRow}
              sx={{ color: '#9C7A2B', fontWeight: 600 }}
            >
              {t('dialog.clone_order.add_new_row')}
            </Button>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, flexShrink: 0 }}>
          <Button
            variant="contained"
            onClick={handleAddToBasket}
            disabled={loading || editableItems.length === 0}
            sx={{
              bgcolor: '#9C7A2B',
              '&:hover': { bgcolor: '#7A5C1F' },
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 800,
              boxShadow: 'none',
            }}
          >
            {t('dialog.clone_order.add_to_basket')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CloneOrderDialog;
