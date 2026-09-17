'use client';

import Image from 'next/image';
import { Box, Typography, Paper } from '@mui/material';

export default function ProductGridCard({
  product,
  onClick,
}: {
  product: any;
  onClick: () => void;
}) {
  const placeholder = '/images/BlurProduct.jpg';
  const mainImg = product.image || product.images?.[0] || placeholder;

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        padding: '10px',
        borderRadius: '30px',
        overflow: 'hidden',
        border: '1px solid #e6e6e6',
        cursor: 'pointer',
        transition: 'all 0.3s',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        '&:hover': {
          borderColor: '#9C7A2B',
          boxShadow: '0 8px 24px rgba(156, 122, 43, 0.12)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          pt: '100%',
          bgcolor: '#f8f8f8',
          borderRadius: '30px',
        }}
      >
        <Image
          src={mainImg}
          alt={product.model}
          fill
          style={{ objectFit: 'cover', borderRadius: '30px' }}
        />
      </Box>

      <Box
        sx={{
          p: 2,
          pb: 1,
          textAlign: 'right',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: '0.9rem', sm: '1rem', md: '0.9rem', lg: '0.9rem' },
            color: '#222',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1.5,
          }}
        >
          {product.model}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.7rem', lg: '0.7rem' },
            fontWeight: 700,
            color: '#9C7A2B',
            mt: 'auto',
            opacity: 0.9,
          }}
        >
          مشاهده جزئیات و سفارش
        </Typography>
      </Box>
    </Paper>
  );
}
