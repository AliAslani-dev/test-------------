'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AddRounded,
  ArrowBackRounded,
  CheckCircleRounded,
  DeleteOutlineRounded,
  EditRounded,
  FilterAltOffRounded,
  ImageNotSupportedRounded,
  KeyboardArrowDownRounded,
  PowerSettingsNewRounded,
  SearchRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Slider,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import {
  assignFramesToTag,
  deleteFrameFromTag,
  editTag,
  getAllFrames,
  getTag,
  toggleTagStatus,
} from '@/api/admin/seller/service';
import type { AllFrameDTO, FrameBundle, FramesFilters, TagDTO } from '@/api/admin/seller/dto';
import { getFrameCarats, getFrameCategories, getFrameGenderCategories } from '@/api/frame/service';
import type {
  FrameCaratDTO,
  FrameCategoryDTO,
  FrameGenderCategoryDTO,
  FramesByBucketDTO,
} from '@/api/frame/dto';
import CustomTextField from '@/components/shared/custom-text-field';
import FrameDetailsDialog from '@/components/shared/frame-details-dialog';
import { getAdminBucket } from '@/api/admin/bucket/service';
import type { AdminBucketDTO } from '@/api/admin/bucket/dto';
import { useLang } from '@/hooks/LanContext';
import useText from '@/hooks/useText';
import { useNotification } from '@/hooks/useNotification';

interface TagTabProps {
  tagId: number | null;
}

type Notice = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
};

type RangeValue = [number, number];

type FilterForm = {
  filter: string;
  bucketId: number | '';
  categories: number[];
  genderCategories: number[];
  carat: string;
  wageProfit: RangeValue;
  wageProfitDiscount: RangeValue;
  totalWeight: RangeValue;
  minWeight: RangeValue;
  maxWeight: RangeValue;
};

type FrameLike = FramesByBucketDTO | AllFrameDTO;

type SellerFramesRequest = FramesFilters & {
  bucket_id?: number;
  gender_categories?: number[];
};

const GOLD = '#B58A32';
const GOLD_DARK = '#8B6A25';
const GOLD_LIGHT = '#FBF7EC';
const GOLD_BORDER = '#E8D7A7';

const RANGE_CONFIG = {
  wageProfit: {
    labelKey: 'wage_profit',
    min: 0,
    max: 100,
    step: 0.1,
    unitKey: 'percent',
  },
  wageProfitDiscount: {
    labelKey: 'wage_profit_discount',
    min: 0,
    max: 100,
    step: 0.1,
    unitKey: 'percent',
  },
  totalWeight: {
    labelKey: 'total_weight',
    min: 0,
    max: 1000,
    step: 1,
    unitKey: 'gram',
  },
  minWeight: {
    labelKey: 'min_weight',
    min: 0,
    max: 100,
    step: 1,
    unitKey: 'gram',
  },
  maxWeight: {
    labelKey: 'max_weight',
    min: 0,
    max: 100,
    step: 1,
    unitKey: 'gram',
  },
} as const;

const EMPTY_NOTICE: Notice = {
  open: false,
  message: '',
  severity: 'success',
};

const goldContainedSx = {
  bgcolor: GOLD,
  color: '#fff',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: GOLD_DARK,
    boxShadow: 'none',
  },
  '&.Mui-disabled': {
    bgcolor: '#E8E1D1',
    color: '#9B9485',
  },
};

const goldOutlinedSx = {
  borderColor: GOLD_BORDER,
  color: GOLD_DARK,
  '&:hover': {
    borderColor: GOLD,
    bgcolor: alpha(GOLD, 0.06),
  },
};

const buttonWithLeftIconSx = {
  columnGap: 0.75,
  '& .MuiButton-endIcon': { m: 0 },
};

function interpolate(text: string, values: Record<string, string | number> = {}) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    text,
  );
}

const goldFieldWrapperSx = {
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: GOLD,
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: GOLD_DARK,
  },
};

const goldFormControlSx = {
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: GOLD,
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: GOLD_DARK,
  },
};

function createInitialFilters(): FilterForm {
  return {
    filter: '',
    bucketId: '',
    categories: [],
    genderCategories: [],
    carat: '',
    wageProfit: [RANGE_CONFIG.wageProfit.min, RANGE_CONFIG.wageProfit.max],
    wageProfitDiscount: [RANGE_CONFIG.wageProfitDiscount.min, RANGE_CONFIG.wageProfitDiscount.max],
    totalWeight: [RANGE_CONFIG.totalWeight.min, RANGE_CONFIG.totalWeight.max],
    minWeight: [RANGE_CONFIG.minWeight.min, RANGE_CONFIG.minWeight.max],
    maxWeight: [RANGE_CONFIG.maxWeight.min, RANGE_CONFIG.maxWeight.max],
  };
}

function frameCover(frame: FrameLike | null): string | null {
  if (!frame) return null;
  return frame.cover || frame.covers?.[0] || frame.image || frame.images?.[0] || null;
}

function frameSecondCover(frame: FrameLike): string | null {
  return frame.covers?.[1] || frame.images?.[1] || null;
}

function formatFa(value: string | number): string {
  if (value === '' || value == null) return '—';
  const n = Number(value);
  if (Number.isFinite(n)) return n.toLocaleString('fa-IR', { maximumFractionDigits: 3 });
  return String(value);
}

function categoryNameById(id: number | null, categories: FrameCategoryDTO[]) {
  if (id == null) return '';
  const found = categories.find((category) => category.id === id);
  return found?.faName || found?.enName || '';
}

function genderNameById(id: number | null, categories: FrameGenderCategoryDTO[]) {
  if (id == null) return '';
  const found = categories.find((category) => category.id === id);
  return found?.faName || found?.enName || '';
}

function caratNameByValue(value: string, carats: FrameCaratDTO[]) {
  if (!value || !carats.length) return '';
  const found = carats.find(
    (carat) => String(carat.value) === String(value) || String(carat.amount) === String(value),
  );
  return found?.amount || found?.value || value;
}

function bucketNameById(id: number, buckets: AdminBucketDTO[]) {
  const found = buckets.find((bucket) => bucket.id === id);
  return found?.name || found?.identifier || '';
}

function buildFramesParams(filters: FilterForm, page: number): SellerFramesRequest {
  const params: SellerFramesRequest = {
    per_page: 24,
    page,
    categories: filters.categories,
  };

  const filter = filters.filter.trim();
  if (filter) params.filter = filter;
  if (filters.bucketId !== '') params.bucket_id = Number(filters.bucketId);
  params.gender_categories = filters.genderCategories;
  if (filters.carat) params.carat = filters.carat;

  const applyRange = (
    value: RangeValue,
    minBoundary: number,
    maxBoundary: number,
    minKey:
      | 'min_wage_profit'
      | 'min_wage_profit_discount'
      | 'min_total_weight'
      | 'min_min_weight'
      | 'min_max_weight',
    maxKey:
      | 'max_wage_profit'
      | 'max_wage_profit_discount'
      | 'max_total_weight'
      | 'max_min_weight'
      | 'max_max_weight',
  ) => {
    const changedFromDefault = value[0] !== minBoundary || value[1] !== maxBoundary;

    // If either side of a range changes, send BOTH sides so the backend
    // always receives one complete range instead of a half-open filter.
    if (changedFromDefault) {
      params[minKey] = value[0];
      params[maxKey] = value[1];
    }
  };

  applyRange(
    filters.wageProfit,
    RANGE_CONFIG.wageProfit.min,
    RANGE_CONFIG.wageProfit.max,
    'min_wage_profit',
    'max_wage_profit',
  );
  applyRange(
    filters.wageProfitDiscount,
    RANGE_CONFIG.wageProfitDiscount.min,
    RANGE_CONFIG.wageProfitDiscount.max,
    'min_wage_profit_discount',
    'max_wage_profit_discount',
  );
  applyRange(
    filters.totalWeight,
    RANGE_CONFIG.totalWeight.min,
    RANGE_CONFIG.totalWeight.max,
    'min_total_weight',
    'max_total_weight',
  );
  applyRange(
    filters.minWeight,
    RANGE_CONFIG.minWeight.min,
    RANGE_CONFIG.minWeight.max,
    'min_min_weight',
    'max_min_weight',
  );
  applyRange(
    filters.maxWeight,
    RANGE_CONFIG.maxWeight.min,
    RANGE_CONFIG.maxWeight.max,
    'min_max_weight',
    'max_max_weight',
  );

  return params;
}

function EditableBannerSlider({
  banners,
  hasPendingChanges,
  onSelect,
}: {
  banners: string[];
  hasPendingChanges: boolean;
  onSelect: () => void;
}) {
  const swiperId = useId().replace(/:/g, '');
  const { lang } = useLang();
  const { t } = useText('tags', lang);
  const prevClass = `editable-banner-prev-${swiperId}`;
  const nextClass = `editable-banner-next-${swiperId}`;

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('.tag-banner-nav') || target.closest('.swiper-pagination')) return;
    onSelect();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={t('select_tag_banners')}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4 / 1',
        overflow: 'hidden',
        borderRadius: { xs: 2.5, md: 3.5 },
        cursor: 'pointer',
        outline: 'none',
        border: `1px solid ${hasPendingChanges ? GOLD : GOLD_BORDER}`,
        boxShadow: hasPendingChanges ? `0 0 0 3px ${alpha(GOLD, 0.09)}` : 'none',
        transition: 'border-color .2s ease, box-shadow .2s ease',
        '&:focus-visible': { boxShadow: `0 0 0 4px ${alpha(GOLD, 0.16)}` },
        '& .swiper': { width: '100%', height: '100%' },
        '& .swiper-pagination': { zIndex: 12 },
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
      {banners.length ? (
        <Swiper
          modules={[Navigation, Pagination]}
          navigation={
            banners.length > 1 ? { nextEl: `.${nextClass}`, prevEl: `.${prevClass}` } : false
          }
          pagination={banners.length > 1 ? { clickable: true } : false}
          loop={banners.length > 1}
          dir="rtl"
        >
          {banners.map((banner, index) => (
            <SwiperSlide key={`${banner}-${index}`}>
              <Box
                component="img"
                src={banner}
                alt={interpolate(t('banner_alt'), { index: index + 1 })}
                loading="lazy"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: GOLD_LIGHT,
          }}
        >
          <Stack alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
            <ImageNotSupportedRounded sx={{ fontSize: 36, color: GOLD }} />
            <Typography variant="body2">{t('no_banner')}</Typography>
          </Stack>
        </Box>
      )}

      {banners.length > 1 && (
        <>
          <Box
            className={`${prevClass} tag-banner-nav`}
            role="button"
            aria-label={t('previous_slide')}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 8,
              transform: 'translateY(-50%)',
              zIndex: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 30, sm: 34 },
              height: { xs: 30, sm: 34 },
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,.90)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,.10)',
              border: '1px solid rgba(0,0,0,.05)',
              cursor: 'pointer',
              color: '#444',
              transition: 'all .2s ease',
              '&:hover': {
                bgcolor: '#fff',
                transform: 'translateY(-50%) scale(1.05)',
                color: '#1a1a1a',
              },
              '&.swiper-button-disabled': { opacity: 0.45, cursor: 'default' },
            }}
          >
            <ChevronRightRounded fontSize="small" />
          </Box>
          <Box
            className={`${nextClass} tag-banner-nav`}
            role="button"
            aria-label={t('next_slide')}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 8,
              transform: 'translateY(-50%)',
              zIndex: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 30, sm: 34 },
              height: { xs: 30, sm: 34 },
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,.90)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,.10)',
              border: '1px solid rgba(0,0,0,.05)',
              cursor: 'pointer',
              color: '#444',
              transition: 'all .2s ease',
              '&:hover': {
                bgcolor: '#fff',
                transform: 'translateY(-50%) scale(1.05)',
                color: '#1a1a1a',
              },
              '&.swiper-button-disabled': { opacity: 0.45, cursor: 'default' },
            }}
          >
            <ChevronLeftRounded fontSize="small" />
          </Box>
        </>
      )}

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(0,0,0,.26) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,.20) 100%)',
        }}
      />

      <Chip
        label={hasPendingChanges ? t('new_banners_selected') : t('click_to_change_banners')}
        sx={{
          position: 'absolute',
          top: { xs: 8, sm: 12 },
          right: { xs: 8, sm: 12 },
          zIndex: 11,
          pointerEvents: 'none',
          bgcolor: 'rgba(255,255,255,.92)',
          color: GOLD_DARK,
          fontWeight: 900,
          backdropFilter: 'blur(8px)',
          maxWidth: 'calc(100% - 24px)',
        }}
      />
    </Box>
  );
}

function FrameVisualCard({
  frame,
  categoryName,
  genderName,
  caratName,
  bucketName,
  selected = false,
  disabled = false,
  statusLabel,
  statusTone = 'neutral',
  onOpen,
  onSelect,
  onDelete,
  deleting = false,
}: {
  frame: FrameLike;
  categoryName: string;
  genderName: string;
  caratName: string;
  bucketName: string;
  selected?: boolean;
  disabled?: boolean;
  statusLabel?: string;
  statusTone?: 'gold' | 'success' | 'warning' | 'neutral';
  onOpen?: () => void;
  onSelect?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { lang } = useLang();
  const { t } = useText('tags', lang);
  const [hovered, setHovered] = useState(false);

  const mainImage = frameCover(frame) || '/images/BlurFrame.jpg';
  const secondImage = frameSecondCover(frame);
  const hasSecondImage = Boolean(secondImage) && isDesktop;

  const discount = Number(frame.discount || 0);
  const percentAmount = Number(frame.wage || 0) + Number(frame.profit || 0);

  const statusSx =
    statusTone === 'success'
      ? { bgcolor: '#EDF7EF', color: '#3B7A45' }
      : statusTone === 'warning'
        ? { bgcolor: '#FFF6E8', color: '#9A6824' }
        : statusTone === 'gold'
          ? { bgcolor: GOLD_LIGHT, color: GOLD_DARK }
          : { bgcolor: '#F4F4F4', color: '#686868' };

  return (
    <Card
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: 'relative',
        borderRadius: { xs: 3, md: 4 },
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        bgcolor: 'white',
        boxShadow: hovered ? '0 18px 42px rgba(38,31,14,.09)' : '0 5px 16px rgba(38,31,14,.025)',
        cursor: onOpen ? 'pointer' : 'default',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid',
        borderColor: selected ? GOLD : 'divider',
        opacity: disabled ? 0.82 : 1,
        overflow: 'hidden',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      <Box sx={{ p: { xs: 0.75, md: 1 } }}>
        <Box sx={{ position: 'relative' }}>
          {discount > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 8,
                px: 1.1,
                py: 0.55,
                borderRadius: 99,
                bgcolor: '#B84A4A',
                color: '#fff',
                fontWeight: 900,
                fontSize: '0.72rem',
                boxShadow: '0 5px 14px rgba(0,0,0,.12)',
              }}
            >
              {interpolate(t('discount_percent'), { value: formatFa(discount) })}
            </Box>
          )}

          {onDelete && (
            <Tooltip title={t('remove_from_collection')}>
              <span>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete();
                  }}
                  disabled={deleting}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 9,
                    bgcolor: 'rgba(255,255,255,.94)',
                    color: '#B84A4A',
                    boxShadow: '0 4px 12px rgba(0,0,0,.08)',
                    '&:hover': { bgcolor: '#FFF4F4' },
                  }}
                >
                  {deleting ? (
                    <CircularProgress size={17} sx={{ color: '#B84A4A' }} />
                  ) : (
                    <DeleteOutlineRounded fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          )}

          {onSelect && !onDelete && (
            <Checkbox
              checked={selected}
              disabled={disabled}
              tabIndex={-1}
              onClick={(event) => event.stopPropagation()}
              onChange={() => {
                if (!disabled) onSelect();
              }}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 9,
                bgcolor: 'rgba(255,255,255,.92)',
                borderRadius: 1.5,
                color: GOLD,
                '&.Mui-checked': { color: GOLD_DARK },
                '&:hover': { bgcolor: '#fff' },
              }}
            />
          )}

          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              pt: '100%',
              borderRadius: { xs: 2.5, md: 3.5 },
              bgcolor: '#f8f8f8',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                transition: 'transform 0.8s ease, opacity 0.45s ease-in-out',
                opacity: hovered && hasSecondImage ? 0 : 1,
                transform: hovered ? 'scale(1.055)' : 'scale(1)',
              }}
            >
              <Box
                component="img"
                src={mainImage}
                alt={frame.model || t('frame_alt')}
                loading="lazy"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </Box>

            {hasSecondImage && secondImage && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  transition: 'opacity 0.45s ease-in-out, transform 0.8s ease',
                  opacity: hovered ? 1 : 0,
                  transform: hovered ? 'scale(1.055)' : 'scale(1)',
                }}
              >
                <Box
                  component="img"
                  src={secondImage}
                  alt={interpolate(t('frame_second_image_alt'), {
                    model: frame.model || t('frame_alt'),
                  })}
                  loading="lazy"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </Box>
            )}

            <Box
              sx={{
                pointerEvents: 'none',
                position: 'absolute',
                inset: 0,
                borderRadius: { xs: 2.5, md: 3.5 },
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,.42) 100%)',
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                left: 12,
                right: 12,
                bottom: 8,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Chip
                size="small"
                label={interpolate(t('percent_value'), { value: formatFa(percentAmount) })}
                sx={{
                  bgcolor: alpha('#fff', 0.74),
                  color: '#292929',
                  border: `1px solid ${alpha('#fff', 0.55)}`,
                  backdropFilter: 'blur(8px)',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <CardContent
        sx={{
          pb: { xs: 1.4, md: 2 },
          pt: 0.5,
          flexGrow: 1,
          textAlign: 'right',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          useFlexGap
          flexWrap="wrap"
          sx={{ mb: 1.1 }}
        >
          {bucketName && (
            <Chip
              label={bucketName}
              size="small"
              sx={{
                bgcolor: '#F7F3EA',
                color: '#6F5B2C',
                fontWeight: 900,
                fontSize: { xs: '0.62rem', sm: '0.72rem' },
                height: 22,
                border: `1px solid ${GOLD_BORDER}`,
              }}
            />
          )}

          {categoryName && (
            <Chip
              label={categoryName}
              size="small"
              sx={{
                bgcolor: GOLD_LIGHT,
                color: GOLD_DARK,
                fontWeight: 900,
                fontSize: { xs: '0.62rem', sm: '0.72rem' },
                height: 22,
              }}
            />
          )}

          {genderName && (
            <Chip
              label={genderName}
              size="small"
              sx={{
                bgcolor: '#F5F5F5',
                color: '#737373',
                fontWeight: 800,
                fontSize: { xs: '0.62rem', sm: '0.72rem' },
                height: 22,
              }}
            />
          )}

          {caratName && (
            <Typography
              variant="caption"
              sx={{
                color: GOLD_DARK,
                fontWeight: 900,
                mr: 'auto',
                fontSize: { xs: '0.62rem', sm: '0.72rem' },
              }}
            >
              {interpolate(t('carat_value'), { value: formatFa(caratName) })}
            </Typography>
          )}
        </Stack>

        <Typography
          sx={{
            fontWeight: 900,
            fontSize: { xs: '0.9rem', sm: '1rem' },
            color: '#242424',
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: { xs: '2.8rem', sm: '3.05rem' },
          }}
        >
          {frame.model || t('without_model')}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: '#666',
            fontSize: { xs: '0.74rem', sm: '0.84rem' },
            mt: 1,
          }}
        >
          {t('frame_total_weight')}{' '}
          <Box component="span" sx={{ fontWeight: 900, color: '#333' }}>
            {formatFa(frame.totalWeight)}
          </Box>{' '}
          {t('gram')}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: '#666',
            fontSize: { xs: '0.72rem', sm: '0.82rem' },
            mt: 0.8,
          }}
        >
          {t('range_from')}{' '}
          <Box component="span" sx={{ fontWeight: 900, color: '#333' }}>
            {formatFa(frame.minWeight)}
          </Box>{' '}
          {t('range_to')}{' '}
          <Box component="span" sx={{ fontWeight: 900, color: '#333' }}>
            {formatFa(frame.maxWeight)}
          </Box>{' '}
          {t('gram')}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Divider sx={{ mt: 1.4, mb: 1 }} />
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          {statusLabel ? (
            <Chip
              size="small"
              icon={statusTone === 'success' ? <CheckCircleRounded /> : undefined}
              label={statusLabel}
              sx={{ ...statusSx, fontWeight: 900, maxWidth: '100%' }}
            />
          ) : (
            <Box />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function AddAssignedCard({ onClick }: { onClick: () => void }) {
  const theme = useTheme();
  const { lang } = useLang();
  const { t } = useText('tags', lang);

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        appearance: 'none',
        minHeight: { xs: 250, sm: 330 },
        borderRadius: { xs: 3, md: 4 },
        border: `1px dashed ${GOLD}`,
        bgcolor: GOLD_LIGHT,
        color: GOLD_DARK,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        transition: theme.transitions.create(['background-color', 'transform', 'border-color']),
        '&:hover': {
          bgcolor: alpha(GOLD, 0.12),
          borderColor: GOLD_DARK,
          transform: { md: 'translateY(-2px)' },
        },
      }}
    >
      <AddRounded sx={{ fontSize: 40 }} />
      <Typography fontWeight={900}>{t('add_frame')}</Typography>
      <Typography variant="caption" color="text.secondary">
        {t('go_to_frame_search')}
      </Typography>
    </Box>
  );
}

function RangeSliderFilter({
  labelKey,
  value,
  min,
  max,
  step,
  unitKey,
  onChange,
}: {
  labelKey: string;
  value: RangeValue;
  min: number;
  max: number;
  step: number;
  unitKey: string;
  onChange: (value: RangeValue) => void;
}) {
  const { lang } = useLang();
  const { t } = useText('tags', lang);
  const label = t(labelKey);
  const unit = t(unitKey);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2.5,
        px: 2,
        pt: 1.5,
        pb: 0.7,
        bgcolor: '#fff',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Typography variant="body2" fontWeight={900}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary" dir="rtl">
          {interpolate(t('range_summary'), {
            from: formatFa(value[0]),
            to: formatFa(value[1]),
            unit,
          })}
        </Typography>
      </Stack>

      <Box sx={{ px: 0.6, pt: 0.5 }} dir="ltr">
        <Slider
          getAriaLabel={() => label}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(_, nextValue) => onChange(nextValue as RangeValue)}
          valueLabelDisplay="auto"
          valueLabelFormat={(sliderValue) => formatFa(sliderValue)}
          disableSwap
          sx={{
            color: GOLD,
            '& .MuiSlider-thumb': {
              width: 17,
              height: 17,
              bgcolor: '#fff',
              border: `2px solid ${GOLD}`,
              '&:hover, &.Mui-focusVisible': {
                boxShadow: `0 0 0 7px ${alpha(GOLD, 0.13)}`,
              },
            },
            '& .MuiSlider-track': { border: 'none' },
            '& .MuiSlider-rail': { bgcolor: '#D9D5CC' },
            '& .MuiSlider-valueLabel': { bgcolor: GOLD_DARK },
          }}
        />
      </Box>
    </Box>
  );
}

export default function TagTab({ tagId }: TagTabProps) {
  const router = useRouter();
  const { lang } = useLang();
  const { t } = useText('tags', lang);
  const { showNotification } = useNotification();
  const tRef = useRef(t);
  tRef.current = t;
  const searchParams = useSearchParams();
  const assignSectionRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sentinelLoadTriggeredRef = useRef(false);
  const loadingFramesRef = useRef(false);
  const currentPageRef = useRef(0);
  const lastPageRef = useRef(1);
  const framesRequestIdRef = useRef(0);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const effectLoadedTagIdRef = useRef<number | null>(null);
  const filterOptionsPromiseRef = useRef<Promise<
    [FrameCategoryDTO[], FrameGenderCategoryDTO[], FrameCaratDTO[], AdminBucketDTO[]]
  > | null>(null);
  const initialFramesTagIdRef = useRef<number | null>(null);

  const categoryQuery = searchParams.get('category');
  const tagsBackHref = categoryQuery
    ? `/dashboard/tags?category=${encodeURIComponent(categoryQuery)}`
    : '/dashboard/tags';

  const [tag, setTag] = useState<TagDTO | null>(null);
  const [loadingTag, setLoadingTag] = useState(true);
  const [savingTag, setSavingTag] = useState(false);
  const [togglingTag, setTogglingTag] = useState(false);

  const [bannerFiles, setBannerFiles] = useState<(File | null)[]>([null, null, null]);
  const [bannerPreviews, setBannerPreviews] = useState<(string | null)[]>([null, null, null]);

  const [categories, setCategories] = useState<FrameCategoryDTO[]>([]);
  const [genderCategories, setGenderCategories] = useState<FrameGenderCategoryDTO[]>([]);
  const [carats, setCarats] = useState<FrameCaratDTO[]>([]);
  const [buckets, setBuckets] = useState<AdminBucketDTO[]>([]);
  const [filters, setFilters] = useState<FilterForm>(() => createInitialFilters());
  const [appliedFilters, setAppliedFilters] = useState<FilterForm>(() => createInitialFilters());

  const [frames, setFrames] = useState<AllFrameDTO[]>([]);
  const [loadingFrames, setLoadingFrames] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [framesTotal, setFramesTotal] = useState(0);
  const [selectedFrameIds, setSelectedFrameIds] = useState<Set<number>>(new Set());
  const [detailsFrame, setDetailsFrame] = useState<FrameLike | null>(null);
  const [assigning, setAssigning] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<FrameBundle | null>(null);
  const [deletingBundleId, setDeletingBundleId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice>(EMPTY_NOTICE);

  const activeBundles = useMemo(
    () => (tag?.bundles ?? []).filter((bundle) => bundle.deletedAt === null),
    [tag],
  );

  const assignedFrameIds = useMemo(() => {
    return new Set(activeBundles.map((bundle) => bundle.frame.id));
  }, [activeBundles]);

  const loadTag = useCallback(async () => {
    if (!tagId || !Number.isFinite(tagId)) {
      setTag(null);
      setLoadingTag(false);
      return;
    }

    setLoadingTag(true);
    try {
      const result = await getTag(tagId);
      if (!result || !result.id) {
        setTag(null);
        showNotification(tRef.current('tag_not_found'), 'error');
      } else {
        setTag(result);
      }
    } catch {
      setTag(null);
      showNotification(tRef.current('error_load_tag'), 'error');
    } finally {
      setLoadingTag(false);
    }
  }, [tagId]);

  useEffect(() => {
    if (!tagId || !Number.isFinite(tagId)) {
      void loadTag();
      return;
    }
    if (effectLoadedTagIdRef.current === tagId) return;
    effectLoadedTagIdRef.current = tagId;
    void loadTag();
  }, [loadTag, tagId]);

  useEffect(() => {
    let active = true;

    if (!filterOptionsPromiseRef.current) {
      filterOptionsPromiseRef.current = Promise.all([
        getFrameCategories(),
        getFrameGenderCategories(),
        getFrameCarats(),
        getAdminBucket(),
      ]).then(([categoryResult, genderResult, caratResult, bucketResult]) => [
        Array.isArray(categoryResult) ? categoryResult : [],
        Array.isArray(genderResult) ? genderResult : [],
        Array.isArray(caratResult) ? caratResult : [],
        Array.isArray(bucketResult) ? bucketResult : [],
      ]);
    }

    const request = filterOptionsPromiseRef.current;

    void request
      .then(([categoryResult, genderResult, caratResult, bucketResult]) => {
        if (!active) return;

        setCategories(categoryResult);
        setGenderCategories(genderResult);
        setCarats(caratResult);
        setBuckets(bucketResult);
      })
      .catch(() => {
        if (!active) return;

        // Allow a later mount/retry to create a fresh request after a real failure.
        if (filterOptionsPromiseRef.current === request) {
          filterOptionsPromiseRef.current = null;
        }

        showNotification(tRef.current('error_load_filter_options'), 'warning');
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      bannerPreviews.forEach((url) => {
        if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [bannerPreviews]);

  const loadFrames = useCallback(
    async (reset: boolean, nextFilters?: FilterForm) => {
      const filtersToUse = nextFilters ?? appliedFilters;
      const targetPage = reset ? 1 : currentPageRef.current + 1;

      if (!reset) {
        if (loadingFramesRef.current) return;
        if (targetPage > lastPageRef.current) return;
      }

      const requestId = reset ? ++framesRequestIdRef.current : framesRequestIdRef.current;

      loadingFramesRef.current = true;
      if (reset) {
        setLoadingFrames(true);
        setLoadingMore(false);
      } else {
        setLoadingMore(true);
      }

      try {
        const result = await getAllFrames(buildFramesParams(filtersToUse, targetPage));
        if (requestId !== framesRequestIdRef.current || !result) return;

        const incoming = result.frames ?? [];
        setFrames((previous) => {
          if (reset) return incoming;

          const map = new Map<number, AllFrameDTO>();
          previous.forEach((frame) => map.set(frame.id, frame));
          incoming.forEach((frame) => map.set(frame.id, frame));
          return Array.from(map.values());
        });

        currentPageRef.current = result.meta.currentPage;
        lastPageRef.current = result.meta.lastPage;
        setFramesTotal(result.meta.total);
      } catch {
        if (requestId === framesRequestIdRef.current) {
          showNotification(tRef.current('error_load_frames'), 'error');
        }
      } finally {
        if (requestId === framesRequestIdRef.current) {
          loadingFramesRef.current = false;
          setLoadingFrames(false);
          setLoadingMore(false);
        }
      }
    },
    [appliedFilters],
  );

  useEffect(() => {
    if (!tagId || !Number.isFinite(tagId)) return;
    if (initialFramesTagIdRef.current === tagId) return;
    initialFramesTagIdRef.current = tagId;

    const initial = createInitialFilters();
    setFilters(initial);
    setAppliedFilters(initial);
    setSelectedFrameIds(new Set());
    currentPageRef.current = 0;
    lastPageRef.current = 1;
    sentinelLoadTriggeredRef.current = false;
    void loadFrames(true, initial);
    // loadFrames is intentionally excluded here: tagId defines this initialization lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagId]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first) return;

        if (!first.isIntersecting) {
          sentinelLoadTriggeredRef.current = false;
          return;
        }

        if (loadingFramesRef.current) return;

        if (sentinelLoadTriggeredRef.current) return;
        if (currentPageRef.current >= lastPageRef.current) return;

        sentinelLoadTriggeredRef.current = true;
        void loadFrames(false);
      },
      {
        root: null,
        rootMargin: '350px 0px',
        threshold: 0.01,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadFrames, frames.length]);

  const clearSelectedBanners = () => {
    setBannerFiles([null, null, null]);
    setBannerPreviews((previous) => {
      previous.forEach((url) => {
        if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      return [null, null, null];
    });

    if (bannerInputRef.current) {
      bannerInputRef.current.value = '';
    }
  };

  const handleBannerFilesSelected = (files: FileList | null) => {
    if (!files?.length) return;

    const selected = Array.from(files);
    if (selected.length > 3) {
      showNotification(tRef.current('max_three_banners'), 'warning');
      if (bannerInputRef.current) bannerInputRef.current.value = '';
      return;
    }

    const currentCount = Math.min(tag?.banners?.length ?? 0, 3);
    if (currentCount > 0 && selected.length < currentCount) {
      showNotification(tRef.current('banner_reselect_required'), 'warning');
      if (bannerInputRef.current) bannerInputRef.current.value = '';
      return;
    }

    setBannerPreviews((previous) => {
      previous.forEach((url) => {
        if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
      });

      return [0, 1, 2].map((index) =>
        selected[index] ? URL.createObjectURL(selected[index]) : null,
      );
    });

    setBannerFiles([selected[0] ?? null, selected[1] ?? null, selected[2] ?? null]);
  };

  const validateBannerReplacement = (): string | null => {
    if (!tag) return null;

    const anyNewBanner = bannerFiles.some(Boolean);
    if (!anyNewBanner) return null;

    const currentCount = Math.min(tag.banners?.length ?? 0, 3);
    for (let slot = 0; slot < currentCount; slot += 1) {
      if (!bannerFiles[slot]) {
        return t('banner_reselect_all_current');
      }
    }

    const lastSelected = bannerFiles.reduce((last, file, index) => (file ? index : last), -1);

    for (let slot = 0; slot <= lastSelected; slot += 1) {
      if (!bannerFiles[slot]) {
        return t('banner_no_gaps');
      }
    }

    return null;
  };

  const saveBannerChanges = async () => {
    if (!tagId || !tag) return;

    const bannerError = validateBannerReplacement();
    if (bannerError) {
      showNotification(bannerError, 'warning');
      return;
    }

    if (!bannerFiles.some(Boolean)) {
      showNotification(t('no_new_banner_selected'), 'info');
      return;
    }

    setSavingTag(true);
    try {
      await editTag(tagId, tag.position, bannerFiles[0], bannerFiles[1], bannerFiles[2]);

      clearSelectedBanners();

      await loadTag();
      showNotification(t('banners_saved_success'), 'success');
    } catch {
      showNotification(t('banners_save_error'), 'error');
    } finally {
      setSavingTag(false);
    }
  };

  const handleToggleTag = async () => {
    if (!tagId || !tag) return;

    setTogglingTag(true);
    try {
      await toggleTagStatus(tagId);
      setTag((previous) => (previous ? { ...previous, enabled: !previous.enabled } : previous));
      showNotification(
        tag.enabled ? t('tag_disabled_success') : t('tag_enabled_success'),
        'success',
      );
    } catch {
      showNotification(t('toggle_status_error'), 'error');
    } finally {
      setTogglingTag(false);
    }
  };

  const applyFilters = () => {
    const next: FilterForm = {
      ...filters,
      categories: [...filters.categories],
      genderCategories: [...filters.genderCategories],
      wageProfit: [...filters.wageProfit] as RangeValue,
      wageProfitDiscount: [...filters.wageProfitDiscount] as RangeValue,
      totalWeight: [...filters.totalWeight] as RangeValue,
      minWeight: [...filters.minWeight] as RangeValue,
      maxWeight: [...filters.maxWeight] as RangeValue,
    };

    setAppliedFilters(next);
    setSelectedFrameIds(new Set());
    currentPageRef.current = 0;
    lastPageRef.current = 1;
    sentinelLoadTriggeredRef.current = false;
    void loadFrames(true, next);
  };

  const clearFilters = () => {
    const initial = createInitialFilters();
    setFilters(initial);
    setAppliedFilters(initial);
    setSelectedFrameIds(new Set());
    currentPageRef.current = 0;
    lastPageRef.current = 1;
    sentinelLoadTriggeredRef.current = false;
    void loadFrames(true, initial);
  };

  const requestDeleteBundle = (bundle: FrameBundle) => {
    setDeleteTarget(bundle);
  };

  const confirmDeleteBundle = async () => {
    if (!deleteTarget) return;

    setDeletingBundleId(deleteTarget.id);
    try {
      await deleteFrameFromTag(deleteTarget.id);
      setDeleteTarget(null);
      await loadTag();
      await loadFrames(true, appliedFilters);
      showNotification(t('frame_removed_success'), 'success');
    } catch {
      showNotification(t('frame_remove_error'), 'error');
    } finally {
      setDeletingBundleId(null);
    }
  };

  const toggleFrameSelection = (frameId: number) => {
    if (assignedFrameIds.has(frameId)) return;

    setSelectedFrameIds((previous) => {
      const next = new Set(previous);
      if (next.has(frameId)) next.delete(frameId);
      else next.add(frameId);
      return next;
    });
  };

  const assignSelectedFrames = async () => {
    if (!tagId || selectedFrameIds.size === 0) return;

    setAssigning(true);
    try {
      await assignFramesToTag(tagId, Array.from(selectedFrameIds));
      setSelectedFrameIds(new Set());
      await loadTag();
      await loadFrames(true, appliedFilters);
      showNotification(t('frames_assigned_success'), 'success');
    } catch {
      showNotification(t('frames_assign_error'), 'error');
    } finally {
      setAssigning(false);
    }
  };

  const scrollToAssignment = () => {
    assignSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loadingTag) {
    return (
      <Box sx={{ py: 12, display: 'grid', placeItems: 'center' }}>
        <CircularProgress sx={{ color: GOLD }} />
      </Box>
    );
  }

  if (!tag || !tagId) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }} dir="rtl">
        <Typography variant="h6" fontWeight={900}>
          {t('tag_not_found')}
        </Typography>
        <Button
          sx={{ ...goldOutlinedSx, ...buttonWithLeftIconSx, mt: 2 }}
          variant="outlined"
          endIcon={<ArrowBackRounded />}
          onClick={() => router.push(tagsBackHref)}
        >
          {t('back_to_collections')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 2, md: 0 } }} dir="rtl">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h4"
              fontWeight={900}
              sx={{ fontSize: { xs: '1.45rem', md: '2rem' } }}
              noWrap
            >
              {tag.name}
            </Typography>

            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 0.75 }}>
              <Chip
                size="small"
                label={tag.enabled ? t('enabled') : t('disabled')}
                sx={
                  tag.enabled
                    ? { bgcolor: '#EDF7EF', color: '#3B7A45', fontWeight: 900 }
                    : { bgcolor: '#F3F3F3', color: '#747474', fontWeight: 900 }
                }
              />
              <Chip
                size="small"
                variant="outlined"
                label={
                  tag.categoryFaName ||
                  tag.categoryEnName ||
                  interpolate(t('category_fallback'), { id: tag.categoryId })
                }
                sx={{ borderColor: GOLD_BORDER, color: GOLD_DARK, fontWeight: 800 }}
              />
              <Chip
                size="small"
                variant="outlined"
                label={interpolate(t('frame_count'), {
                  count: activeBundles.length.toLocaleString('fa-IR'),
                })}
                sx={{ borderColor: GOLD_BORDER, color: GOLD_DARK, fontWeight: 800 }}
              />
            </Stack>
          </Box>
        </Stack>

        <Button
          variant={tag.enabled ? 'outlined' : 'contained'}
          endIcon={togglingTag ? undefined : <PowerSettingsNewRounded />}
          onClick={() => void handleToggleTag()}
          disabled={togglingTag}
          sx={{
            ...(tag.enabled
              ? {
                  borderColor: '#E9B6B6',
                  color: '#B84A4A',
                  '&:hover': { borderColor: '#B84A4A', bgcolor: '#FFF4F4' },
                }
              : goldContainedSx),
            ...buttonWithLeftIconSx,
          }}
        >
          {togglingTag ? (
            <CircularProgress size={20} color="inherit" />
          ) : tag.enabled ? (
            t('disable')
          ) : (
            t('enable')
          )}
        </Button>
      </Stack>

      <input
        ref={bannerInputRef}
        hidden
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => handleBannerFilesSelected(event.target.files)}
      />

      <EditableBannerSlider
        banners={
          bannerFiles.some(Boolean)
            ? (bannerPreviews.filter(Boolean) as string[])
            : (tag.banners ?? [])
        }
        hasPendingChanges={bannerFiles.some(Boolean)}
        onSelect={() => bannerInputRef.current?.click()}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={1}
        sx={{ mt: 1.25 }}
      >
        <Typography variant="caption" color="text.secondary">
          {t('banner_edit_hint')}
        </Typography>

        {bannerFiles.some(Boolean) && (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={clearSelectedBanners}
              disabled={savingTag}
              sx={goldOutlinedSx}
            >
              {t('clear_selection')}
            </Button>
            <Button
              variant="contained"
              onClick={() => void saveBannerChanges()}
              disabled={savingTag}
              sx={goldContainedSx}
            >
              {savingTag ? <CircularProgress size={20} color="inherit" /> : t('save_banners')}
            </Button>
          </Stack>
        )}
      </Stack>

      <Box sx={{ mt: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1}
          sx={{ mb: 1.5 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={900}>
              {t('assigned_frames_title')}
            </Typography>
            {/* <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {t('assigned_frames_hint')}
            </Typography> */}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {interpolate(t('assigned_frame_count'), {
              count: activeBundles.length.toLocaleString('fa-IR'),
            })}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, minmax(0, 1fr))',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              xl: 'repeat(4, minmax(0, 1fr))',
            },
            gap: { xs: 1.25, md: 1.75 },
          }}
        >
          <AddAssignedCard onClick={scrollToAssignment} />

          {activeBundles.map((bundle) => {
            const frame = bundle.frame;
            return (
              <FrameVisualCard
                key={bundle.id}
                frame={frame}
                categoryName={categoryNameById(frame.category, categories)}
                genderName={genderNameById(frame.genderCategory, genderCategories)}
                caratName={caratNameByValue(frame.carat, carats)}
                bucketName={bucketNameById(frame.bucketId, buckets)}
                statusLabel={t('in_this_collection')}
                statusTone="gold"
                deleting={deletingBundleId === bundle.id}
                onOpen={() => setDetailsFrame(frame)}
                onDelete={() => requestDeleteBundle(bundle)}
              />
            );
          })}
        </Box>
      </Box>

      <Box
        ref={assignSectionRef}
        sx={{
          mt: 5,
          scrollMarginTop: { xs: 90, md: 24 },
          p: { xs: 1.5, md: 2.5 },
          borderRadius: { xs: 3, md: 4 },
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: '#FCFCFC',
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>
            {t('search_add_frames')}
          </Typography>
        </Box>

        <Box
          sx={{
            mt: 2.5,
            p: { xs: 1.25, md: 2 },
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 1.5,
              alignItems: 'end',
            }}
          >
            <Box sx={goldFieldWrapperSx}>
              <CustomTextField
                id="frame-model-filter"
                title={t('model')}
                value={filters.filter}
                setValue={(value) => setFilters((previous) => ({ ...previous, filter: value }))}
                placeholder={t('model_search_placeholder')}
                InputProps={{
                  startAdornment: <SearchRounded sx={{ color: GOLD, mr: 0.5 }} fontSize="small" />,
                }}
              />
            </Box>

            <FormControl size="small" sx={goldFormControlSx}>
              <InputLabel>{t('bucket')}</InputLabel>
              <Select
                value={filters.bucketId}
                label={t('bucket')}
                onChange={(event) => {
                  const value = event.target.value;
                  setFilters((previous) => ({
                    ...previous,
                    bucketId: typeof value === 'string' ? '' : value,
                  }));
                }}
              >
                <MenuItem value="">{t('all')}</MenuItem>
                {buckets.map((bucket) => (
                  <MenuItem key={bucket.id} value={bucket.id}>
                    {bucket.name || bucket.identifier}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={goldFormControlSx}>
              <InputLabel>{t('categories')}</InputLabel>
              <Select
                multiple
                value={filters.categories}
                label={t('categories')}
                onChange={(event) => {
                  const value = event.target.value;
                  setFilters((previous) => ({
                    ...previous,
                    categories:
                      typeof value === 'string'
                        ? value.split(',').map(Number)
                        : (value as number[]),
                  }));
                }}
                renderValue={(selected) => {
                  if (!selected.length) return t('all_categories');
                  return selected
                    .map((id) => categoryNameById(id, categories))
                    .filter(Boolean)
                    .join(', ');
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Checkbox
                      checked={filters.categories.includes(category.id)}
                      size="small"
                      sx={{ color: GOLD, '&.Mui-checked': { color: GOLD_DARK } }}
                    />
                    <Typography variant="body2">{category.faName || category.enName}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={goldFormControlSx}>
              <InputLabel>{t('gender_categories')}</InputLabel>
              <Select
                multiple
                value={filters.genderCategories}
                label={t('gender_categories')}
                onChange={(event) => {
                  const value = event.target.value;
                  setFilters((previous) => ({
                    ...previous,
                    genderCategories:
                      typeof value === 'string'
                        ? value.split(',').map(Number)
                        : (value as number[]),
                  }));
                }}
                renderValue={(selected) => {
                  if (!selected.length) return t('all_gender_categories');
                  return selected
                    .map((id) => genderNameById(id, genderCategories))
                    .filter(Boolean)
                    .join(', ');
                }}
              >
                {genderCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Checkbox
                      checked={filters.genderCategories.includes(category.id)}
                      size="small"
                      sx={{ color: GOLD, '&.Mui-checked': { color: GOLD_DARK } }}
                    />
                    <Typography variant="body2">{category.faName || category.enName}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={goldFormControlSx}>
              <InputLabel>{t('carat')}</InputLabel>
              <Select
                value={filters.carat}
                label={t('carat')}
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    carat: String(event.target.value),
                  }))
                }
              >
                <MenuItem value="">{t('all')}</MenuItem>
                {carats.map((carat) => (
                  <MenuItem key={`${carat.amount}-${carat.value}`} value={carat.value}>
                    {carat.amount || carat.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 1.5,
              mt: 2,
            }}
          >
            <RangeSliderFilter
              {...RANGE_CONFIG.wageProfit}
              value={filters.wageProfit}
              onChange={(value) => setFilters((previous) => ({ ...previous, wageProfit: value }))}
            />
            <RangeSliderFilter
              {...RANGE_CONFIG.wageProfitDiscount}
              value={filters.wageProfitDiscount}
              onChange={(value) =>
                setFilters((previous) => ({ ...previous, wageProfitDiscount: value }))
              }
            />
            <RangeSliderFilter
              {...RANGE_CONFIG.totalWeight}
              value={filters.totalWeight}
              onChange={(value) => setFilters((previous) => ({ ...previous, totalWeight: value }))}
            />
            <RangeSliderFilter
              {...RANGE_CONFIG.minWeight}
              value={filters.minWeight}
              onChange={(value) => setFilters((previous) => ({ ...previous, minWeight: value }))}
            />
            <RangeSliderFilter
              {...RANGE_CONFIG.maxWeight}
              value={filters.maxWeight}
              onChange={(value) => setFilters((previous) => ({ ...previous, maxWeight: value }))}
            />
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="flex-end"
            spacing={1}
            sx={{ mt: 2 }}
          >
            <Button
              variant="outlined"
              endIcon={<FilterAltOffRounded />}
              onClick={clearFilters}
              disabled={loadingFrames}
              sx={{ ...goldOutlinedSx, ...buttonWithLeftIconSx }}
            >
              {t('clear_filters')}
            </Button>
            <Button
              variant="contained"
              endIcon={<SearchRounded />}
              onClick={applyFilters}
              disabled={loadingFrames}
              sx={{ ...goldContainedSx, ...buttonWithLeftIconSx }}
            >
              {t('apply_filters')}
            </Button>
          </Stack>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1.5}
          sx={{ mt: 2.5, mb: 1.5 }}
        >
          <Typography variant="body2" color="text.secondary">
            {interpolate(t('frames_found'), { count: framesTotal.toLocaleString('fa-IR') })}
          </Typography>

          {selectedFrameIds.size > 0 && (
            <Button
              variant="contained"
              endIcon={<AddRounded />}
              onClick={() => void assignSelectedFrames()}
              disabled={assigning}
              sx={{ ...goldContainedSx, ...buttonWithLeftIconSx }}
            >
              {assigning ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                interpolate(t('add_selected_frames_count'), {
                  count: selectedFrameIds.size.toLocaleString('fa-IR'),
                })
              )}
            </Button>
          )}
        </Stack>

        {loadingFrames ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, minmax(0, 1fr))',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                xl: 'repeat(4, minmax(0, 1fr))',
              },
              gap: { xs: 1.25, md: 1.75 },
            }}
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 4,
                  overflow: 'hidden',
                  bgcolor: '#fff',
                }}
              >
                <Skeleton variant="rectangular" sx={{ aspectRatio: '1 / 1', height: 'auto' }} />
                <Box sx={{ p: 1.5 }}>
                  <Skeleton width="45%" />
                  <Skeleton width="75%" />
                  <Skeleton width="55%" />
                </Box>
              </Box>
            ))}
          </Box>
        ) : frames.length === 0 ? (
          <Box
            sx={{
              py: 8,
              textAlign: 'center',
              border: `1px dashed ${GOLD_BORDER}`,
              borderRadius: 3,
              bgcolor: GOLD_LIGHT,
            }}
          >
            <SearchRounded sx={{ fontSize: 42, color: GOLD, mb: 1 }} />
            <Typography fontWeight={900}>{t('no_frames_with_filters')}</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, minmax(0, 1fr))',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                xl: 'repeat(4, minmax(0, 1fr))',
              },
              gap: { xs: 1.25, md: 1.75 },
            }}
          >
            {frames.map((frame) => {
              const assignedFromFrameBundles = frame.bundles.some(
                (bundle) => bundle.deletedAt === null && bundle.tag.id === tagId,
              );
              const alreadyAssigned = assignedFrameIds.has(frame.id) || assignedFromFrameBundles;

              const otherAssignments = frame.bundles.filter(
                (bundle) => bundle.deletedAt === null && bundle.tag.id !== tagId,
              ).length;

              const selected = selectedFrameIds.has(frame.id);

              return (
                <FrameVisualCard
                  key={frame.id}
                  frame={frame}
                  categoryName={categoryNameById(frame.category, categories)}
                  genderName={genderNameById(frame.genderCategory, genderCategories)}
                  caratName={caratNameByValue(frame.carat, carats)}
                  bucketName={bucketNameById(frame.bucketId, buckets)}
                  selected={selected}
                  disabled={alreadyAssigned}
                  onOpen={() => setDetailsFrame(frame)}
                  onSelect={() => toggleFrameSelection(frame.id)}
                  statusLabel={
                    alreadyAssigned
                      ? t('in_this_collection')
                      : otherAssignments > 0
                        ? interpolate(t('in_other_collections'), {
                            count: otherAssignments.toLocaleString('fa-IR'),
                          })
                        : t('available_to_add')
                  }
                  statusTone={
                    alreadyAssigned ? 'success' : otherAssignments > 0 ? 'warning' : 'gold'
                  }
                />
              );
            })}
          </Box>
        )}

        <Box
          ref={sentinelRef}
          sx={{ minHeight: 90, display: 'grid', placeItems: 'center', mt: 1.5 }}
        >
          {loadingMore ? (
            <Stack alignItems="center" spacing={1}>
              <CircularProgress size={28} sx={{ color: GOLD }} />
              <Typography variant="caption" color="text.secondary">
                {t('loading_more_frames')}
              </Typography>
            </Stack>
          ) : currentPageRef.current < lastPageRef.current ? (
            <Stack alignItems="center" spacing={0.25} sx={{ color: 'text.secondary' }}>
              <KeyboardArrowDownRounded sx={{ color: GOLD }} />
              <Typography variant="caption">{t('scroll_for_more_frames')}</Typography>
            </Stack>
          ) : frames.length > 0 ? (
            <Typography variant="caption" color="text.secondary">
              {t('all_frames_loaded')}
            </Typography>
          ) : null}
        </Box>
      </Box>

      {selectedFrameIds.size > 0 && (
        <Box
          sx={{
            position: 'sticky',
            bottom: 16,
            zIndex: 10,
            mt: 2,
            mx: 'auto',
            width: 'fit-content',
            maxWidth: '100%',
            px: 1.25,
            py: 1,
            borderRadius: 99,
            bgcolor: 'background.paper',
            border: `1px solid ${GOLD_BORDER}`,
            boxShadow: '0 10px 30px rgba(47,38,15,.14)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" fontWeight={900} sx={{ px: 1 }}>
              {interpolate(t('selected_frames_count'), {
                count: selectedFrameIds.size.toLocaleString('fa-IR'),
              })}
            </Typography>
            <Button
              size="small"
              variant="contained"
              onClick={() => void assignSelectedFrames()}
              disabled={assigning}
              sx={goldContainedSx}
            >
              {assigning ? <CircularProgress size={18} color="inherit" /> : t('add_to_collection')}
            </Button>
          </Stack>
        </Box>
      )}

      <FrameDetailsDialog
        open={Boolean(detailsFrame)}
        frame={detailsFrame}
        onClose={() => setDetailsFrame(null)}
        bucketName={detailsFrame ? bucketNameById(detailsFrame.bucketId, buckets) : ''}
        categoryName={detailsFrame ? categoryNameById(detailsFrame.category, categories) : ''}
        genderName={
          detailsFrame ? genderNameById(detailsFrame.genderCategory, genderCategories) : ''
        }
        caratName={detailsFrame ? caratNameByValue(detailsFrame.carat, carats) : ''}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={deletingBundleId ? undefined : () => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={900}>{t('remove_frame_title')}</DialogTitle>
        <DialogContent>
          <Typography>
            {interpolate(t('remove_frame_confirm'), {
              frame: deleteTarget?.frame.model || t('without_model'),
              tag: tag.name,
            })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ gap: 1 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={Boolean(deletingBundleId)}
            color="inherit"
          >
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void confirmDeleteBundle()}
            disabled={Boolean(deletingBundleId)}
            sx={{ bgcolor: '#B84A4A', '&:hover': { bgcolor: '#963B3B' } }}
          >
            {deletingBundleId ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              t('remove_from_collection')
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notice.open}
        autoHideDuration={4000}
        onClose={() => setNotice((previous) => ({ ...previous, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          severity={notice.severity}
          variant="filled"
          onClose={() => setNotice((previous) => ({ ...previous, open: false }))}
        >
          {notice.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
