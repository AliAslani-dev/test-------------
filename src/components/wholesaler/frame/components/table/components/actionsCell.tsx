'use client';

import React from 'react';
import theme from '@/styles/Theme';
import { Box, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

type Props = {
  onView?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  onEdit?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function ProductTableActionsCell({ onView, onEdit }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
      <IconButton
        aria-label="view"
        onClick={(e) => {
          e.stopPropagation();
          onView?.(e);
        }}
        sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
      >
        <VisibilityIcon sx={{ height: '20px', width: '20px', color: '#9C7A2B' }} />
      </IconButton>
    </Box>
  );
}
