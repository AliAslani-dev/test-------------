'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  CategoryRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  CloseRounded,
  Inventory2Outlined,
  LocalOfferOutlined,
  PercentRounded,
  ScaleRounded,
  VerticalAlignBottomRounded,
  VerticalAlignTopRounded,
} from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { getProductsByFrame } from '@/api/product/service';
import type { ProductByBucketDTO, ProductVariant } from '@/api/product/dto';
import type { FramesByBucketDTO } from '@/api/frame/dto';
import type { AllFrameDTO } from '@/api/admin/seller/dto';
import { useLang } from '@/hooks/LanContext';
import useText from '@/hooks/useText';

const GOLD = '#B58A32';
const GOLD_DARK = '#8B6A25';
const GOLD_LIGHT = '#FBF7EC';
const GOLD_BORDER = '#E8D7A7';
const PRODUCTS_PER_PAGE = 12;

type FrameLike = FramesByBucketDTO | AllFrameDTO;

type Props = {
  open: boolean;
  frame: FrameLike | null;
  onClose: () => void;
  bucketName?: string;
  categoryName?: string;
  genderName?: string;
  caratName?: string;
};

type ProductsMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};

function interpolate(text: string, values: Record<string, string | number> = {}) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    text,
  );
}

function formatNumber(value: string | number | null | undefined) {
  if (value === '' || value == null) return '—';
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return numeric.toLocaleString('fa-IR', { maximumFractionDigits: 3 });
  }
  return String(value);
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim()))));
}

function frameCovers(frame: FrameLike | null) {
  if (!frame) return [];
  return uniqueStrings([...(frame.covers ?? []), frame.cover]);
}

function DataRow({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        py: 1.35,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
        <Box sx={{ color: GOLD, display: 'flex' }}>{icon}</Box>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{label}</Typography>
      </Stack>
      <Typography
        component="div"
        sx={{
          fontWeight: 900,
          fontSize: '0.92rem',
          textAlign: 'left',
          color: highlight ? '#B84A4A' : '#1a1a1a',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function FrameImageSlider({ frame }: { frame: FrameLike }) {
  const sliderId = useId().replace(/:/g, '');
  const { lang } = useLang();
  const { t } = useText('tags', lang);
  const images = frameCovers(frame);
  const safeImages = images.length ? images : ['/images/BlurFrame.jpg'];
  const prevClass = `frame-detail-prev-${sliderId}`;
  const nextClass = `frame-detail-next-${sliderId}`;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        aspectRatio: { xs: '4 / 3', sm: '16 / 10', md: '1 / 1' },
        maxHeight: { xs: 280, sm: 360, md: 'none' },
        borderRadius: { xs: 3, md: 4 },
        overflow: 'hidden',
        bgcolor: '#f8f8f8',
        border: '1px solid #eaeaea',
        '& .swiper': {
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          height: '100%',
          overflow: 'hidden',
        },
        '& .swiper-wrapper': { minWidth: 0 },
        '& .swiper-slide': { minWidth: 0, overflow: 'hidden' },
        '& img': { userSelect: 'none', WebkitUserDrag: 'none', pointerEvents: 'none' },
        '& .swiper-pagination-bullet': {
          bgcolor: '#ccc',
          opacity: 0.8,
          width: 6,
          height: 6,
          transition: 'all .3s ease',
        },
        '& .swiper-pagination-bullet-active': {
          bgcolor: GOLD,
          opacity: 1,
          width: 20,
          borderRadius: 4,
        },
      }}
    >
      <Swiper
        modules={[Pagination, Navigation]}
        pagination={safeImages.length > 1 ? { clickable: true } : false}
        navigation={
          safeImages.length > 1 ? { nextEl: `.${nextClass}`, prevEl: `.${prevClass}` } : false
        }
        loop={safeImages.length > 1}
        simulateTouch
        allowTouchMove
        grabCursor={safeImages.length > 1}
        threshold={5}
        touchStartPreventDefault
        nested
        watchOverflow
        dir="rtl"
      >
        {safeImages.map((src, index) => (
          <SwiperSlide key={`${src}-${index}`}>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                p: { xs: 1.5, md: 2 },
                boxSizing: 'border-box',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  borderRadius: { xs: 2.5, md: 3 },
                  bgcolor: '#fff',
                }}
              >
                <Image
                  src={src}
                  alt={interpolate(t('frame_image_alt'), { index: index + 1 })}
                  fill
                  draggable={false}
                  sizes="(max-width: 900px) 100vw, 380px"
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>

      {safeImages.length > 1 && (
        <>
          <Box
            className={prevClass}
            role="button"
            aria-label={t('previous_slide')}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 10,
              transform: 'translateY(-50%)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,.9)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,.10)',
              border: '1px solid rgba(0,0,0,.05)',
              cursor: 'pointer',
              color: '#444',
            }}
          >
            <ChevronRightRounded fontSize="small" />
          </Box>
          <Box
            className={nextClass}
            role="button"
            aria-label={t('next_slide')}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 10,
              transform: 'translateY(-50%)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,.9)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,.10)',
              border: '1px solid rgba(0,0,0,.05)',
              cursor: 'pointer',
              color: '#444',
            }}
          >
            <ChevronLeftRounded fontSize="small" />
          </Box>
        </>
      )}
    </Box>
  );
}

function VariantRow({ variant }: { variant: ProductVariant }) {
  const { lang } = useLang();
  const { t } = useText('tags', lang);

  return (
    <Box
      sx={{
        p: { xs: 1.1, sm: 1.25, md: 1.5 },
        borderRadius: 2.5,
        border: '1px solid #eee',
        bgcolor: '#fff',
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, 1fr)' },
        gap: { xs: 0.75, md: 1.25 },
      }}
    >
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          {t('variant_weight')}
        </Typography>
        <Typography fontWeight={900}>
          {interpolate(t('weight_value'), { value: formatNumber(variant.weight) })}
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          {t('variant_stock')}
        </Typography>
        <Typography fontWeight={900}>{formatNumber(variant.stock)}</Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          {t('extra_wage')}
        </Typography>
        <Typography fontWeight={900}>{formatNumber(variant.extraWage)}</Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          {t('extra_price')}
        </Typography>
        <Typography fontWeight={900}>{formatNumber(variant.extraPrice)}</Typography>
      </Box>
    </Box>
  );
}

function ProductCard({ product }: { product: ProductByBucketDTO }) {
  const sliderId = useId().replace(/:/g, '');
  const { lang } = useLang();
  const { t } = useText('tags', lang);
  const images = uniqueStrings([...(product.images ?? []), product.image]);
  const safeImages = images.length ? images : ['/images/BlurProduct.jpg'];
  const prevClass = `product-card-prev-${sliderId}`;
  const nextClass = `product-card-next-${sliderId}`;
  const totalStock = (product.variants ?? []).reduce(
    (sum, variant) => sum + Number(variant.stock || 0),
    0,
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: { xs: 3, md: 4 },
        border: '1px solid #e7e7e7',
        overflow: 'hidden',
        bgcolor: '#fff',
        boxShadow: '0 8px 28px rgba(0,0,0,.035)',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '220px minmax(0,1fr)', md: '300px minmax(0,1fr)' },
          gap: 0,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            height: { xs: 200, sm: '100%', md: 'auto' },
            minHeight: { xs: 200, sm: 260, md: 300 },
            aspectRatio: { xs: 'auto', md: 'auto' },
            overflow: 'hidden',
            bgcolor: '#f8f8f8',
            borderLeft: { sm: '1px solid #eee' },
            '& .swiper': {
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              height: '100%',
              overflow: 'hidden',
            },
            '& .swiper-wrapper': { minWidth: 0 },
            '& .swiper-slide': {
              position: 'relative',
              minWidth: 0,
              height: '100%',
              overflow: 'hidden',
            },
            '& img': { userSelect: 'none', WebkitUserDrag: 'none', pointerEvents: 'none' },
            '& .swiper-pagination-bullet-active': {
              bgcolor: GOLD,
              width: 18,
              borderRadius: 4,
            },
          }}
        >
          <Swiper
            modules={[Pagination, Navigation]}
            pagination={safeImages.length > 1 ? { clickable: true } : false}
            navigation={
              safeImages.length > 1 ? { nextEl: `.${nextClass}`, prevEl: `.${prevClass}` } : false
            }
            loop={safeImages.length > 1}
            simulateTouch
            allowTouchMove
            grabCursor={safeImages.length > 1}
            threshold={5}
            touchStartPreventDefault
            nested
            watchOverflow
            dir="rtl"
          >
            {safeImages.map((src, index) => (
              <SwiperSlide key={`${src}-${index}`}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    minHeight: { xs: 200, sm: 260, md: 280 },
                  }}
                >
                  <Image
                    src={src}
                    alt={interpolate(t('product_image_alt'), { index: index + 1 })}
                    fill
                    draggable={false}
                    sizes="(max-width: 900px) 100vw, 300px"
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>

          {safeImages.length > 1 && (
            <>
              <IconButton
                className={prevClass}
                aria-label={t('previous_slide')}
                size="small"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: 8,
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  bgcolor: 'rgba(255,255,255,.92)',
                  boxShadow: '0 4px 12px rgba(0,0,0,.1)',
                  '&:hover': { bgcolor: '#fff' },
                }}
              >
                <ChevronRightRounded fontSize="small" />
              </IconButton>
              <IconButton
                className={nextClass}
                aria-label={t('next_slide')}
                size="small"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 8,
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  bgcolor: 'rgba(255,255,255,.92)',
                  boxShadow: '0 4px 12px rgba(0,0,0,.1)',
                  '&:hover': { bgcolor: '#fff' },
                }}
              >
                <ChevronLeftRounded fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>

        <Box sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, minWidth: 0 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1}
          >
            <Typography
              sx={{
                fontSize: { xs: '1rem', md: '1.1rem' },
                fontWeight: 900,
                color: '#222',
                wordBreak: 'break-word',
              }}
            >
              {product.model || t('without_model')}
            </Typography>
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
              <Chip
                size="small"
                label={product.archived ? t('archived') : t('active')}
                sx={{
                  bgcolor: product.archived ? '#F2F2F2' : '#EDF7EF',
                  color: product.archived ? '#666' : '#3B7A45',
                  fontWeight: 900,
                }}
              />
              <Chip
                size="small"
                icon={<Inventory2Outlined />}
                label={interpolate(t('stock_count'), { count: formatNumber(totalStock) })}
                sx={{ bgcolor: GOLD_LIGHT, color: GOLD_DARK, fontWeight: 900 }}
              />
              <Chip
                size="small"
                label={interpolate(t('variant_count'), {
                  count: (product.variants?.length ?? 0).toLocaleString('fa-IR'),
                })}
                sx={{ bgcolor: '#F5F5F5', fontWeight: 800 }}
              />
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography fontWeight={900} sx={{ mb: 1.25, color: GOLD_DARK }}>
            {t('product_variants')}
          </Typography>

          {!product.variants?.length ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: '#fafafa',
                border: '1px dashed #ddd',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {t('no_product_variants')}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {product.variants.map((variant, index) => (
                <VariantRow key={variant.id ?? `${product.id}-${index}`} variant={variant} />
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default function FrameDetailsDialog({
  open,
  frame,
  onClose,
  bucketName,
  categoryName,
  genderName,
  caratName,
}: Props) {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));
  const { lang } = useLang();
  const { t } = useText('tags', lang);
  const requestIdRef = useRef(0);

  const [products, setProducts] = useState<ProductByBucketDTO[]>([]);
  const [productsMeta, setProductsMeta] = useState<ProductsMeta>({
    currentPage: 0,
    lastPage: 1,
    perPage: PRODUCTS_PER_PAGE,
    total: 0,
  });
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [productsError, setProductsError] = useState(false);
  const [resolvedBucketName, setResolvedBucketName] = useState('');

  const additionalFields = useMemo(
    () =>
      Object.entries(frame?.additionalFields ?? {}).filter(
        ([, value]) => value != null && String(value).trim() !== '',
      ),
    [frame?.additionalFields],
  );

  const loadProducts = useCallback(
    async (page: number, append: boolean) => {
      if (!frame?.id || !frame.bucketId) return;
      const requestId = ++requestIdRef.current;

      if (append) setLoadingMore(true);
      else {
        setLoadingProducts(true);
        setProductsError(false);
      }

      try {
        const result = await getProductsByFrame(frame.bucketId, frame.id, {
          page,
          per_page: PRODUCTS_PER_PAGE,
        });

        if (requestId !== requestIdRef.current || !result) return;

        const incoming = result.products ?? [];
        setProducts((previous) => {
          if (!append) return incoming;
          const map = new Map<number, ProductByBucketDTO>();
          previous.forEach((product) => map.set(product.id, product));
          incoming.forEach((product) => map.set(product.id, product));
          return Array.from(map.values());
        });

        setResolvedBucketName(result.bucketName || bucketName || '');
        setProductsMeta({
          currentPage: result.meta.currentPage,
          lastPage: result.meta.lastPage,
          perPage: result.meta.perPage,
          total: result.meta.total,
        });
      } catch {
        if (requestId === requestIdRef.current) setProductsError(true);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoadingProducts(false);
          setLoadingMore(false);
        }
      }
    },
    [bucketName, frame?.bucketId, frame?.id],
  );

  useEffect(() => {
    if (!open || !frame?.id || !frame.bucketId) return;
    setProducts([]);
    setProductsMeta({ currentPage: 0, lastPage: 1, perPage: PRODUCTS_PER_PAGE, total: 0 });
    setResolvedBucketName(bucketName || '');
    void loadProducts(1, false);

    return () => {
      requestIdRef.current += 1;
    };
  }, [bucketName, frame?.bucketId, frame?.id, loadProducts, open]);

  if (!frame) return null;

  const wageProfit = Number(frame.wage || 0) + Number(frame.profit || 0);
  const discount = Number(frame.discount || 0);
  const canLoadMore = productsMeta.currentPage < productsMeta.lastPage;
  const displayBucketName = bucketName || resolvedBucketName;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      fullScreen={isBelowMd}
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, md: 4 },
          overflow: 'hidden',
          bgcolor: '#fff',
          ...(isBelowMd && {
            m: 0,
            width: '100%',
            maxWidth: '100%',
            height: '100dvh',
            maxHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
          }),
        },
      }}
    >
      <Box
        sx={{
          px: { xs: 1.5, sm: 2.5 },
          py: 1.25,
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 20,
          bgcolor: '#fff',
        }}
      >
        <DialogTitle sx={{ p: 0, fontWeight: 900, fontSize: { xs: '1.05rem', md: '1.25rem' } }}>
          {t('frame_details')}
        </DialogTitle>
        <IconButton onClick={onClose} aria-label={t('close')}>
          <CloseRounded />
        </IconButton>
      </Box>

      <DialogContent
        sx={{
          p: { xs: 1.25, sm: 2, md: 3 },
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) 350px' },
            gap: { xs: 2.5, md: 3 },
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: { xs: 3, md: 4 },
                border: '1px solid #eaeaea',
                bgcolor: '#fafafa',
              }}
            >
              {displayBucketName && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ mb: 0.5 }}
                >
                  {displayBucketName}
                </Typography>
              )}
              <Typography
                sx={{
                  fontSize: { xs: '1.3rem', md: '1.65rem' },
                  fontWeight: 900,
                  color: '#1a1a1a',
                  wordBreak: 'break-word',
                }}
              >
                {frame.model || t('without_model')}
              </Typography>

              <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
                {categoryName && (
                  <Chip
                    icon={<CategoryRounded />}
                    label={categoryName}
                    size="small"
                    sx={{ bgcolor: GOLD_LIGHT, color: GOLD_DARK, fontWeight: 900 }}
                  />
                )}
                {genderName && (
                  <Chip
                    label={genderName}
                    size="small"
                    sx={{ bgcolor: '#F4F4F4', fontWeight: 800 }}
                  />
                )}
                <Chip
                  label={interpolate(t('carat_value'), {
                    value: formatNumber(caratName || frame.carat),
                  })}
                  size="small"
                  sx={{ bgcolor: '#FFF9E6', color: GOLD_DARK, fontWeight: 900 }}
                />
                <Chip
                  label={frame.archived ? t('archived') : t('active')}
                  size="small"
                  sx={{
                    bgcolor: frame.archived ? '#F2F2F2' : '#EDF7EF',
                    color: frame.archived ? '#666' : '#3B7A45',
                    fontWeight: 900,
                  }}
                />
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                mt: { xs: 1.25, md: 2 },
                borderRadius: { xs: 3, md: 4 },
                border: '1px solid #eaeaea',
                overflow: 'hidden',
                bgcolor: '#fafafa',
                px: { xs: 2, md: 2.5 },
              }}
            >
              <DataRow
                icon={<PercentRounded fontSize="small" />}
                label={t('wage_profit')}
                value={interpolate(t('percent_value'), { value: formatNumber(wageProfit) })}
              />
              <Divider />
              <DataRow
                icon={<LocalOfferOutlined fontSize="small" />}
                label={t('discount')}
                value={
                  discount > 0
                    ? interpolate(t('percent_value'), { value: formatNumber(discount) })
                    : '—'
                }
                highlight={discount > 0}
              />
              <Divider />
              <DataRow
                icon={<VerticalAlignBottomRounded fontSize="small" />}
                label={t('min_weight')}
                value={interpolate(t('weight_value'), { value: formatNumber(frame.minWeight) })}
              />
              <Divider />
              <DataRow
                icon={<VerticalAlignTopRounded fontSize="small" />}
                label={t('max_weight')}
                value={interpolate(t('weight_value'), { value: formatNumber(frame.maxWeight) })}
              />
              <Divider />
              <DataRow
                icon={<ScaleRounded fontSize="small" />}
                label={t('total_weight')}
                value={interpolate(t('weight_value'), { value: formatNumber(frame.totalWeight) })}
              />
            </Paper>

            {additionalFields.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  p: { xs: 2, md: 2.5 },
                  borderRadius: { xs: 3, md: 4 },
                  border: '1px solid #eaeaea',
                }}
              >
                <Typography fontWeight={900} sx={{ mb: 1.5 }}>
                  {t('additional_frame_fields')}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0,1fr))' },
                    gap: 1,
                  }}
                >
                  {additionalFields.map(([key, value]) => (
                    <Box
                      key={key}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#fafafa',
                        border: '1px solid #eee',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        {key}
                      </Typography>
                      <Typography fontWeight={900} sx={{ mt: 0.25, wordBreak: 'break-word' }}>
                        {String(value)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}
          </Box>

          <Box
            sx={{
              order: { xs: -1, md: 0 },
              position: { md: 'sticky' },
              top: { md: 0 },
              minWidth: 0,
              maxWidth: '100%',
            }}
          >
            <FrameImageSlider frame={frame} />
          </Box>
        </Box>

        <Box sx={{ mt: { xs: 2.25, md: 4 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.15rem', md: '1.35rem' } }}>
                {t('frame_products')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                {t('frame_products_hint')}
              </Typography>
            </Box>
            {!loadingProducts && !productsError && (
              <Chip
                label={interpolate(t('product_count'), {
                  count: productsMeta.total.toLocaleString('fa-IR'),
                })}
                sx={{ bgcolor: GOLD_LIGHT, color: GOLD_DARK, fontWeight: 900 }}
              />
            )}
          </Stack>

          {loadingProducts ? (
            <Stack spacing={1.5}>
              {[1, 2].map((item) => (
                <Box
                  key={item}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '220px 1fr', md: '300px 1fr' },
                    border: '1px solid #eee',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    sx={{ minHeight: { xs: 200, sm: 260, md: 280 } }}
                  />
                  <Box sx={{ p: 2.5 }}>
                    <Skeleton width="42%" height={32} />
                    <Skeleton width="75%" />
                    <Skeleton width="90%" />
                    <Skeleton width="65%" />
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : productsError ? (
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 3,
                border: '1px dashed #e0b8b8',
                bgcolor: '#FFF8F8',
              }}
            >
              <Typography fontWeight={900}>{t('products_load_error')}</Typography>
              <Button
                variant="outlined"
                onClick={() => void loadProducts(1, false)}
                sx={{ mt: 1.5, borderColor: GOLD_BORDER, color: GOLD_DARK }}
              >
                {t('retry')}
              </Button>
            </Box>
          ) : products.length === 0 ? (
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 3,
                border: `1px dashed ${GOLD_BORDER}`,
                bgcolor: GOLD_LIGHT,
              }}
            >
              <Inventory2Outlined sx={{ fontSize: 40, color: GOLD, mb: 1 }} />
              <Typography fontWeight={900}>{t('no_products_for_frame')}</Typography>
            </Box>
          ) : (
            <Stack spacing={{ xs: 1.25, md: 1.75 }}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Stack>
          )}

          {canLoadMore && !loadingProducts && !productsError && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2.5 }}>
              <Button
                variant="outlined"
                disabled={loadingMore}
                onClick={() => void loadProducts(productsMeta.currentPage + 1, true)}
                sx={{
                  borderColor: GOLD_BORDER,
                  color: GOLD_DARK,
                  minWidth: 180,
                  '&:hover': { borderColor: GOLD, bgcolor: alpha(GOLD, 0.05) },
                }}
              >
                {loadingMore ? (
                  <CircularProgress size={20} sx={{ color: GOLD }} />
                ) : (
                  t('load_more_products')
                )}
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
