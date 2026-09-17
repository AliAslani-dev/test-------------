'use client';

import {
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import Image from 'next/image';

import { useEffect, useState } from 'react';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import type { FrameDTO } from '@/api/zarhub/dto';

import useText from '@/hooks/useText';

import { tPD } from '@/utils';

interface FrameCardProps {
  frame: FrameDTO;

  categoryName: string;

  genderName?: string;

  caratName?: string;

  onClick: () => void;
}

function hasValue(value: unknown) {
  return value !== undefined && value !== null && value !== '';
}

export default function FrameCard({
  frame,
  categoryName,
  genderName = '',
  caratName = '',
  onClick,
}: FrameCardProps) {
  const { t } = useText('wholesaler');

  const [hovered, setHovered] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const placeholder = '/images/BlurFrame.jpg';

  const covers = Array.isArray(frame.covers) ? frame.covers : [];

  const mainImage = covers.length > 0 ? covers[0] : placeholder;

  const hasSecondImage = covers.length > 1;

  const hoverImage = hasSecondImage && isDesktop ? covers[1] : mainImage;

  /*
   * Tag frames are treated
   * as approved.
   */
  const percentAmount = Number((Number(frame.profit ?? 0) + Number(frame.wage ?? 0)).toFixed(3));

  const discountAmount = Number(frame.discount ?? 0);

  const hasDiscount = Number.isFinite(discountAmount) && discountAmount > 0;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();

          onClick();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        width: {
          xs: 210,
          sm: 235,
          md: 260,
        },

        borderRadius: {
          xs: 6,
          md: 8,
        },

        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',

        bgcolor: 'white',

        boxShadow: hovered ? '0 20px 45px rgba(0,0,0,0.08)' : '0 5px 15px rgba(0,0,0,0.02)',

        cursor: 'pointer',

        height: '100%',

        display: 'flex',

        flexDirection: 'column',

        border: '1px solid #f0f0f0',

        opacity: isMounted ? 1 : 0,

        overflow: 'visible',

        '&:active': {
          transform: 'scale(0.98)',
        },

        '&:focus-visible': {
          outline: '2px solid #A67C00',

          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          p: {
            xs: 0.75,
            md: 1.1,
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
          }}
        >
          {hasDiscount ? (
            <Box
              sx={{
                pointerEvents: 'none',

                position: 'absolute',

                top: 0,

                left: -32,

                zIndex: 10,

                width: 90,

                height: 90,

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'center',
              }}
            >
              <Image
                src="/images/offSVG3.svg"
                alt="Off Icon"
                width={90}
                height={90}
                style={{
                  objectFit: 'contain',
                }}
              />

              <Typography
                sx={{
                  position: 'absolute',

                  top: 'calc(40% + 6px)',

                  left: 'calc(50% + 1px)',

                  transform: 'translate(-50%, -50%) rotate(-55deg)',

                  fontSize: 14,

                  fontWeight: 700,

                  color: 'white',

                  zIndex: 2,
                }}
              >
                % {tPD(frame.discount ?? 0)}
              </Typography>
            </Box>
          ) : null}

          <Box
            sx={{
              position: 'relative',

              overflow: 'hidden',

              pt: '100%',

              borderRadius: {
                xs: 5,
                md: 6,
              },

              bgcolor: '#f8f8f8',
            }}
          >
            <Box
              sx={{
                position: 'absolute',

                inset: 0,

                transition: 'transform 0.8s ease, opacity 0.5s ease-in-out',

                opacity: hovered && hasSecondImage && isDesktop ? 0 : 1,

                transform: hovered ? 'scale(1.06)' : 'scale(1)',
              }}
            >
              <Image
                src={mainImage}
                alt={frame.model || 'Frame'}
                fill
                sizes="(max-width: 600px) 210px, (max-width: 900px) 235px, 260px"
                style={{
                  objectFit: 'cover',
                }}
              />
            </Box>

            {hasSecondImage && isDesktop ? (
              <Box
                sx={{
                  position: 'absolute',

                  inset: 0,

                  transition: 'opacity 0.5s ease-in-out, transform 0.8s ease',

                  opacity: hovered ? 1 : 0,

                  transform: hovered ? 'scale(1.06)' : 'scale(1)',
                }}
              >
                <Image
                  src={hoverImage}
                  alt={`${frame.model} hover`}
                  fill
                  sizes="260px"
                  style={{
                    objectFit: 'cover',
                  }}
                />
              </Box>
            ) : null}

            <Box
              sx={{
                pointerEvents: 'none',

                position: 'absolute',

                inset: 0,

                borderRadius: {
                  xs: 5,
                  md: 6,
                },

                background: 'linear-gradient(180deg, rgba(0,0,0,0.00) 65%, rgba(0,0,0,0.40) 100%)',
              }}
            />

            <Box
              sx={{
                pointerEvents: 'none',

                position: 'absolute',

                left: 14,
                right: 14,
                bottom: 6,

                color: '#fff',

                width: 'calc(100% - 28px)',

                display: 'flex',

                flexDirection: 'row',

                justifyContent: 'space-between',

                alignItems: 'center',
              }}
            >
              <Box />

              <Chip
                size="small"
                label={`${tPD(percentAmount)} درصد`}
                sx={{
                  bgcolor: alpha('#fff', 0.48),

                  color: '#000',

                  border: `1px solid ${alpha('#fff', 0.4)}`,

                  backdropFilter: 'blur(8px)',

                  fontSize: '13px',

                  fontWeight: 700,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <CardContent
        sx={{
          pb: {
            xs: 1,
            md: 2.5,
          },

          pt: 0.25,

          flexGrow: 1,

          textAlign: 'right',

          pointerEvents: 'none',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{
            mb: 1.2,

            flexWrap: 'wrap',

            gap: '4px',
          }}
        >
          {categoryName ? (
            <Chip
              label={categoryName}
              sx={{
                bgcolor: '#fff9e6',

                color: '#b8860b',

                fontWeight: 900,

                fontSize: {
                  xs: '0.6rem',

                  sm: '0.8rem',

                  md: '0.7rem',

                  lg: '0.75rem',
                },

                height: '22px',
              }}
            />
          ) : null}

          {genderName ? (
            <Chip
              label={genderName}
              sx={{
                bgcolor: '#f5f5f5',

                color: '#777',

                fontWeight: 700,

                height: '22px',
              }}
            />
          ) : null}

          {caratName ? (
            <Typography
              variant="caption"
              sx={{
                color: '#b8860b',

                fontWeight: 900,

                ml: 'auto !important',
              }}
            >
              {tPD(caratName)} {t('carat')}
            </Typography>
          ) : null}
        </Stack>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,

            fontSize: {
              xs: '0.9rem',

              sm: '1.05rem',
            },

            color: '#222',

            lineHeight: 1.5,

            display: '-webkit-box',

            WebkitLineClamp: 2,

            WebkitBoxOrient: 'vertical',

            overflow: 'hidden',

            minHeight: {
              xs: '2.7rem',

              md: '3.15rem',
            },
          }}
        >
          {frame.model}
        </Typography>

        {hasValue(frame.totalWeight) ? (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,

              color: '#666',

              mt: 1.3,
            }}
          >
            وزن کل قاب :{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 800,

                color: '#333',
              }}
            >
              {tPD(frame.totalWeight ?? 0)}
            </Box>{' '}
            گرم
          </Typography>
        ) : null}

        {hasValue(frame.minWeight) && hasValue(frame.maxWeight) ? (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,

              color: '#666',

              mt: 1.5,

              mb: 1,
            }}
          >
            تنوع از{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 800,

                color: '#333',
              }}
            >
              {tPD(frame.minWeight ?? 0)}
            </Box>{' '}
            گرم تا{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 800,

                color: '#333',
              }}
            >
              {tPD(frame.maxWeight ?? 0)}
            </Box>{' '}
            گرم
          </Typography>
        ) : null}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          sx={{
            mt: 0.5,

            pt: 1,

            borderTop: '1px solid #f8f8f8',

            color: '#b8860b',

            opacity: hovered ? 1 : 0.8,
          }}
        >
          <Typography
            sx={{
              fontWeight: 900,

              fontSize: '0.85rem',
            }}
          >
            {t('view_product')}
          </Typography>

          <ChevronLeftIcon
            sx={{
              fontSize: '1.2rem',

              transition: '0.3s',

              transform: hovered ? 'translateX(-4px)' : 'none',
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
