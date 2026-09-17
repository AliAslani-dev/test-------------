'use client';

import { Box, Card, Skeleton } from '@mui/material';

export default function WholesalerCardSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 5,

        overflow: 'hidden',

        border: '1px solid rgba(0,0,0,0.08)',

        bgcolor: '#fff',
      }}
    >
      <Skeleton variant="rectangular" height={220} />

      <Box
        sx={{
          p: 2.2,
        }}
      >
        <Skeleton width="55%" />
        <Skeleton width="90%" />
        <Skeleton width="70%" />
      </Box>
    </Card>
  );
}
