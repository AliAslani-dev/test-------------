'use client';

import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getUsers } from '@/api/admin/user/service';
import { getBucket } from '@/api/bucket/service';
import CustomTextField from '../shared/custom-text-field';

import useText from '@/hooks/useText';

import { persianToEnglishNumber, tPD } from '@/utils';

import WholesalerCard from './WholesalerCard';

import WholesalerCardSkeleton from './WholesalerCardSkeleton';

import type { ModifiedWholesalerDTO, WholesalerMode } from './types';

interface WholesalersContentProps {
  mode: WholesalerMode;
}

const trim = (value?: string | null) => (value ?? '').trim();

function normalizeSearchText(value: string) {
  return persianToEnglishNumber(trim(value)).toLowerCase();
}

export default function WholesalersContent({ mode }: WholesalersContentProps) {
  const { t } = useText('wholesalers');

  const theme = useTheme();

  const isXs = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true,
  });

  const isMdDown = useMediaQuery(theme.breakpoints.down('md'), {
    noSsr: true,
  });

  const INITIAL = isXs ? 4 : isMdDown ? 6 : 9;

  const STEP = isXs ? 4 : isMdDown ? 6 : 9;

  const [rows, setRows] = useState<ModifiedWholesalerDTO[]>([]);

  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');

  const [visibleCount, setVisibleCount] = useState(INITIAL);

  const [loadingMore, setLoadingMore] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMoreTimerRef = useRef<number | null>(null);

  /*
   * We intentionally do NOT use
   * inFlightRef/fetchedRef here.
   *
   * Those refs can cause an infinite
   * loading state in React Strict Mode.
   */

  const convertRawToDto = useCallback((rawList: any[]): ModifiedWholesalerDTO[] => {
    return (rawList ?? []).map((row: any) => ({
      id: row.id,

      approved: Boolean(row.approved),

      bucketName: row.bucketName ?? '',

      address: row.address ?? '',

      logo: row.logo ?? '',

      province: row.province ?? '',

      city: row.city ?? '',

      showcase: row.showcase ?? '',

      domain: row.domain ?? '',
    }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadWholesalers = async () => {
      setLoading(true);

      try {
        const result = await getUsers();

        if (cancelled) {
          return;
        }

        const safeResult = Array.isArray(result) ? result : [];

        setRows(convertRawToDto(safeResult));
      } catch (error) {
        console.error('Getting wholesalers failed.', error);

        if (!cancelled) {
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadWholesalers();

    return () => {
      cancelled = true;
    };
  }, [convertRawToDto]);

  useEffect(() => {
    return () => {
      if (loadMoreTimerRef.current) {
        window.clearTimeout(loadMoreTimerRef.current);

        loadMoreTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setVisibleCount(INITIAL);

    setLoadingMore(false);

    if (loadMoreTimerRef.current) {
      window.clearTimeout(loadMoreTimerRef.current);

      loadMoreTimerRef.current = null;
    }
  }, [INITIAL, mode, query]);

  const filteredWholesalers = useMemo(() => {
    let result = rows;

    if (mode === 'approved') {
      result = result.filter((item) => item.approved);
    }

    const normalizedQuery = normalizeSearchText(query);

    if (!normalizedQuery) {
      return result;
    }

    return result.filter((item) => {
      const haystack = normalizeSearchText(
        [item.bucketName, item.address, item.province, item.city, item.domain].join(' | '),
      );

      return haystack.includes(normalizedQuery);
    });
  }, [mode, query, rows]);

  const visibleWholesalers = useMemo(
    () => filteredWholesalers.slice(0, visibleCount),
    [filteredWholesalers, visibleCount],
  );

  const hasMore = visibleCount < filteredWholesalers.length;

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) {
      return;
    }

    if (loadMoreTimerRef.current) {
      return;
    }

    setLoadingMore(true);

    loadMoreTimerRef.current = window.setTimeout(() => {
      setVisibleCount((current) => Math.min(current + STEP, filteredWholesalers.length));

      setLoadingMore(false);

      loadMoreTimerRef.current = null;
    }, 200);
  }, [STEP, filteredWholesalers.length, hasMore, loading, loadingMore]);

  useEffect(() => {
    const element = sentinelRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);

        if (isVisible) {
          loadMore();
        }
      },
      {
        root: null,

        rootMargin: '300px 0px 600px 0px',

        threshold: 0.01,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [loadMore]);

  /* ---------------------------------------------------------------------- */
  /*                              Skeletons                                 */
  /* ---------------------------------------------------------------------- */

  const initialSkeletons = useMemo(
    () =>
      Array.from(
        {
          length: INITIAL,
        },
        (_, index) => index,
      ),
    [INITIAL],
  );

  const moreSkeletons = useMemo(
    () =>
      Array.from(
        {
          length: Math.min(STEP, 6),
        },
        (_, index) => index,
      ),
    [STEP],
  );

  return (
    <>
      <Box
        sx={{
          width: {
            xs: '100%',
            lg: '1000px',
          },

          display: 'flex',

          flexDirection: 'column',

          gap: 3,

          minWidth: 0,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography
            sx={{
              fontWeight: 800,

              color: 'rgba(0,0,0,0.55)',

              fontSize: {
                xs: 12,
                md: 13,
              },
            }}
          >
            {mode === 'approved' ? t('approved') : t('wholesalers')}
          </Typography>

          {!loading ? (
            <Typography
              sx={{
                fontSize: 12,

                color: 'rgba(0,0,0,0.55)',
              }}
            >
              {tPD(filteredWholesalers.length)} {t('results')}
            </Typography>
          ) : null}
        </Stack>

        <CustomTextField
          id="wholesaler-search"
          title=""
          value={query}
          setValue={setQuery}
          placeholder={t('search_field_placeholder')}
        />
      </Box>

      <Box
        sx={{
          width: {
            xs: '100%',
            sm: '100%',
            md: '100%',
            lg: '1000px',
          },

          display: 'grid',

          gap: {
            xs: 2,
            md: 2.5,
          },

          gridTemplateColumns: {
            xs: '1fr',

            sm: 'repeat(2, minmax(0, 1fr))',

            md: 'repeat(2, minmax(0, 1fr))',

            lg: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        {loading
          ? initialSkeletons.map((index) => <WholesalerCardSkeleton key={`initial-${index}`} />)
          : visibleWholesalers.map((row, index) => (
              <WholesalerCard
                key={trim(row.domain) || trim(row.bucketName) || String(index)}
                row={row}
              />
            ))}

        {!loading && loadingMore
          ? moreSkeletons.map((index) => <WholesalerCardSkeleton key={`more-${index}`} />)
          : null}
      </Box>

      {!loading && filteredWholesalers.length === 0 ? (
        <Box
          sx={{
            width: {
              xs: '100%',
              lg: '1000px',
            },

            py: 6,

            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              color: 'rgba(0,0,0,0.45)',

              fontWeight: 600,

              fontSize: 13,
            }}
          >
            نتیجه‌ای برای نمایش وجود ندارد
          </Typography>
        </Box>
      ) : null}

      {!loading && hasMore ? (
        <Box
          ref={sentinelRef}
          sx={{
            width: {
              xs: '100%',
              lg: '1000px',
            },

            height: 24,
          }}
        />
      ) : null}
    </>
  );
}
