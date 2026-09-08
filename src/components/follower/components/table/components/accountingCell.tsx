'use client';

import Link from 'next/link';
import theme from '@/styles/Theme';
import type { MouseEvent } from 'react';
import { Box, IconButton } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';

type Props = {
  galleryAccountingHref: string;
  onSeeGalleryAccounting?: (e?: MouseEvent<HTMLAnchorElement>) => void;
};

export default function FollowRequestTableAccountingCell({
  galleryAccountingHref,
  onSeeGalleryAccounting,
}: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
      <IconButton
        component={Link}
        href={galleryAccountingHref}
        onClick={(e) => {
          e.stopPropagation();
          onSeeGalleryAccounting?.(e);
        }}
        sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
      >
        <AccountBalanceRoundedIcon sx={{ height: '20px', width: '20px', color: '#9F6701' }} />
      </IconButton>
    </Box>
  );
}
