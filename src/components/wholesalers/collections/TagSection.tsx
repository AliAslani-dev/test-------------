'use client';

import { Box, Typography } from '@mui/material';

import type { TagDTO } from '@/api/zarhub/dto';



import { tPD } from '@/utils';

import BannerSlider from './BannerSlider';
import FrameCard from './FrameCard';

interface TagSectionProps {
  tag: TagDTO;

  onOpenFrame: (payload:  any) => void;
}

export default function TagSection({ tag, onOpenFrame }: TagSectionProps) {
  const bundles = Array.isArray(tag.bundles) ? tag.bundles : [];

  return (
    <Box
      component="section"
      sx={{
        width: '100%',
        minWidth: 0,
        direction: 'rtl',
      }}
    >
      <Box
        sx={{
          mb: {
            xs: 1.25,
            md: 1.75,
          },
        }}
      >
        <Typography
          component="h2"
          sx={{
            color: '#1a1a1a',
            fontWeight: 900,
            fontSize: {
              xs: '1.1rem',
              sm: '1.25rem',
              md: '1.45rem',
            },
            lineHeight: 1.5,
          }}
        >
          {tag.name}
        </Typography>

        <Typography
          sx={{
            mt: 0.2,
            color: '#888',
            fontSize: {
              xs: '0.72rem',
              md: '0.82rem',
            },
            fontWeight: 600,
          }}
        >
          {tPD(bundles.length)} قاب
        </Typography>
      </Box>

      <BannerSlider banners={Array.isArray(tag.banners) ? tag.banners : []} />

      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          mt: {
            xs: 1.5,
            md: 2,
          },
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          overscrollBehaviorX: 'contain',

          '&::-webkit-scrollbar': {
            display: 'none',
            width: 0,
            height: 0,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: {
              xs: 1.5,
              md: 2,
            },
            width: 'max-content',
            minWidth: '100%',
            direction: 'rtl',
            paddingBottom: {
              xs: 2,
              md: 6,
            },
          }}
        >
          {bundles.map((bundle) => (
            <Box
              key={bundle.id}
              sx={{
                flex: '0 0 auto',
              }}
            >
              <FrameCard
                frame={bundle.frame}
                categoryName={tag.categoryFaName || ''}
                genderName=""
                caratName=""
                onClick={() => {
                  onOpenFrame({
                    frameId: bundle.frame.id,

                    /**
                     * REAL frame bucket.
                     *
                     * We use this to find the actual
                     * WholesalerDTO.id.
                     */
                    frameBucketId: bundle.frame.bucketId,

                    tagId: tag.id,

                    /**
                     * ORDER ONLY
                     */
                    sellerId: tag.sellerId,
                    bucketId: tag.bucketId,
                  });
                }}
              />
            </Box>
          ))}

          <Box
            aria-hidden
            sx={{
              flex: '0 0 auto',
              width: {
                xs: '24px',
                sm: '30px',
                md: '40px',
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
