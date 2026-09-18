'use client';

import { tPD } from '@/utils';

import useText from '@/hooks/useText';

import useDashboard from '../../../hooks/useDashboard';
import AddIcon from '@mui/icons-material/Add';

import RemoveIcon from '@mui/icons-material/Remove';

import { useNotification } from '@/hooks/useNotification';

import React, { useEffect, useMemo, useState } from 'react';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { addNewOrder, OrderItemsType } from '@/api/zarhub/service';

import CustomTextField from '@/components/shared/custom-text-field';

import type { BasketSourceType } from '@/components/frame/types';
import { useLang } from '@/hooks/LanContext';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

export type BasketItem = {
  id: string;

  wholesaler_id: number;

  order_seller_id?: number;

  bucket_id: number;

  source_type?: BasketSourceType;

  tag_id?: number;

  frame_id?: number;

  product_id?: number;

  variant_id?: number;

  weight?: number | string;

  quantity?: number;

  description: string;

  bucket_name: string;

  frame_model: string;

  product_model?: string;

  variant_weight?: number;

  image_url: string;

  carat?: string;
};

type BasketGroup = {
  key: string;

  source_type: BasketSourceType;

  wholesaler_id: number;

  order_seller_id?: number;

  tag_id?: number;

  bucket_id: number;

  bucket_name: string;

  items: BasketItem[];
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

function getBasketGroupKey(item: BasketItem) {
  if (item.source_type === 'tag') {
    return `tag-bucket:${item.bucket_id}`;
  }

  return `wholesaler:${item.wholesaler_id}`;
}

export default function BasketTab() {
  const { userId } = useDashboard();

  const { lang } = useLang();
  const { t } = useText('basket', lang);

  const { showNotification } = useNotification();

  const [basket, setBasket] = useState<BasketItem[]>([]);

  const [loadingGroups, setLoadingGroups] = useState<Record<string, boolean>>({});

  const [orderTitles, setOrderTitles] = useState<Record<string, string>>({});

  const [confirmDeleteGroupKey, setConfirmDeleteGroupKey] = useState<string | null>(null);

  useEffect(() => {
    const syncBasket = () => {
      try {
        const stored = localStorage.getItem('zarhub_basket');

        setBasket(stored ? JSON.parse(stored) : []);
      } catch {
        setBasket([]);
      }
    };

    syncBasket();

    window.addEventListener('storage', syncBasket);

    window.addEventListener('basket-updated', syncBasket);

    return () => {
      window.removeEventListener('storage', syncBasket);

      window.removeEventListener('basket-updated', syncBasket);
    };
  }, []);

  const updateBasket = (newBasket: BasketItem[]) => {
    setBasket(newBasket);

    if (newBasket.length === 0) {
      localStorage.removeItem('zarhub_basket');
    } else {
      localStorage.setItem(
        'zarhub_basket',

        JSON.stringify(newBasket),
      );
    }

    window.dispatchEvent(new Event('basket-updated'));
  };

  const handleUpdateItem = (
    id: string,

    updates: Partial<BasketItem>,
  ) => {
    const newBasket = basket.map((item) =>
      item.id === id
        ? {
            ...item,
            ...updates,
          }
        : item,
    );

    updateBasket(newBasket);
  };

  const removeItem = (idToRemove: string) => {
    const newBasket = basket.filter((item) => item.id !== idToRemove);

    updateBasket(newBasket);
  };

  const groupedBasket = useMemo(() => {
    const groups: Record<string, BasketGroup> = {};

    basket.forEach((item) => {
      const key = getBasketGroupKey(item);

      if (!groups[key]) {
        const sourceType: BasketSourceType = item.source_type === 'tag' ? 'tag' : 'wholesaler';

        groups[key] = {
          key,

          source_type: sourceType,

          wholesaler_id: item.wholesaler_id,

          order_seller_id: sourceType === 'tag' ? item.order_seller_id : undefined,

          tag_id: sourceType === 'tag' ? item.tag_id : undefined,

          bucket_id: item.bucket_id,

          bucket_name: item.bucket_name,

          items: [],
        };
      }

      groups[key].items.push(item);
    });

    Object.values(groups).forEach((group) => {
      group.items.sort((a, b) => {
        const frameCompare = a.frame_model.localeCompare(b.frame_model);

        if (frameCompare !== 0) {
          return frameCompare;
        }

        const prodA = a.product_model || '';

        const prodB = b.product_model || '';

        return prodA.localeCompare(prodB);
      });
    });

    return groups;
  }, [basket]);

  const handleRemoveGroupComplete = () => {
    if (confirmDeleteGroupKey === null) {
      return;
    }

    const newBasket = basket.filter((item) => getBasketGroupKey(item) !== confirmDeleteGroupKey);

    updateBasket(newBasket);

    setConfirmDeleteGroupKey(null);

    showNotification(
      t('remove_table_success'),

      'success',
    );
  };

  const handleSubmitOrder = async (groupKey: string) => {
    if (!userId) {
      return;
    }

    const group = groupedBasket[groupKey];

    if (!group || group.items.length === 0) {
      return;
    }

    /**
     * Tag:
     * zarhubUserId = tag.sellerId
     *
     * Wholesaler:
     * zarhubUserId = actual wholesaler id
     */
    const zarhubUserId = group.source_type === 'tag' ? group.order_seller_id : group.wholesaler_id;

    if (!zarhubUserId) {
      console.error('Order zarhub user id is missing.', group);

      showNotification(t('error_notif'), 'error');

      return;
    }

    /**
     * Tag:
     * bucketId = tag.bucketId
     *
     * Wholesaler:
     * bucketId = normal bucket id
     */
    const bucketId = group.bucket_id;

    /**
     * NEW
     *
     * Tag order        => 1
     * Wholesaler order => 0
     */
    const fromZarhub: 0 | 1 = group.source_type === 'tag' ? 1 : 0;

    const payload: OrderItemsType = group.items.map((item) => {
      if (item.variant_id) {
        return {
          variant_id: item.variant_id,

          quantity: item.quantity!,

          description: item.description,
        };
      }

      if (item.product_id) {
        return {
          product_id: item.product_id,

          weight: Number(item.weight!),

          description: item.description,
        };
      }

      return {
        frame_id: item.frame_id!,

        weight: Number(item.weight!),

        description: item.description,
      };
    });

    const orderTitle = orderTitles[groupKey]?.trim() || null;

    setLoadingGroups((prev) => ({
      ...prev,
      [groupKey]: true,
    }));

    try {
      await addNewOrder(zarhubUserId, userId, bucketId, payload, orderTitle, fromZarhub);

      showNotification(t('success_notif'), 'success');

      const remainingBasket = basket.filter((item) => getBasketGroupKey(item) !== groupKey);

      updateBasket(remainingBasket);

      setOrderTitles((prev) => {
        const next = {
          ...prev,
        };

        delete next[groupKey];

        return next;
      });
    } catch {
      showNotification(t('error_notif'), 'error');
    } finally {
      setLoadingGroups((prev) => ({
        ...prev,
        [groupKey]: false,
      }));
    }
  };

  if (basket.length === 0) {
    return (
      <Box
        sx={{
          p: 4,

          mt: 4,

          textAlign: 'center',

          bgcolor: '#fafafa',

          borderRadius: 4,

          border: '1px solid #eaeaea',
        }}
      >
        <Typography
          sx={{
            color: 'text.secondary',

            fontWeight: 600,
          }}
        >
          {t('empty_text')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',

        flexDirection: 'column',

        gap: 6,

        pb: 6,
      }}
    >
      <Box
        sx={{
          mt: 4,

          mb: -2,

          px: {
            xs: 2,

            md: 0,
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: {
              xs: '1.8rem',

              md: '2.4rem',
            },

            fontWeight: 900,

            mb: 1,

            color: '#1a1a1a',
          }}
        >
          {t('basket')}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#d32f2f',

            fontWeight: 700,

            opacity: 0.9,
          }}
        >
          {t('warning')}
        </Typography>
      </Box>

      {Object.entries(groupedBasket).map(([groupKey, group]) => {
        const isSubmitting = loadingGroups[groupKey] || false;

        const totalWeight = Number(
          group.items
            .reduce((sum, item) => {
              if (item.variant_id && item.variant_weight && item.quantity) {
                return (
                  sum +
                  ((Number(item.variant_weight) * (Number(item.carat) || 750)) / 750) *
                    item.quantity
                );
              }

              if (item.weight) {
                return sum + (Number(item.weight) * Number(item.carat || 750)) / 750;
              }

              return sum;
            }, 0)
            .toFixed(3),
        );

        return (
          <Box key={groupKey}>
            <Box
              sx={{
                display: 'flex',

                justifyContent: 'space-between',

                alignItems: 'flex-end',

                mb: 1.5,

                px: {
                  xs: 2,

                  md: 0,
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.2rem',

                  fontWeight: 900,

                  color: '#9C7A2B',
                }}
              >
                {t('order_from')} {group.bucket_name}
              </Typography>
            </Box>

            <Box
              sx={{
                mb: 2.5,

                px: {
                  xs: 2,

                  md: 0,
                },

                width: '100%',
              }}
            >
              <CustomTextField
                id={`order-title-${groupKey}`}
                title=""
                placeholder={t('title_placeholder')}
                value={orderTitles[groupKey] || ''}
                setValue={(val) =>
                  setOrderTitles((prev) => ({
                    ...prev,

                    [groupKey]: val,
                  }))
                }
              />
            </Box>

            <Paper
              elevation={0}
              sx={{
                mx: {
                  xs: 2,

                  md: 0,
                },

                overflow: 'hidden',

                borderRadius: 3,

                border: '1px solid #eaeaea',

                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <TableContainer
                sx={{
                  maxHeight: 600,

                  overflowX: 'auto',
                }}
              >
                <Table
                  stickyHeader
                  sx={{
                    minWidth: 850,
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: '#f8f8f8',

                          borderBottom: 'none',

                          width: 50,
                        }}
                      />

                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: '#f8f8f8',

                          borderBottom: 'none',

                          borderLeft: '1px solid #ddd',

                          width: 60,
                        }}
                      />

                      <TableCell
                        align="center"
                        colSpan={4}
                        sx={{
                          bgcolor: '#f8f8f8',

                          borderBottom: '1px solid #ddd',

                          borderLeft: '1px solid #ddd',

                          fontWeight: 800,
                        }}
                      >
                        {t('explanation')}
                      </TableCell>

                      <TableCell
                        align="center"
                        colSpan={2}
                        sx={{
                          bgcolor: '#f8f8f8',

                          borderBottom: '1px solid #ddd',

                          borderLeft: '1px solid #ddd',

                          fontWeight: 800,
                        }}
                      >
                        {t('gallery_numbers')}
                      </TableCell>

                      <TableCell
                        align="center"
                        colSpan={2}
                        sx={{
                          bgcolor: '#f8f8f8',

                          borderBottom: '1px solid #ddd',

                          borderLeft: '1px solid #ddd',

                          fontWeight: 800,

                          color: '#888',
                        }}
                      >
                        {t('wholesaler_numbers')}
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: '#f8f8f8',

                          borderBottom: 'none',

                          borderLeft: '1px solid #ddd',

                          width: 60,
                        }}
                      />
                    </TableRow>

                    <TableRow>
                      {[
                        t('row'),
                        t('image'),
                        t('frame'),
                        t('carat'),
                        t('product'),
                        t('weight_of_variant'),
                        t('amount'),
                        t('unit'),
                        t('amount'),
                        t('unit'),
                        t('remove'),
                      ].map((label, index) => (
                        <TableCell
                          key={index}
                          align="center"
                          sx={{
                            bgcolor: '#fbfbfb',

                            fontWeight: index === 0 || index === 1 || index === 10 ? 800 : 700,

                            fontSize: '0.85rem',

                            borderLeft: [1, 5, 7, 9, 10].includes(index)
                              ? '1px solid #ddd'
                              : undefined,

                            color:
                              index === 10
                                ? '#d32f2f'
                                : index === 8 || index === 9
                                  ? '#aaa'
                                  : undefined,
                          }}
                        >
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {group.items.map((item, index) => {
                      const isVariant = !!item.variant_id;

                      const isProduct = !!item.product_id && !isVariant;

                      const isFrame = !!item.frame_id && !isProduct && !isVariant;

                      return (
                        <React.Fragment key={item.id}>
                          <TableRow hover>
                            <TableCell
                              align="center"
                              sx={{
                                fontWeight: 800,

                                borderBottom: 'none',
                              }}
                            >
                              {tPD(index + 1)}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                borderLeft: '1px solid #eee',

                                borderBottom: 'none',
                              }}
                            >
                              <Avatar
                                src={item.image_url}
                                variant="rounded"
                                sx={{
                                  width: 44,

                                  height: 44,

                                  border: '1px solid #eee',
                                }}
                              />
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                borderBottom: 'none',

                                borderLeft: '1px solid #eee',

                                fontWeight: isFrame ? 800 : 500,
                              }}
                            >
                              {item.frame_model}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                borderBottom: 'none',
                              }}
                            >
                              {item.carat ? tPD(item.carat) : '—'}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                borderBottom: 'none',

                                fontWeight: isProduct ? 800 : 500,
                              }}
                            >
                              {item.product_model || '—'}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                borderLeft: '1px solid #eee',

                                borderBottom: 'none',

                                fontWeight: isVariant ? 800 : 500,
                              }}
                            >
                              {item.variant_weight
                                ? `${tPD(item.variant_weight)} ${t('grams')}`
                                : '—'}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                borderBottom: 'none',

                                fontWeight: 800,

                                color: '#9C7A2B',
                              }}
                            >
                              {isVariant ? (
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  gap={1}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleUpdateItem(
                                        item.id,

                                        {
                                          quantity: (item.quantity || 0) + 1,
                                        },
                                      )
                                    }
                                  >
                                    <AddIcon fontSize="small" />
                                  </IconButton>

                                  <TextField
                                    type="text"
                                    size="small"
                                    variant="standard"
                                    value={item.quantity !== undefined ? item.quantity : ''}
                                    onChange={(e) => {
                                      let val = convertToEnglishNumber(e.target.value);

                                      val = val.replace(/[^0-9]/g, '');

                                      handleUpdateItem(
                                        item.id,

                                        {
                                          quantity: val === '' ? 0 : parseInt(val, 10),
                                        },
                                      );
                                    }}
                                    InputProps={{
                                      disableUnderline: true,

                                      inputMode: 'numeric',
                                    }}
                                    sx={{
                                      width: 32,

                                      '& input': {
                                        textAlign: 'center',

                                        fontWeight: 900,

                                        p: 0,

                                        color: '#9C7A2B',
                                      },
                                    }}
                                  />

                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleUpdateItem(
                                        item.id,

                                        {
                                          quantity: Math.max(
                                            0,

                                            (item.quantity || 0) - 1,
                                          ),
                                        },
                                      )
                                    }
                                    disabled={(item.quantity || 0) === 0}
                                  >
                                    <RemoveIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              ) : (
                                <TextField
                                  type="text"
                                  size="small"
                                  variant="standard"
                                  value={item.weight !== undefined ? item.weight : ''}
                                  onChange={(e) => {
                                    const val = convertToEnglishNumber(e.target.value);

                                    handleUpdateItem(
                                      item.id,

                                      {
                                        weight: val,
                                      },
                                    );
                                  }}
                                  inputProps={{
                                    inputMode: 'decimal',

                                    style: {
                                      textAlign: 'center',

                                      fontWeight: 800,

                                      color: '#9C7A2B',
                                    },
                                  }}
                                  sx={{
                                    width: 60,
                                  }}
                                />
                              )}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                borderLeft: '1px solid #eee',

                                borderBottom: 'none',

                                color: 'text.secondary',
                              }}
                            >
                              {isVariant ? t('count') : t('grams')}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                borderBottom: 'none',
                              }}
                            />

                            <TableCell
                              align="center"
                              sx={{
                                borderLeft: '1px solid #eee',

                                borderBottom: 'none',
                              }}
                            />

                            <TableCell
                              align="center"
                              sx={{
                                borderLeft: '1px solid #eee',

                                borderBottom: 'none',
                              }}
                            >
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeItem(item.id)}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell
                              colSpan={2}
                              sx={{
                                borderBottom: '2px solid #eaeaea',
                              }}
                            />

                            <TableCell
                              colSpan={9}
                              sx={{
                                borderBottom: '2px solid #eaeaea',

                                pt: 0,

                                pb: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',

                                  gap: 1,

                                  alignItems: 'center',
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: '0.85rem',

                                    color: 'text.secondary',

                                    fontWeight: 600,

                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {t('description')}
                                </Typography>

                                <TextField
                                  fullWidth
                                  variant="standard"
                                  size="small"
                                  placeholder={t('no_des')}
                                  value={item.description || ''}
                                  onChange={(e) =>
                                    handleUpdateItem(
                                      item.id,

                                      {
                                        description: e.target.value,
                                      },
                                    )
                                  }
                                  InputProps={{
                                    disableUnderline: true,
                                  }}
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}

                    <TableRow
                      sx={{
                        bgcolor: '#fafafa',
                      }}
                    >
                      <TableCell
                        colSpan={5}
                        sx={{
                          borderBottom: 'none',
                        }}
                      />

                      <TableCell
                        align="center"
                        sx={{
                          borderLeft: '1px solid #eee',

                          borderBottom: 'none',

                          fontWeight: 800,

                          color: 'text.secondary',
                        }}
                      >
                        {t('total_initial_amount')}
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          borderBottom: 'none',

                          fontWeight: 900,

                          color: '#1a1a1a',

                          fontSize: '1.1rem',
                        }}
                      >
                        {tPD(totalWeight)}
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          borderLeft: '1px solid #eee',

                          borderBottom: 'none',

                          color: 'text.secondary',
                        }}
                      >
                        {t('grams')}
                      </TableCell>

                      <TableCell
                        colSpan={3}
                        sx={{
                          borderBottom: 'none',
                        }}
                      />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                sx={{
                  p: 2,

                  bgcolor: 'white',

                  borderTop: '1px solid #eaeaea',

                  display: 'flex',

                  justifyContent: 'flex-end',

                  gap: 2,
                }}
              >
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setConfirmDeleteGroupKey(groupKey)}
                  disabled={isSubmitting}
                  sx={{
                    px: {
                      xs: 2,

                      md: 4,
                    },

                    height: '42px',

                    borderRadius: 2,

                    fontWeight: 800,

                    borderWidth: '2px',
                  }}
                >
                  {t('clear_order_table')}
                </Button>

                <Button
                  variant="contained"
                  onClick={() => handleSubmitOrder(groupKey)}
                  disabled={isSubmitting}
                  sx={{
                    boxShadow: 0,

                    bgcolor: '#9C7A2B',

                    '&:hover': {
                      bgcolor: '#7A5C1F',

                      boxShadow: 0,
                    },

                    px: {
                      xs: 2,

                      md: 4,
                    },

                    height: '42px',

                    borderRadius: 2,

                    fontWeight: 800,
                  }}
                >
                  {isSubmitting ? t('submitting') : t('confirm_and_submit')}
                </Button>
              </Box>
            </Paper>
          </Box>
        );
      })}

      <Dialog
        open={confirmDeleteGroupKey !== null}
        onClose={() => setConfirmDeleteGroupKey(null)}
        PaperProps={{
          sx: {
            borderRadius: 3,

            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,

            color: 'error.main',
          }}
        >
          {t('confirm_delete_title')}
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              fontWeight: 500,
            }}
          >
            {t('confirm_delete_desc')}
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,

            pb: 2,
          }}
        >
          <Button
            onClick={() => setConfirmDeleteGroupKey(null)}
            color="inherit"
            sx={{
              fontWeight: 700,
            }}
          >
            {t('cancel')}
          </Button>

          <Button
            onClick={handleRemoveGroupComplete}
            variant="contained"
            color="error"
            sx={{
              fontWeight: 800,

              px: 3,

              borderRadius: 2,

              boxShadow: 0,
            }}
          >
            {t('confirm_delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
