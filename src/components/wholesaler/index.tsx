'use client';

import { CategoryDTO } from '@/api/admin/category/dto';
import { ProductCaratDTO, ProductGenderCategoryDTO } from '@/api/product/dto';
import { getProductCarats } from '@/api/product/service';
import { FrameDTO, WholesalerDTO } from '@/api/zarhub/dto';
import { getWholesalerFrames, getWholesalers } from '@/api/zarhub/service';
import { useLang } from '@/hooks/LanContext';
import { getCategories } from '@/api/admin/category/service';
import { getFrameGenderCategories } from '@/api/frame/service';
import { FramesByBucketDTO } from '@/api/frame/dto';
import useText from '@/hooks/useText';
import { tPD } from '@/utils';
import { useDashboardContext } from '../../../contexts/DashboardContext';
import { useRouter } from 'next/navigation';
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import FrameCard from './FrameCard';
import FrameCardSkeleton from './FrameCardSkeleton';

const PAGE_SIZE = 8;

interface WholesalersTabProps {
  wholesalerId: number | null;
}

const WholesalerTab: FunctionComponent<WholesalersTabProps> = ({ wholesalerId }) => {
  if (wholesalerId === null) return <></>;

   const { lang } = useLang();
   const { t } = useText('wholesaler', lang);
  const { userId } = useDashboardContext();
  const router = useRouter();
  // --- Data States ---
  const [provider, setProvider] = useState<WholesalerDTO | undefined>(undefined);
  const [frames, setFrames] = useState<FramesByBucketDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [genders, setGenders] = useState<ProductGenderCategoryDTO[]>([]);
  const [carats, setCarats] = useState<ProductCaratDTO[]>([]);

  // --- UI States ---
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isFakeLoading, setIsFakeLoading] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // --- Helper Functions ---
  const getCategoryName = (id: number | null) => categories.find((c) => c.id === id)?.faName || '';
  const getGenderName = (id: number | null) => genders.find((g) => g.id === id)?.faName || '';
  const getCaratName = (id: string | null) => carats.find((g) => g.value === id)?.amount || '';

  // --- Click Routing Logic ---
  const handleFrameCardClick = (frameId: number) => {
    router.push(`/dashboard/wholesalers/${wholesalerId}/${frameId}`);
  };

  // --- 1. Initial Data Fetching ---
  useEffect(() => {
    async function initFetch() {
      try {
        if (userId && wholesalerId) {
          const [wRes, fRes, cRes, gRes, crRes] = await Promise.all([
            getWholesalers(),
            getWholesalerFrames(wholesalerId),
            getCategories(),
            getFrameGenderCategories(),
            getProductCarats(),
          ]);
          const providerData = wRes?.find((p) => p.id === wholesalerId);
          if (providerData) setProvider(providerData);
          setFrames((fRes ?? []) as unknown as FramesByBucketDTO[]);
          setCategories(cRes || []);
          setGenders(gRes || []);
          setCarats(crRes || []);
        }
      } catch (error) {
        console.error('Error fetching vitrine data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    }
    initFetch();
  }, [wholesalerId, userId]);

  // --- 2. Fake Lazy Loading Logic ---
  const loadMore = useCallback(() => {
    if (visibleCount < frames.length && !isFakeLoading && !isInitialLoading) {
      setIsFakeLoading(true);
      setTimeout(() => {
        setVisibleCount((prev) => prev + PAGE_SIZE);
        setIsFakeLoading(false);
      }, 600);
    }
  }, [visibleCount, frames.length, isFakeLoading, isInitialLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <Box dir="rtl" sx={{ bgcolor: '#f2f3f6', minHeight: '100vh', pb: 10, overflow: 'hidden' }}>
      {/* Hero Showcase Section */}
      <Box
        sx={{
          height: { xs: '320px', sm: '480px', md: '600px' },
          width: '100%',
          position: 'relative',
          backgroundImage:
            isInitialLoading || !provider?.showcase
              ? 'none'
              : `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${provider.showcase})`,
          bgcolor: isInitialLoading ? '#dcdcdc' : 'transparent',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          mb: { xs: -12, lg: -14 },
        }}
      >
        {isInitialLoading || !provider ? (
          <Skeleton
            variant="text"
            width="40%"
            sx={{
              fontSize: { xs: '2.2rem', sm: '3.5rem', md: '4.8rem' },
              bgcolor: 'rgba(255,255,255,0.15)',
            }}
          />
        ) : (
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              textAlign: 'center',
              fontSize: { xs: '2.2rem', sm: '3.5rem', md: '4.8rem' },
              textShadow: '0 4px 25px rgba(0,0,0,0.5)',
            }}
          >
            {provider.bucketName}
          </Typography>
        )}
      </Box>

      <Container maxWidth="lg">
        {/* Wholesaler Information Card */}
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 8,
            p: { xs: 3, lg: 6 },
            boxShadow: '0 30px 60px rgba(0,0,0,0.06)',
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: { xs: 'center', lg: 'flex-start' },
            gap: { xs: 4, lg: 6 },
          }}
        >
          {isInitialLoading || !provider ? (
            <Skeleton
              variant="circular"
              sx={{
                width: { xs: 120, lg: 180 },
                height: { xs: 120, lg: 180 },
                alignSelf: 'center',
              }}
            />
          ) : (
            <Avatar
              src={provider.logo}
              sx={{
                width: { xs: 120, lg: 180 },
                height: { xs: 120, lg: 180 },
                border: '8px solid #fff',
                boxShadow: '0 15px 35px rgba(0,0,0,0.12)',
                alignSelf: 'center',
              }}
            />
          )}

          <Box sx={{ flex: 1, width: '100%', textAlign: { xs: 'center', lg: 'right' } }}>
            {isInitialLoading || !provider ? (
              <Stack
                spacing={2}
                sx={{ width: '100%', alignItems: { xs: 'center', lg: 'flex-start' } }}
              >
                <Skeleton variant="text" width="60%" height={40} />
                <Skeleton variant="text" width="40%" height={25} />
                <Box sx={{ width: '100%', pt: 1 }}>
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="95%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
                <Skeleton variant="text" width="30%" height={20} sx={{ mt: 1 }} />
              </Stack>
            ) : (
              <>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    color: '#1a1a1a',
                    fontSize: { xs: '1.8rem', lg: '2.8rem' },
                    mb: 1,
                  }}
                >
                  {provider.bucketName}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#b8860b',
                    fontWeight: 600,
                    fontSize: { xs: '1.1rem', lg: '1.4rem' },
                    mb: 2.5,
                  }}
                >
                  {t('management')}: {provider.fullName}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#555',
                    lineHeight: 1.8,
                    mb: 3,
                    textAlign: { xs: 'center', lg: 'justify' },
                    fontSize: { xs: '0.9rem', lg: '1.05rem' },
                  }}
                >
                  {provider.description}
                </Typography>
                <Typography variant="body2" sx={{ color: '#888', fontWeight: 500 }}>
                  📍 {provider.address}
                </Typography>
              </>
            )}
          </Box>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: 'none', lg: 'block' }, opacity: 0.5 }}
          />

          <Stack
            direction="column"
            alignItems="center"
            spacing={4}
            sx={{ minWidth: { lg: '240px' }, width: { xs: '100%', lg: 'auto' } }}
          >
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography
                variant="caption"
                sx={{ color: '#aaa', fontWeight: 700, display: 'block', mb: 0.5 }}
              >
                {t('call_serller')}
              </Typography>
              {isInitialLoading || !provider ? (
                <Skeleton variant="text" width={120} height={35} sx={{ mx: 'auto' }} />
              ) : (
                <Typography
                  variant="h5"
                  sx={{ dir: 'ltr', fontWeight: 900, color: '#b8860b', letterSpacing: 1.5 }}
                >
                  {tPD(provider.sellerMobile)}
                </Typography>
              )}
            </Box>
          </Stack>
        </Box>

        {/* Product Showcase Section */}
        {(isInitialLoading || frames.length > 0) && (
          <Box sx={{ mt: 15 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.4rem', md: '2rem' },
                mb: 6,
                textAlign: 'center',
              }}
            >
              {t('products_vitrin')}
            </Typography>

            <Grid container spacing={{ xs: 2, md: 4 }}>
              {isInitialLoading ? (
                Array.from(new Array(4)).map((_, i) => (
                  <Grid key={`init-skel-${i}`} size={{ xs: 6, sm: 6, md: 3 }}>
                    <FrameCardSkeleton />
                  </Grid>
                ))
              ) : (
                <>
                  {/* Real Frames */}
                  {frames.slice(0, visibleCount).map((frame, index) => (
                    <Grid key={index} size={{ xs: 6, sm: 6, md: 4, lg: 3 }}>
                      <FrameCard
                        frame={frame as unknown as FrameDTO}
                        categoryName={getCategoryName(frame.category)}
                        genderName={getGenderName(frame.genderCategory)}
                        caratName={getCaratName(frame.carat)}
                        onClick={() => handleFrameCardClick(frame.id)}
                      />
                    </Grid>
                  ))}

                  {/* Fake Lazy Loading Skeletons */}
                  {isFakeLoading &&
                    Array.from(new Array(4)).map((_, index) => (
                      <Grid key={`lazy-skel-${index}`} size={{ xs: 6, sm: 6, md: 4, lg: 3 }}>
                        <FrameCardSkeleton />
                      </Grid>
                    ))}
                </>
              )}
            </Grid>

            {/* Intersection Sentinel */}
            {!isInitialLoading && <Box ref={loaderRef} sx={{ height: '50px', mt: 4 }} />}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default WholesalerTab;
