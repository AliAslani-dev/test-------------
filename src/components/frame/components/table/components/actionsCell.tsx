'use client';

import React from 'react';
import Link from 'next/link';
import theme from '@/styles/Theme';
import { MAIN_COLOR } from '@/constants';
import { Box, IconButton } from '@mui/material';
import StyleIcon from '@mui/icons-material/Style';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

type Props = {
  productsHref: string;
  onView?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  onEdit?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  onShowProducts?: (e?: React.MouseEvent<HTMLAnchorElement>) => void;
};

export default function FrameTableActionsCell({
  productsHref,
  onView,
  onEdit,
  onShowProducts,
}: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.(e);
        }}
        sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
      >
        <EditRoundedIcon sx={{ height: '20px', width: '20px', color: MAIN_COLOR }} />
      </IconButton>
      <IconButton
        component={Link}
        href={productsHref}
        onClick={(e) => {
          e.stopPropagation();
          onShowProducts?.(e);
        }}
        sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
      >
        <StyleIcon sx={{ height: '20px', width: '20px', color: MAIN_COLOR }} />
      </IconButton>
    </Box>
  );
}
