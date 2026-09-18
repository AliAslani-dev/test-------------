'use client';

import { tPD } from '@/utils';
import Image from 'next/image';
import useText from '@/hooks/useText';
import { useEffect, useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';

import { FrameDTO } from '@/api/zarhub/dto';

interface FrameCardProps {
  frame: FrameDTO;
  categoryName: string;
  genderName: string;
  caratName: string;
  onClick: () => void;
}

export default function FrameCard({
  frame,
  categoryName,
  genderName,
  caratName,
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
  const mainImage = frame.covers && frame.covers.length > 0 ? frame.covers[0] : placeholder;
  const hasSecondImage = frame.covers && frame.covers.length > 1;
  const hoverImage = hasSecondImage && isDesktop ? frame.covers[1] : mainImage;
  const percentAmount = frame.approved
    ? Number((Number(frame.profit) + Number(frame.wage)).toFixed(3))
    : 0;

  return (
    <Card
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        borderRadius: { xs: 6, md: 8 },
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
      }}
    >
      <Box sx={{ p: { xs: 0.75, md: 1.1 } }}>
        <Box sx={{ position: 'relative' }}>
          {frame.approved && frame.discount && frame.discount !== '0' && (
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
                style={{ objectFit: 'contain' }}
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
                % {tPD(frame.discount)}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              pt: '100%',
              borderRadius: { xs: 5, md: 6 },
              bgcolor: '#f8f8f8',
            }}
          >
            {/* Main Image */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transition: 'transform 0.8s ease, opacity 0.5s ease-in-out',
                opacity: hovered && hasSecondImage && isDesktop ? 0 : 1,
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
              }}
            >
              <Image
                src={mainImage}
                alt={frame.model}
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
            </Box>

            {/* Hover Image */}
            {hasSecondImage && isDesktop && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  transition: 'opacity 0.5s ease-in-out, transform 0.8s ease',
                  opacity: hovered ? 1 : 0,
                  transform: hovered ? 'scale(1.06)' : 'scale(1)',
                }}
              >
                <Image
                  src={hoverImage}
                  alt={`${frame.model} hover`}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            )}

            {frame.approved && (
              <>
                <Box
                  sx={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: { xs: 5, md: 6 },
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0.00) 65%, rgba(0,0,0,0.40) 100%)',
                  }}
                />

                <Box
                  sx={{
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
              </>
            )}
          </Box>
        </Box>
      </Box>

      <CardContent sx={{ pb: { xs: 1, md: 2.5 }, pt: 0.25, flexGrow: 1, textAlign: 'right' }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ mb: 1.2, flexWrap: 'wrap', gap: '4px' }}
        >
          {categoryName && (
            <Chip
              label={categoryName}
              sx={{
                bgcolor: '#fff9e6',
                color: '#b8860b',
                fontWeight: 900,
                fontSize: { xs: '0.6rem', sm: '0.8rem', md: '0.7rem', lg: '0.75rem' },
                height: '22px',
              }}
            />
          )}
          {genderName && (
            <Chip
              label={genderName}
              sx={{
                bgcolor: '#f5f5f5',
                color: '#777',
                fontWeight: 700,
                fontSize: { xs: '0.6rem', sm: '0.8rem', md: '0.7rem', lg: '0.75rem' },
                height: '22px',
              }}
            />
          )}
          {caratName !== '' && (
            <Typography
              variant="caption"
              sx={{
                color: '#b8860b',
                fontWeight: 900,
                alignSelf: 'center',
                ml: 'auto !important',
                fontSize: { xs: '0.6rem', sm: '0.8rem', md: '0.7rem', lg: '0.75rem' },
              }}
            >
              {tPD(caratName)} {t('carat')}
            </Typography>
          )}
        </Stack>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '0.9rem', sm: '1.05rem' },
            color: '#222',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: { xs: '2.7rem', md: '3.15rem' },
          }}
        >
          {frame.model}
        </Typography>

        {frame.approved && frame.totalWeight && (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: '#666',
              fontSize: { xs: '0.75rem', sm: '0.9rem' },
              mt: 1.3,
              minHeight: { xs: '0.9rem', sm: '1.05rem' },
            }}
          >
            وزن کل قاب :{' '}
            <Box component="span" sx={{ fontWeight: 800, color: '#333' }}>
              {tPD(frame.totalWeight)}
            </Box>{' '}
            گرم
          </Typography>
        )}

        {frame.approved && frame.minWeight && frame.maxWeight && (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: '#666',
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
              mt: 1.5,
              mb: 1,
              minHeight: { xs: '0.9rem', sm: '1.05rem' },
            }}
          >
            تنوع از{' '}
            <Box
              component="span"
              sx={{ fontWeight: 800, fontSize: { xs: '0.85rem', md: '0.95rem' }, color: '#333' }}
            >
              {tPD(frame.minWeight)}
            </Box>{' '}
            گرم تا{' '}
            <Box component="span" sx={{ fontWeight: 800, color: '#333' }}>
              {tPD(frame.maxWeight)}
            </Box>{' '}
            گرم
          </Typography>
        )}

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
          <Typography sx={{ fontWeight: 900, fontSize: { xs: '0.75rem', md: '0.85rem' } }}>
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
