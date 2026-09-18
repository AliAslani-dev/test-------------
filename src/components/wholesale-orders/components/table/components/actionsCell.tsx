'use client';

import Link from 'next/link';
import React from 'react';
import theme from '@/styles/Theme';
import { Box, IconButton } from '@mui/material';
import StyleIcon from '@mui/icons-material/Style';
import RemoveRedEyeRoundedIcon from '@mui/icons-material/RemoveRedEyeRounded';

type Props = {
  onView?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function WholesaleOrderTableActionsCell({ onView }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
      <IconButton
        onClick={onView}
        sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
      >
        <RemoveRedEyeRoundedIcon sx={{ height: '20px', width: '20px', color: '#9F6701' }} />
      </IconButton>
    </Box>
  );
}
