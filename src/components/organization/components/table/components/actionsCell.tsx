'use client';

import React from 'react';
import theme from '@/styles/Theme';
import { MAIN_COLOR } from '@/constants';
import { Box, IconButton } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

type Props = {
  onView?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  onEdit?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function OrganizationTableActionsCell({ onView, onEdit }: Props) {
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
    </Box>
  );
}
