'use client';

import React from 'react';
import theme from '@/styles/Theme';
import { Box, CircularProgress, IconButton } from '@mui/material';
import RemoveRedEyeRoundedIcon from '@mui/icons-material/RemoveRedEyeRounded';
import { WholesaleOrderStatusType } from '@/api/order/dto';

type Props = {
  status: WholesaleOrderStatusType;
  loading?: boolean;
  onView?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  onEdit?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function WholesaleOrderTableActionsCell({
  status,
  loading = false,
  onView,
  onEdit,
}: Props) {
  const showEdit = status === 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
      {showEdit ? (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(e);
          }}
          disabled={loading}
          sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: '#9F6701' }} />
          ) : (
            <RemoveRedEyeRoundedIcon sx={{ height: '20px', width: '20px', color: '#9F6701' }} />
          )}
        </IconButton>
      ) : (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onView?.(e);
          }}
          sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
        >
          <RemoveRedEyeRoundedIcon sx={{ height: '20px', width: '20px', color: '#9F6701' }} />
        </IconButton>
      )}
    </Box>
  );
}
