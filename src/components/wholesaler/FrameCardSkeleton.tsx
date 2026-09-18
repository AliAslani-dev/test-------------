'use client';

import { Card, CardContent, Box, Stack, Skeleton } from '@mui/material';

export default function FrameCardSkeleton() {
  return (
    <Card
      sx={{
        borderRadius: { xs: 6, md: 8 },
        bgcolor: 'white',
        boxShadow: '0 5px 15px rgba(0,0,0,0.02)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #f0f0f0',
      }}
    >
      <Box sx={{ p: { xs: 0.75, md: 1.1 } }}>
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            pt: '100%',
            borderRadius: { xs: 5, md: 6 },
          }}
        >
          <Skeleton
            variant="rectangular"
            animation="wave"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: '#f8f8f8',
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ pb: { xs: 1, md: 2.5 }, pt: 0.25, flexGrow: 1, textAlign: 'right' }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ mb: 1.2, flexWrap: 'wrap', gap: '4px' }}
        >
          <Skeleton
            variant="rounded"
            animation="wave"
            width={55}
            height={22}
            sx={{ borderRadius: '16px' }}
          />
          <Skeleton
            variant="rounded"
            animation="wave"
            width={45}
            height={22}
            sx={{ borderRadius: '16px' }}
          />
          <Skeleton
            variant="text"
            animation="wave"
            width={35}
            height={18}
            sx={{ ml: 'auto !important' }}
          />
        </Stack>

        <Box
          sx={{
            minHeight: { xs: '2.7rem', md: '3.15rem' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: 0.5,
          }}
        >
          <Skeleton variant="text" animation="wave" width="90%" height={20} />
          <Skeleton variant="text" animation="wave" width="60%" height={20} />
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          sx={{
            mt: 0.5,
            pt: 1,
            borderTop: '1px solid #f8f8f8',
          }}
        >
          <Skeleton variant="text" animation="wave" width={90} height={20} />
        </Stack>
      </CardContent>
    </Card>
  );
}
