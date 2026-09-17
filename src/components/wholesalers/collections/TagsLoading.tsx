'use client';

import { Box, Skeleton, Stack } from '@mui/material';

import FrameCardSkeleton from './FrameCardSkeleton';

export default function TagsLoading() {
  return (
    <Stack
      spacing={{
        xs: 4,
        md: 5,
      }}
      sx={{
        width: '100%',
      }}
    >
      {[1, 2, 3].map((section) => (
        <Box
          key={section}
          sx={{
            width: '100%',

            minWidth: 0,
          }}
        >
          <Skeleton variant="text" width="28%" height={38} />

          <Skeleton variant="text" width="15%" height={22} />

          <Skeleton
            variant="rounded"
            width="100%"
            sx={{
              mt: 1.5,

              aspectRatio: '4 / 1',

              borderRadius: 3,
            }}
          />

          <Box
            sx={{
              mt: 2,

              width: '100%',

              overflow: 'hidden',
            }}
          >
            <Stack direction="row" spacing={2}>
              {[1, 2, 3, 4].map((card) => (
                <FrameCardSkeleton key={card} />
              ))}
            </Stack>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
