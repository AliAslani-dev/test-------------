'use client';

import * as React from 'react';
import theme from '@/styles/Theme';
import useText from '@/hooks/useText';
import { MAIN_COLOR } from '@/constants';
import { useLang } from '@/hooks/LanContext';
import { useTheme } from '@mui/material/styles';
import type { FramesByBucketDTO } from '@/api/frame/dto';
import WcRoundedIcon from '@mui/icons-material/WcRounded';
import ScaleRoundedIcon from '@mui/icons-material/ScaleRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import VerticalAlignTopRoundedIcon from '@mui/icons-material/VerticalAlignTopRounded';
import VerticalAlignBottomRoundedIcon from '@mui/icons-material/VerticalAlignBottomRounded';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination as SwiperPagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

type FrameInfoBannerProps = {
  frame: FramesByBucketDTO | null | undefined;
  loading?: boolean;

  categoryName?: string | null;
  genderCategoryName?: string | null;

  categoryMap?: Record<number, string>;
  genderCategoryMap?: Record<number, string>;
};

const GLASS_PAPER_SX = {
  borderRadius: 4,
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'rgba(255,255,255,0.10)',
  backdropFilter: 'blur(22px) saturate(180%)',
  WebkitBackdropFilter: 'blur(22px) saturate(180%)',
  border: `3px solid rgb(244, 244, 244)`,
  '&:before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background: 'white',
    opacity: 0.9,
  },

  '&:after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background:
      'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, rgba(255,255,255,0.00) 2px, rgba(255,255,255,0.00) 6px)',
    opacity: 0.25,
    mixBlendMode: 'overlay' as const,
  },
};

const GLASS_CARD_SX = {
  border: '1px solid rgba(255,255,255,0.28)',
  backgroundColor: 'rgba(255,255,255,0.12)',
  backdropFilter: 'blur(14px) saturate(160%)',
  WebkitBackdropFilter: 'blur(14px) saturate(160%)',
  boxShadow: '0 0 16px rgba(0,0,0,0.06)',
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <Box
    sx={{
      p: 1.25,
      borderRadius: 2.75,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      minWidth: 0,
      ...GLASS_CARD_SX,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', color: MAIN_COLOR, opacity: 0.95 }}>
      {icon}
    </Box>

    <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <Typography sx={{ fontSize: { xs: 11.5, lg: 12.5 }, opacity: 0.72, lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: { xs: 13.5, lg: 14.5 }, fontWeight: 800, whiteSpace: 'nowrap' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const StatSkeleton = () => (
  <Box
    sx={{
      p: 1.25,
      borderRadius: 2.75,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      minWidth: 0,
      ...GLASS_CARD_SX,
    }}
  >
    <Skeleton variant="circular" width={18} height={18} />
    <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
      <Skeleton variant="text" width="65%" sx={{ fontSize: 12 }} />
      <Skeleton variant="text" width="45%" sx={{ fontSize: 14 }} />
    </Box>
  </Box>
);

function SquareCarousel({ images }: { images: string[] }) {
  const { lang } = useLang();
  const { t } = useText('product', lang);

  const safe = React.useMemo(() => (images ?? []).filter(Boolean), [images]);
  const has = safe.length > 0;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        borderRadius: 4,
        overflow: 'hidden',
        aspectRatio: '1 / 1',
        border: '1px solid rgba(255,255,255,0.30)',
        backgroundColor: 'rgba(255,255,255,0.10)',
        backdropFilter: 'blur(10px) saturate(150%)',
        WebkitBackdropFilter: 'blur(10px) saturate(150%)',
        boxShadow: '0 0 24px rgba(0,0,0,0.10)',
        '& .swiper': { width: '100%', height: '100%' },
        '& .swiper-pagination-bullet-active': {
          backgroundColor: '#9C7A2B',
          opacity: 1,
          width: '20px',
          borderRadius: '4px',
        },
      }}
    >
      {has ? (
        <>
          <Swiper
            modules={[SwiperPagination, Navigation]}
            pagination={{ clickable: true }}
            navigation={{ nextEl: '.swiper-custom-next', prevEl: '.swiper-custom-prev' }}
            loop={safe.length > 1}
          >
            {safe.map((src: string, idx: number) => (
              <SwiperSlide
                key={idx}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Image
                    src={src}
                    alt={`Frame Image ${idx + 1}`}
                    fill
                    sizes="(max-width: 900px) 100vw, 380px"
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>

          {safe.length > 1 && (
            <>
              <Box
                className="swiper-custom-prev"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: 8,
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
                className="swiper-custom-next"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 8,
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
          )}
        </>
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            opacity: 0.6,
            fontSize: 13,
          }}
        >
          {t('frame_info.image_doesnt_attached')}
        </Box>
      )}
    </Box>
  );
}

const SquareCarouselSkeleton = () => (
  <Box
    sx={{
      width: '100%',
      aspectRatio: '1 / 1',
      borderRadius: 4,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.30)',
      backgroundColor: 'rgba(255,255,255,0.10)',
      backdropFilter: 'blur(10px) saturate(150%)',
      WebkitBackdropFilter: 'blur(10px) saturate(150%)',
      boxShadow: '0 0 24px rgba(0,0,0,0.10)',
    }}
  >
    <Skeleton variant="rectangular" width="100%" height="100%" />
  </Box>
);

export default function FrameInfoBanner({
  frame,
  loading = false,
  categoryName,
  genderCategoryName,
  categoryMap,
  genderCategoryMap,
}: FrameInfoBannerProps) {
  const { lang } = useLang();
  const { t } = useText('product', lang);
  const [showAll, setShowAll] = React.useState(false);
  useMediaQuery(theme.breakpoints.up('md'));

  const additionalEntries = React.useMemo(() => {
    if (!frame?.additionalFields) return [];
    return Object.entries(frame.additionalFields).filter(([, v]) => String(v ?? '').trim() !== '');
  }, [frame?.additionalFields]);

  const showEntries = React.useMemo(() => {
    return showAll ? additionalEntries : additionalEntries.slice(0, 6);
  }, [showAll, additionalEntries]);

  const resolvedCategory = React.useMemo(() => {
    if (!frame) return null;
    if (categoryName) return categoryName;
    const id = frame.category;
    if (id == null) return null;
    return categoryMap?.[id] ?? String(id);
  }, [frame, categoryName, categoryMap]);

  const resolvedGender = React.useMemo(() => {
    if (!frame) return null;
    if (genderCategoryName) return genderCategoryName;
    const id = frame.genderCategory;
    if (id == null) return null;
    return genderCategoryMap?.[id] ?? String(id);
  }, [frame, genderCategoryName, genderCategoryMap]);

  if (!loading && !frame) return null;

  const glassChipSx = {
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.34)',
    backgroundColor: 'rgba(255,255,255,0.14)',
    backdropFilter: 'blur(14px) saturate(160%)',
    WebkitBackdropFilter: 'blur(14px) saturate(160%)',
    boxShadow: '0 0 14px rgba(0,0,0,0.06)',
    fontWeight: 900,
    color: '#1a1a1a',
    '& .MuiChip-icon': { color: MAIN_COLOR },
    pl: 0.5,
    pr: 2,
  } as const;

  const renderSkeleton = () => (
    <Paper
      elevation={0}
      sx={{
        mt: 1.25,
        mb: 2,
        p: { xs: 1.25, sm: 1.75, md: 2 },
        ...GLASS_PAPER_SX,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateAreas: {
            xs: `
              "carousel"
              "header"
              "details"
            `,
            sm: `
              "header header"
              "details carousel"
            `,
            md: `
              "header carousel"
              "details carousel"
            `,
          },
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 2fr',
            md: 'minmax(0,1fr) 300px',
            lg: 'minmax(0,1fr) 340px',
          },
          gap: { xs: 1.25, sm: 1.5, md: 2, lg: 2.25 },
          alignItems: 'start',
        }}
      >
        <Box sx={{ gridArea: 'header', minWidth: 0 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Skeleton variant="text" width="55%" sx={{ fontSize: { xs: 18, lg: 22 } }} />
            </Box>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              gap={{ xs: 1, md: 1 }}
              flexWrap="wrap"
              justifyContent="flex-end"
              sx={{ minWidth: 140 }}
            >
              <Skeleton variant="rounded" width={120} height={30} />
              <Skeleton variant="rounded" width={120} height={30} />
            </Stack>
          </Stack>

          <Divider sx={{ mt: 1.5, mb: 0, opacity: 0.25 }} />
        </Box>

        <Box sx={{ gridArea: 'carousel', minWidth: 0, width: '100%' }}>
          <SquareCarouselSkeleton />
        </Box>

        <Box sx={{ gridArea: 'details', minWidth: 0 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr 1fr',
                sm: '1fr',
                md: '1fr 1fr',
                lg: '1fr 1fr 1fr',
              },
              gap: 1,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <StatSkeleton key={i} />
            ))}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Skeleton variant="text" width="25%" sx={{ fontSize: { xs: 13, lg: 14 } }} />
            <Box
              sx={{
                mt: 1,
                borderRadius: 3,
                overflow: 'hidden',
                ...GLASS_CARD_SX,
              }}
            >
              {Array.from({ length: 4 }).map((_, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '140px 1fr',
                      sm: '1fr',
                      md: '140px 1fr',
                      lg: '180px 1fr',
                    },
                    gap: { xs: 1, sm: 0.5, md: 1 },
                    px: 1.25,
                    py: 1,
                    borderTop: idx === 0 ? 'none' : '1px solid rgba(255,255,255,0.18)',
                    alignItems: 'center',
                  }}
                >
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="80%" />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );

  if (loading) return renderSkeleton();
  if (!frame) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 1.25,
        mb: 2,
        p: { xs: 1.25, sm: 1.75, md: 2 },
        ...GLASS_PAPER_SX,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateAreas: {
            xs: `
              "carousel"
              "header"
              "details"
            `,
            sm: `
              "header header"
              "details carousel"
            `,
            md: `
              "header carousel"
              "details carousel"
            `,
          },
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 2fr',
            md: 'minmax(0,1fr) 300px',
            lg: 'minmax(0,1fr) 340px',
          },
          gap: { xs: 1.25, sm: 1.5, md: 2, lg: 2.25 },
          alignItems: 'start',
        }}
      >
        <Box sx={{ gridArea: 'header', minWidth: 0 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: { xs: 16, sm: 18, md: 20, lg: 22 },
                  fontWeight: 950,
                  lineHeight: 1.4,
                }}
              >
                {frame.model}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              gap={{ xs: 1, md: 1 }}
              flexWrap="wrap"
              justifyContent="flex-end"
            >
              <Chip
                icon={<CategoryRoundedIcon />}
                label={resolvedCategory ?? '—'}
                size="small"
                sx={glassChipSx}
              />
              <Chip
                icon={<WcRoundedIcon />}
                label={resolvedGender ?? '—'}
                size="small"
                sx={glassChipSx}
              />
              {frame.archived && (
                <Chip
                  label={t('frame_info.archived')}
                  size="small"
                  sx={{
                    ...glassChipSx,
                    border: '1px solid rgba(255, 193, 7, 0.35)',
                    backgroundColor: 'rgba(255, 193, 7, 0.12)',
                    '& .MuiChip-icon': { color: '#ff9800' },
                  }}
                />
              )}
            </Stack>
          </Stack>

          <Divider sx={{ mt: 1.5, mb: 0, opacity: 0.25 }} />
        </Box>

        <Box sx={{ gridArea: 'carousel', minWidth: 0, width: '100%' }}>
          <SquareCarousel images={frame.covers ?? []} />
        </Box>

        <Box sx={{ gridArea: 'details', minWidth: 0 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr 1fr',
                sm: '1fr',
                md: '1fr 1fr',
                lg: '1fr 1fr 1fr',
              },
              gap: 1,
            }}
          >
            <Stat
              icon={<VerticalAlignBottomRoundedIcon fontSize="small" />}
              label={t('frame_info.min_weight')}
              value={frame.minWeight ? `${frame.minWeight} ${t('frame_info.gram')}` : '—'}
            />
            <Stat
              icon={<VerticalAlignTopRoundedIcon fontSize="small" />}
              label={t('frame_info.max_weight')}
              value={frame.maxWeight ? `${frame.maxWeight} ${t('frame_info.gram')}` : '—'}
            />
            <Stat
              icon={<ScaleRoundedIcon fontSize="small" />}
              label={t('frame_info.total_weight')}
              value={frame.totalWeight ? `${frame.totalWeight} ${t('frame_info.gram')}` : '—'}
            />
            <Stat
              icon={<PercentRoundedIcon fontSize="small" />}
              label={t('frame_info.wage')}
              value={frame.wage || '—'}
            />
            <Stat
              icon={<PercentRoundedIcon fontSize="small" />}
              label={t('frame_info.profit')}
              value={frame.profit || '—'}
            />
            <Stat
              icon={<PercentRoundedIcon fontSize="small" />}
              label={t('frame_info.discount')}
              value={frame.discount || '—'}
            />
          </Box>

          {additionalEntries.length > 0 && (
            <>
              <Typography
                sx={{
                  mt: 2,
                  mb: 1,
                  fontSize: { xs: 13, lg: 14 },
                  fontWeight: 950,
                  color: MAIN_COLOR,
                  opacity: 0.95,
                }}
              >
                {t('frame_info.additional_fields')}
              </Typography>

              <Box sx={{ borderRadius: 3, overflow: 'hidden', ...GLASS_CARD_SX }}>
                {showEntries.map(([k, v], idx) => (
                  <Box
                    key={k}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '140px 1fr',
                        sm: '1fr',
                        md: '140px 1fr',
                        lg: '180px 1fr',
                      },
                      gap: { xs: 1, sm: 0.5, md: 1 },
                      px: 1.25,
                      py: 1,
                      borderTop: idx === 0 ? 'none' : '1px solid rgba(255,255,255,0.18)',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      sx={{ fontSize: { xs: 12.5, lg: 13.5 }, fontWeight: 950, opacity: 0.82 }}
                    >
                      {k}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: 12.5, lg: 13.5 },
                        fontWeight: 850,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={String(v)}
                    >
                      {String(v)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {additionalEntries.length > 6 && (
                <Box sx={{ mt: 1 }}>
                  <Chip
                    clickable
                    onClick={() => setShowAll((s) => !s)}
                    label={showAll ? t('frame_info.show_less') : t('frame_info.show_more')}
                    size="small"
                    sx={{
                      ...glassChipSx,
                      color: MAIN_COLOR,
                      border: `1px solid rgba(156,122,43,0.35)`,
                      backgroundColor: 'rgba(156,122,43,0.10)',
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
