'use client';

import theme from '@/styles/Theme';
import type { MouseEvent } from 'react';
import { MAIN_COLOR } from '@/constants';
import { Box, IconButton } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import Link from 'next/link';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';

type Props = {
  ordersHref: string;
  requestsHref: string;
  accountingHref: string;
  onEdit?: (e?: MouseEvent<HTMLButtonElement>) => void;
  onSeeOrders?: (e?: MouseEvent<HTMLAnchorElement>) => void;
  onSeeRequests?: (e?: MouseEvent<HTMLAnchorElement>) => void;
  onSeeAccounting?: (e?: MouseEvent<HTMLAnchorElement>) => void;
};

export default function UserTableActionsCell({
  ordersHref,
  requestsHref,
  accountingHref,
  onEdit,
  onSeeOrders,
  onSeeRequests,
  onSeeAccounting,
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
        href={requestsHref}
        onClick={(e) => {
          e.stopPropagation();
          onSeeRequests?.(e);
        }}
        sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
      >
        <PeopleAltIcon sx={{ height: '20px', width: '20px', color: '#9F6701' }} />
      </IconButton>
      <IconButton
        component={Link}
        href={ordersHref}
        onClick={(e) => {
          e.stopPropagation();
          onSeeOrders?.(e);
        }}
        sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
      >
        <DescriptionRoundedIcon sx={{ height: '20px', width: '20px', color: '#9F6701' }} />
      </IconButton>
      <IconButton
        component={Link}
        href={accountingHref}
        onClick={(e) => {
          e.stopPropagation();
          onSeeAccounting?.(e);
        }}
        sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
      >
        <AccountBalanceRoundedIcon sx={{ height: '20px', width: '20px', color: '#9F6701' }} />
      </IconButton>
    </Box>
  );
}
