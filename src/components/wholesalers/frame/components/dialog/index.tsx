'use client';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import Image from 'next/image';

import { fWC, tPD } from '@/utils';

import useText from '@/hooks/useText';

import { ProductTable } from '../table';

import { useCallback, useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';

import { Swiper, SwiperSlide } from 'swiper/react';

import { Pagination, Navigation } from 'swiper/modules';

import DialogSX from '@/components/shared/dialog/styles';

import CustomTextField from '@/components/shared/custom-text-field';

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

import type { BasketSourceType } from '../../types';

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useMediaQuery,
  Slide,
  useTheme,
  Divider,
  Collapse,
  TextField,
} from '@mui/material';

interface ProductDialogProps {
  open: boolean;

  onClose: () => void;

  showingProduct: ProductTable | undefined;

  hasFrameOrderLocked: boolean;

  onAddToCart: (payload: any[]) => void;

  /**
   * REAL frame owner / fetch ID.
   */
  wholesalerId: number;

  /**
   * addNewOrder() user ID.
   *
   * Tag => tag.sellerId
   * Normal => wholesalerId
   */
  orderSellerId: number | null;

  bucketId: number;

  bucketName: string;

  frameModel: string;

  frameImageUrl: string;

  frameCarat: string;

  sourceType: BasketSourceType;

  tagId?: number | null;
}

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

export default function ProductDialog({
  open,
  onClose,
  showingProduct,
  hasFrameOrderLocked,
  onAddToCart,

  wholesalerId,
  orderSellerId,

  bucketId,
  bucketName,
  frameModel,
  frameImageUrl,
  frameCarat,

  sourceType,
  tagId = null,
}: ProductDialogProps) {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { t } = useText('frame');

  const [productWeight, setProductWeight] = useState('');

  const [productDesc, setProductDesc] = useState('');

  const [variantOrders, setVariantOrders] = useState<
    Record<
      number,
      {
        qty: number;
        desc: string;
      }
    >
  >({});

  const belongsToCurrentSource = useCallback(
    (item: any) => {
      if (sourceType === 'tag') {
        return item.source_type === 'tag' && Number(item.tag_id) === Number(tagId);
      }

      return item.source_type !== 'tag' && Number(item.bucket_id) === Number(bucketId);
    },
    [sourceType, tagId, bucketId],
  );

  useEffect(() => {
    if (open && showingProduct) {
      try {
        const stored = localStorage.getItem('zarhub_basket');

        const basket = stored ? JSON.parse(stored) : [];

        const existingItems = basket.filter(
          (item: any) =>
            item.product_id === showingProduct.id &&
            item.frame_model === frameModel &&
            belongsToCurrentSource(item),
        );

        let pWeight = '';

        let pDesc = '';

        const vOrders: Record<
          number,
          {
            qty: number;
            desc: string;
          }
        > = {};

        existingItems.forEach((item: any) => {
          if (item.variant_id) {
            vOrders[item.variant_id] = {
              qty: item.quantity || 0,

              desc: item.description || '',
            };
          } else if (item.weight) {
            pWeight = String(item.weight);

            pDesc = item.description || '';
          }
        });

        setProductWeight(pWeight);

        setProductDesc(pDesc);

        setVariantOrders(vOrders);
      } catch (e) {
        console.error('Failed to load dialog state from basket', e);
      }
    } else {
      setProductWeight('');

      setProductDesc('');

      setVariantOrders({});
    }
  }, [open, showingProduct, frameModel, belongsToCurrentSource]);

  if (!showingProduct) {
    return null;
  }

  const images =
    showingProduct.images?.length > 0
      ? showingProduct.images
      : showingProduct.image
        ? [showingProduct.image]
        : ['/images/BlurProduct.jpg'];

  const bestImageUrl = showingProduct.image || showingProduct.images?.[0] || frameImageUrl;

  const isProductWeightValid = productWeight !== '' && Number(productWeight) > 0;

  const totalVariantItems = Object.values(variantOrders).reduce((acc, curr) => acc + curr.qty, 0);

  const hasCustomInput = productWeight.trim() !== '' || productDesc.trim() !== '';

  const hasVariantSelected = totalVariantItems > 0;

  let calculatedWeight = 0;

  if (isProductWeightValid && !hasVariantSelected) {
    calculatedWeight = Number(productWeight) || 0;
  } else if (hasVariantSelected && !hasCustomInput) {
    Object.entries(variantOrders).forEach(([vId, data]) => {
      const variant = showingProduct.variants.find((v) => v.id === Number(vId));

      if (variant) {
        calculatedWeight += Number(variant.weight) * Number(data.qty);
      }
    });
  }

  calculatedWeight = Number(calculatedWeight.toFixed(3));

  const handleQtyChange = (
    variantId: number | undefined,

    delta: number,
  ) => {
    if (!variantId) return;

    setVariantOrders((prev) => {
      const currentQty = prev[variantId]?.qty || 0;

      const newQty = Math.max(0, currentQty + delta);

      if (newQty === 0) {
        const copy = {
          ...prev,
        };

        delete copy[variantId];

        return copy;
      }

      return {
        ...prev,

        [variantId]: {
          ...prev[variantId],

          qty: newQty,

          desc: prev[variantId]?.desc || '',
        },
      };
    });
  };

  const handleExactQtyChange = (
    variantId: number | undefined,

    qty: number,
  ) => {
    if (!variantId) return;

    setVariantOrders((prev) => {
      const newQty = Math.max(0, qty);

      if (newQty === 0) {
        const copy = {
          ...prev,
        };

        delete copy[variantId];

        return copy;
      }

      return {
        ...prev,

        [variantId]: {
          ...prev[variantId],

          qty: newQty,

          desc: prev[variantId]?.desc || '',
        },
      };
    });
  };

  const handleVariantDescChange = (
    variantId: number | undefined,

    desc: string,
  ) => {
    if (!variantId) return;

    setVariantOrders((prev) => ({
      ...prev,

      [variantId]: {
        ...prev[variantId],

        desc,

        qty: prev[variantId]?.qty || 0,
      },
    }));
  };

  const handleAddOrdersToCart = () => {
    try {
      const stored = localStorage.getItem('zarhub_basket');

      if (stored) {
        const basket = JSON.parse(stored);

        const cleanedBasket = basket.filter(
          (item: any) =>
            !(
              item.product_id === showingProduct.id &&
              item.frame_model === frameModel &&
              belongsToCurrentSource(item)
            ),
        );

        localStorage.setItem(
          'zarhub_basket',

          JSON.stringify(cleanedBasket),
        );
      }
    } catch (e) {
      console.error('Failed to clean old basket items', e);
    }

    const payload: any[] = [];

    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

    const commonData = {
      /**
       * Real frame owner.
       */
      wholesaler_id: wholesalerId,

      /**
       * Tag order override.
       */
      order_seller_id: sourceType === 'tag' ? orderSellerId : undefined,

      bucket_id: bucketId,

      bucket_name: bucketName,

      source_type: sourceType,

      tag_id: sourceType === 'tag' ? tagId : undefined,

      frame_model: frameModel,

      image_url: bestImageUrl,

      carat: frameCarat,
    };

    if (isProductWeightValid && !hasVariantSelected) {
      payload.push({
        id: generateId(),

        ...commonData,

        product_id: showingProduct.id,

        product_model: showingProduct.model,

        weight: Number(productWeight),

        description: productDesc,
      });
    }

    if (hasVariantSelected && !hasCustomInput) {
      Object.entries(variantOrders).forEach(([vId, data]) => {
        if (data.qty > 0) {
          const variant = showingProduct.variants.find((v) => v.id === Number(vId));

          payload.push({
            id: generateId(),

            ...commonData,

            product_id: showingProduct.id,

            product_model: showingProduct.model,

            variant_id: Number(vId),

            variant_weight: variant?.weight,

            quantity: data.qty,

            description: data.desc,
          });
        }
      });
    }

    onAddToCart(payload);

    onClose();
  };

  const totalCartItems = hasVariantSelected ? totalVariantItems : isProductWeightValid ? 1 : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      scroll="paper"
      slots={
        isMobile
          ? {
              transition: Slide,
            }
          : undefined
      }
      slotProps={
        isMobile
          ? {
              transition: {
                direction: 'up' as const,
              },
            }
          : undefined
      }
      sx={{
        ...DialogSX.dialog,

        ...(isMobile && DialogSX.bottom_sheet_dialog),
      }}
    >
      <Box sx={DialogSX.header_container}>
        <DialogTitle sx={DialogSX.header_title}>سفارش محصول</DialogTitle>

        <IconButton onClick={onClose} aria-label={t('dialog.close')}>
          <CloseIcon
            sx={{
              fontSize: 20,
            }}
          />
        </IconButton>
      </Box>

      <DialogContent
        sx={{
          p: {
            xs: 2,
            md: 4,
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',

              md: '320px 1fr',
            },

            gap: {
              xs: 4,
              md: 4,
            },

            alignItems: 'flex-start',
          }}
        >
          <Box
            sx={{
              position: {
                md: 'sticky',
              },

              top: {
                md: 0,
              },

              width: '100%',

              aspectRatio: '1 / 1',

              borderRadius: 4,

              overflow: 'hidden',

              bgcolor: '#f8f8f8',

              border: '1px solid #eaeaea',

              boxShadow: '0 4px 24px rgba(0,0,0,0.04)',

              '& .swiper': {
                width: '100%',

                height: '100%',
              },

              '& .swiper-pagination-bullet': {
                backgroundColor: '#ccc',

                opacity: 0.8,

                width: '6px',

                height: '6px',

                transition: 'all 0.3s ease',
              },

              '& .swiper-pagination-bullet-active': {
                backgroundColor: '#9C7A2B',

                opacity: 1,

                width: '20px',

                borderRadius: '4px',
              },
            }}
          >
            <Swiper
              modules={[Pagination, Navigation]}
              pagination={{
                clickable: true,
              }}
              navigation={{
                nextEl: '.swiper-modal-next',

                prevEl: '.swiper-modal-prev',
              }}
              loop={images.length > 1}
            >
              {images.map(
                (
                  src: string,

                  idx: number,
                ) => (
                  <SwiperSlide
                    key={idx}
                    style={{
                      position: 'relative',

                      width: '100%',

                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',

                        inset: 16,

                        borderRadius: 3,

                        overflow: 'hidden',

                        bgcolor: 'white',

                        border: '1px solid rgba(0,0,0,0.04)',
                      }}
                    >
                      <Image
                        src={src}
                        alt={`Product Image ${idx + 1}`}
                        fill
                        sizes="(max-width: 900px) 100vw, 320px"
                        style={{
                          objectFit: 'contain',
                        }}
                      />
                    </Box>
                  </SwiperSlide>
                ),
              )}
            </Swiper>

            {images.length > 1 ? (
              <>
                <Box
                  className="swiper-modal-prev"
                  sx={{
                    position: 'absolute',

                    top: '50%',

                    right: 12,

                    transform: 'translateY(-50%)',

                    zIndex: 10,

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center',

                    width: 32,

                    height: 32,

                    borderRadius: '50%',

                    bgcolor: 'rgba(255, 255, 255, 0.9)',

                    backdropFilter: 'blur(8px)',

                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',

                    cursor: 'pointer',

                    color: '#444',
                  }}
                >
                  <ChevronRightRoundedIcon fontSize="small" />
                </Box>

                <Box
                  className="swiper-modal-next"
                  sx={{
                    position: 'absolute',

                    top: '50%',

                    left: 12,

                    transform: 'translateY(-50%)',

                    zIndex: 10,

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center',

                    width: 32,

                    height: 32,

                    borderRadius: '50%',

                    bgcolor: 'rgba(255, 255, 255, 0.9)',

                    backdropFilter: 'blur(8px)',

                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',

                    cursor: 'pointer',

                    color: '#444',
                  }}
                >
                  <ChevronLeftRoundedIcon fontSize="small" />
                </Box>
              </>
            ) : null}
          </Box>

          <Box
            sx={{
              display: 'flex',

              flexDirection: 'column',

              gap: 4,
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: '1.3rem',

                  md: '1.5rem',
                },

                fontWeight: 900,

                color: '#1a1a1a',
              }}
            >
              {showingProduct.model}
            </Typography>

            {hasFrameOrderLocked && (
              <Box
                sx={{
                  p: 2,

                  bgcolor: 'rgba(211, 47, 47, 0.05)',

                  border: '1px solid rgba(211, 47, 47, 0.2)',

                  borderRadius: 3,
                }}
              >
                <Typography
                  sx={{
                    color: '#d32f2f',

                    fontWeight: 600,

                    fontSize: '0.9rem',
                  }}
                >
                  شما سفارش قاب پایه را در سبد دارید. امکان سفارش محصول/موجودی برای این قاب وجود
                  ندارد. برای تغییر، سبد خود را خالی کنید.
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                opacity: hasFrameOrderLocked ? 0.4 : 1,

                pointerEvents: hasFrameOrderLocked ? 'none' : 'auto',

                display: 'flex',

                flexDirection: 'column',

                gap: 4,
              }}
            >
              <Box
                sx={{
                  opacity: hasVariantSelected ? 0.4 : 1,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,

                    mb: 0.5,

                    color: '#9C7A2B',

                    fontSize: '1.1rem',
                  }}
                >
                  سفارش کالا
                </Typography>

                {hasVariantSelected && (
                  <Typography
                    sx={{
                      fontSize: '0.8rem',

                      color: '#d32f2f',

                      mb: 1.5,

                      fontWeight: 600,
                    }}
                  >
                    شما در حال انتخاب از موجودی هستید. برای ثبت سفارش پایه کالا، تعداد موجودی را صفر
                    کنید.
                  </Typography>
                )}

                <Box
                  sx={{
                    display: 'flex',

                    flexDirection: 'column',

                    gap: 2.5,

                    mt: hasVariantSelected ? 0 : 2,
                  }}
                >
                  <Box
                    sx={{
                      width: {
                        xs: '100%',

                        sm: '200px',
                      },
                    }}
                  >
                    <CustomTextField
                      id="product-weight"
                      title="وزن درخواستی (گرم)"
                      value={productWeight}
                      setValue={setProductWeight}
                      numeric="decimal"
                      disabled={hasVariantSelected}
                    />
                  </Box>

                  <Box
                    sx={{
                      width: '100%',
                    }}
                  >
                    <CustomTextField
                      id="product-desc"
                      title="توضیحات (اختیاری)"
                      rows={2}
                      value={productDesc}
                      setValue={setProductDesc}
                      disabled={hasVariantSelected}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider
                sx={{
                  borderStyle: 'dashed',

                  opacity: 0.6,
                }}
              />

              <Box
                sx={{
                  opacity: hasCustomInput ? 0.4 : 1,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,

                    mb: 0.5,

                    color: '#9C7A2B',

                    fontSize: '1.1rem',
                  }}
                >
                  انتخاب از تنوع
                </Typography>

                {hasCustomInput && (
                  <Typography
                    sx={{
                      fontSize: '0.8rem',

                      color: '#d32f2f',

                      mb: 1,

                      fontWeight: 600,
                    }}
                  >
                    شما در حال ثبت سفارش کلی هستید. برای انتخاب از تنوع مقادیر بالا را پاک کنید.
                  </Typography>
                )}

                {!showingProduct.variants || showingProduct.variants.length === 0 ? (
                  <Typography
                    sx={{
                      color: 'text.secondary',

                      fontSize: '0.9rem',

                      mt: 1,
                    }}
                  >
                    مشخصات تنوع کالا ثبت نشده است.
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',

                      flexDirection: 'column',

                      gap: 2,

                      mt: hasCustomInput ? 1 : 2,
                    }}
                  >
                    {showingProduct.variants.map((v) => {
                      if (v.id === undefined) {
                        return null;
                      }

                      const qty = variantOrders[v.id]?.qty || 0;

                      const isSelected = qty > 0;

                      return (
                        <Box
                          key={v.id}
                          sx={{
                            p: 2,

                            border: '2px solid',

                            borderColor: isSelected ? 'rgba(156, 122, 43, 0.4)' : '#eee',

                            borderRadius: 3,

                            bgcolor: isSelected ? 'rgba(156, 122, 43, 0.03)' : 'transparent',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',

                              justifyContent: 'space-between',

                              alignItems: 'center',

                              flexWrap: 'wrap',

                              gap: 2,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',

                                gap: {
                                  xs: 1.5,

                                  sm: 3,
                                },

                                flexWrap: 'wrap',

                                alignItems: 'center',

                                flex: 1,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 800,

                                  color: '#222',
                                }}
                              >
                                وزن: {tPD(v.weight)} گرم
                              </Typography>

                              <Box
                                sx={{
                                  display: 'flex',

                                  flexDirection: 'column',

                                  gap: 0.5,

                                  borderRight: {
                                    sm: '1px solid #eaeaea',
                                  },

                                  pr: {
                                    sm: 3,
                                  },
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: '0.75rem',

                                    color: 'text.secondary',

                                    fontWeight: 600,
                                  }}
                                >
                                  اجرت اضافات:{' '}
                                  <Box
                                    component="span"
                                    sx={{
                                      color: Number(v.extraWage) > 0 ? '#9C7A2B' : 'inherit',

                                      fontWeight: 800,
                                    }}
                                  >
                                    {tPD(fWC(v.extraWage))}
                                  </Box>
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: '0.75rem',

                                    color: 'text.secondary',

                                    fontWeight: 600,
                                  }}
                                >
                                  قیمت اضافات:{' '}
                                  <Box
                                    component="span"
                                    sx={{
                                      color: Number(v.extraPrice) > 0 ? '#9C7A2B' : 'inherit',

                                      fontWeight: 800,
                                    }}
                                  >
                                    {tPD(fWC(v.extraPrice))}
                                  </Box>
                                </Typography>
                              </Box>
                            </Box>

                            <Box
                              sx={{
                                display: 'flex',

                                alignItems: 'center',

                                gap: 1.5,

                                border: '1px solid',

                                borderColor: isSelected ? '#9C7A2B' : '#ddd',

                                borderRadius: 99,

                                p: 0.5,

                                bgcolor: 'white',
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleQtyChange(v.id, 1)}
                                disabled={hasCustomInput}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>

                              <TextField
                                type="text"
                                size="small"
                                variant="standard"
                                value={qty > 0 ? qty : ''}
                                placeholder="۰"
                                disabled={hasCustomInput}
                                onChange={(e) => {
                                  let val = convertToEnglishNumber(e.target.value);

                                  val = val.replace(/[^0-9]/g, '');

                                  handleExactQtyChange(
                                    v.id,

                                    val === '' ? 0 : parseInt(val, 10),
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

                                    color: isSelected && !hasCustomInput ? '#9C7A2B' : '#1a1a1a',
                                  },
                                }}
                              />

                              <IconButton
                                size="small"
                                onClick={() => handleQtyChange(v.id, -1)}
                                disabled={qty === 0 || hasCustomInput}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>

                          <Collapse in={isSelected && !hasCustomInput}>
                            <Box
                              sx={{
                                mt: 2,

                                pt: 2,

                                borderTop: '1px dashed rgba(0,0,0,0.1)',
                              }}
                            >
                              <CustomTextField
                                id={`variant-desc-${v.id}`}
                                title="توضیحات این آیتم (اختیاری)"
                                rows={2}
                                value={variantOrders[v.id]?.desc || ''}
                                setValue={(val) =>
                                  handleVariantDescChange(
                                    v.id,

                                    val,
                                  )
                                }
                              />
                            </Box>
                          </Collapse>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <Box
        sx={{
          p: {
            xs: 2,

            md: 3,
          },

          borderTop: '1px solid #eee',

          display: 'flex',

          justifyContent: 'space-between',

          alignItems: 'center',

          bgcolor: 'background.paper',

          borderBottomLeftRadius: 16,

          borderBottomRightRadius: 16,
        }}
      >
        <Box>
          <Typography
            sx={{
              color: 'text.secondary',

              fontSize: '0.85rem',

              fontWeight: 600,
            }}
          >
            مجموع انتخابی
          </Typography>

          <Box
            sx={{
              display: 'flex',

              alignItems: 'center',

              gap: 1.5,
            }}
          >
            <Typography
              sx={{
                fontWeight: 900,

                fontSize: '1.2rem',

                color: '#9C7A2B',
              }}
            >
              {tPD(totalCartItems)} مورد
            </Typography>

            {calculatedWeight > 0 ? (
              <>
                <Typography
                  sx={{
                    color: '#ccc',
                  }}
                >
                  |
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 900,

                    fontSize: '1.2rem',

                    color: '#9C7A2B',
                  }}
                >
                  {tPD(calculatedWeight)} گرم
                </Typography>
              </>
            ) : null}
          </Box>
        </Box>

        <Button
          variant="contained"
          disabled={totalCartItems === 0}
          onClick={handleAddOrdersToCart}
          sx={{
            bgcolor: '#9C7A2B',

            '&:hover': {
              bgcolor: '#7A5C1F',
            },

            px: {
              xs: 3,

              md: 5,
            },

            borderRadius: 2.5,

            fontWeight: 800,

            fontSize: '1rem',
          }}
        >
          افزودن به سبد
        </Button>
      </Box>
    </Dialog>
  );
}
