'use client';

import { alpha, Box, Card, CardActionArea, Chip, Stack, Typography, useTheme } from '@mui/material';

import Image from 'next/image';

import { useEffect, useState } from 'react';

import useText from '@/hooks/useText';

// import { IS_PRODUCTION } from '@/config/global';

import type { ModifiedWholesalerDTO } from './types';

const trim = (value?: string | null) => (value ?? '').trim();

function toWholesalerUrl(wholesalerId: number) {
  return `/dashboard/wholesalers/${wholesalerId}`;
}

function LogoBadge({ src, title }: { src?: string | null; title: string }) {
  const source = trim(src);

  const [fit, setFit] = useState<'byWidth' | 'byHeight'>('byWidth');

  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
    setFit('byWidth');
  }, [source]);

  if (!source || broken) {
    return (
      <Typography
        sx={{
          fontWeight: 800,
          color: 'rgba(0,0,0,0.7)',
        }}
      >
        {title?.trim()?.[0] ?? '•'}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',

        display: 'flex',

        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        src={source}
        alt={`لوگوی ${title}`}
        width={46}
        height={46}
        sizes="46px"
        unoptimized
        onLoadingComplete={(img) => {
          const width = (img as HTMLImageElement).naturalWidth || 1;

          const height = (img as HTMLImageElement).naturalHeight || 1;

          setFit(width >= height ? 'byWidth' : 'byHeight');
        }}
        onError={() => {
          setBroken(true);
        }}
        style={{
          width: fit === 'byWidth' ? '100%' : 'auto',

          height: fit === 'byHeight' ? '100%' : 'auto',

          maxWidth: '100%',
          maxHeight: '100%',

          objectFit: 'contain',

          display: 'block',
        }}
      />
    </Box>
  );
}

interface WholesalerCardProps {
  row: ModifiedWholesalerDTO;
}

export default function WholesalerCard({ row }: WholesalerCardProps) {
  const theme = useTheme();

  const { t } = useText('wholesalers');

  const title = trim(row.bucketName) || t('without_title');

  const province = trim(row.province);
  const cityName = trim(row.city);
  const address = trim(row.address);
  const logo = trim(row.logo);
  const showcase = trim(row.showcase);

  const href = toWholesalerUrl(row.id);

  const [showcaseBroken, setShowcaseBroken] = useState(false);

  useEffect(() => {
    setShowcaseBroken(false);
  }, [showcase]);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 5,

        overflow: 'hidden',

        border: `1px solid ${alpha(theme.palette.common.black, 0.08)}`,

        bgcolor: '#fff',

        transition: 'transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease',

        '&:hover': {
          transform: 'translateY(-2px)',

          borderColor: alpha(theme.palette.common.black, 0.14),

          boxShadow: `0 18px 30px ${alpha(theme.palette.common.black, 0.12)}`,
        },

        '@media (hover: none)': {
          '&:hover': {
            transform: 'none',

            boxShadow: 'none',

            borderColor: alpha(theme.palette.common.black, 0.08),
          },
        },
      }}
    >
      <CardActionArea
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'block',
        }}
        aria-label={`${t('enter_to_wholesaler')} ${title}`}
      >
        <Box
          sx={{
            position: 'relative',

            width: '100%',

            aspectRatio: '4 / 3',

            bgcolor: alpha(theme.palette.common.black, 0.03),
          }}
        >
          {showcase && !showcaseBroken ? (
            <Image
              src={showcase}
              alt={`${t('wholesaler_showcase')} ${title}`}
              fill
              sizes="(max-width:600px) 100vw, (max-width:1200px) 50vw, 366px"
              style={{
                objectFit: 'cover',
              }}
              onError={() => {
                setShowcaseBroken(true);
              }}
              unoptimized
            />
          ) : null}

          <Box
            sx={{
              pointerEvents: 'none',

              position: 'absolute',

              inset: 0,

              background: 'linear-gradient(180deg, rgba(0,0,0,0.00) 35%, rgba(0,0,0,0.65) 100%)',
            }}
          />

          <Box
            sx={{
              position: 'absolute',

              top: 14,
              left: 14,

              width: 46,
              height: 46,

              borderRadius: 999,

              overflow: 'hidden',

              border: `1px solid ${alpha(theme.palette.common.white, 0.55)}`,

              bgcolor: alpha(theme.palette.common.white, 0.85),

              display: 'grid',

              placeItems: 'center',

              boxShadow: `0 10px 26px ${alpha(theme.palette.common.black, 0.25)}`,
            }}
          >
            <LogoBadge src={logo} title={title} />
          </Box>

          <Box
            sx={{
              position: 'absolute',

              left: 14,
              right: 14,
              bottom: 12,

              color: '#fff',

              display: 'flex',

              flexDirection: 'column',

              gap: '4px',
            }}
          >
            <Typography
              component="h3"
              noWrap
              title={title}
              sx={{
                fontWeight: 900,

                fontSize: {
                  xs: 16,
                  md: 18,
                },

                lineHeight: 1.25,

                textShadow: '0 0 2px rgba(0,0,0,0.8)',

                mb: 0.6,
              }}
            >
              {title}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{
                rowGap: 0.8,
              }}
            >
              {province ? (
                <Chip
                  size="small"
                  label={province}
                  sx={{
                    bgcolor: alpha('#fff', 0.18),

                    color: '#fff',

                    border: `1px solid ${alpha('#fff', 0.22)}`,

                    fontWeight: 700,
                  }}
                />
              ) : null}

              {cityName ? (
                <Chip
                  size="small"
                  label={cityName}
                  sx={{
                    bgcolor: alpha('#fff', 0.14),

                    color: '#fff',

                    border: `1px solid ${alpha('#fff', 0.18)}`,

                    fontWeight: 700,
                  }}
                />
              ) : null}
            </Stack>
          </Box>
        </Box>

        <Box
          sx={{
            p: 2.2,
          }}
        >
          <Typography
            title={address}
            sx={{
              color: alpha(theme.palette.common.black, 0.72),

              fontSize: 13,

              lineHeight: 1.7,

              minHeight: 44,

              display: '-webkit-box',

              WebkitLineClamp: 2,

              WebkitBoxOrient: 'vertical',

              overflow: 'hidden',
            }}
          >
            {address || '—'}
          </Typography>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              mt: 1.4,
            }}
          >
            <Typography
              sx={{
                fontSize: 12,

                color: alpha(theme.palette.common.black, 0.5),
              }}
            >
              {t('click_for_see')}
            </Typography>

            <Box
              sx={{
                px: 1.2,
                py: 0.6,

                borderRadius: 999,

                bgcolor: alpha(row.approved ? 'rgb(0, 85, 0)' : theme.palette.primary.main, 0.08),

                color: row.approved ? 'rgb(0, 85, 0)' : theme.palette.primary.main,

                fontWeight: 800,

                fontSize: 12,
              }}
            >
              {t('enter')}
            </Box>
          </Stack>
        </Box>
      </CardActionArea>
    </Card>
  );
}
