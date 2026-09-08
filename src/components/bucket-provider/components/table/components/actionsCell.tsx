'use client';

import React from 'react';
import Link from 'next/link';
import theme from '@/styles/Theme';
import { MAIN_COLOR } from '@/constants';
import { Box, IconButton } from '@mui/material';
import StyleIcon from '@mui/icons-material/Style';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

type Props = {
  framesHref: string;
  onView?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  // onEdit?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  onShowFrames?: (e?: React.MouseEvent<HTMLAnchorElement>) => void;
};

export default function BucketProviderTableActionsCell({
  framesHref,
  onView,
  // onEdit,
  onShowFrames,
}: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
      {/* <IconButton
        onClick={onView}
        sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
      >
        <RemoveRedEyeRoundedIcon sx={{ height: '20px', width: '20px', color: MAIN_COLOR }} />
      </IconButton> */}
      {/* <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.(e);
        }}
        sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
      >
        <EditRoundedIcon sx={{ height: '20px', width: '20px', color: MAIN_COLOR }} />
      </IconButton> */}
      <IconButton
        component={Link}
        href={framesHref}
        onClick={(e) => {
          e.stopPropagation();
          onShowFrames?.(e);
        }}
        sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
      >
        <StyleIcon sx={{ height: '20px', width: '20px', color: MAIN_COLOR }} />
      </IconButton>
    </Box>
  );
}
