'use client';

import React from 'react';
import theme from '@/styles/Theme';
import { Box, IconButton, CircularProgress } from '@mui/material';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';

type Props = {
  onPrint?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  isPrinting?: boolean;
};

export default function OrderTableActionsCell({ onPrint, isPrinting }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
      <IconButton
        onClick={onPrint}
        disabled={isPrinting}
        sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
      >
        {isPrinting ? (
          <CircularProgress size={20} sx={{ color: '#9F6701' }} />
        ) : (
          <PrintRoundedIcon sx={{ height: '20px', width: '20px', color: '#9F6701' }} />
        )}
      </IconButton>
    </Box>
  );
}
