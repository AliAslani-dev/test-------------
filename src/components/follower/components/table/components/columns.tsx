'use client';

import { tPD } from '@/utils';
import JDate from 'jalali-date';
import theme from '@/styles/Theme';
import type { MouseEvent } from 'react';
import { FollowRequestTable } from '..';
import { Column } from '@/components/shared/table';
import InfoIcon from '@mui/icons-material/InfoRounded';
import { Box, IconButton, Typography } from '@mui/material';
import ViewRequestStatusCell from './ViewRequestStatusCell';
import { FollowRequestStatusType } from '@/api/follower/dto';
import FollowRequestTableAccountingCell from './accountingCell';
import { followRequestTableColumnsName } from '@/components/follower/data';

export const makeFollowRequestTableColumns = (
  userId: number,
  isAdmin: boolean,
  onChangeStatus?: (id: number, patch: Partial<FollowRequestTable>) => void,
  onViewRow?: (row: FollowRequestTable) => void,
  onSeeGalleryAccountingRow?: (row: FollowRequestTable, e?: MouseEvent<HTMLAnchorElement>) => void,
): Column<FollowRequestTable>[] => [
  {
    id: 'zarplusUser',
    label: followRequestTableColumnsName['zarplusUser'],
    minWidth: 240,
    align: 'right',
  },
  {
    id: 'actions',
    label: followRequestTableColumnsName['actions'],
    align: 'center',
    width: 130,
    sortable: false,
    render: (_v, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <IconButton
          onClick={() => onViewRow?.(row)}
          sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
        >
          <InfoIcon sx={{ height: '20px', width: '20px', color: '#9F6701' }} />
        </IconButton>
      </Box>
    ),
  },
  {
    id: 'createdAt',
    label: followRequestTableColumnsName['createdAt'],
    align: 'center',
    minWidth: 120,
    sortable: false,
    render: (v) => {
      const jalaliDate = JDate.toJalali(v as Date);
      return (
        <Typography sx={{ fontSize: '14px' }}>
          {tPD(`${jalaliDate[0]}/${jalaliDate[1]}/${jalaliDate[2]}`)}
        </Typography>
      );
    },
  },
  {
    id: 'approved',
    label: followRequestTableColumnsName['approved'],
    align: 'center',
    width: 230,
    render: (v, row) => {
      return (
        <ViewRequestStatusCell
          initialValue={v as FollowRequestStatusType}
          requestId={row.id}
          onChangeStatus={onChangeStatus}
        />
      );
    },
  },
  {
    id: 'accounting',
    label: followRequestTableColumnsName['accounting'],
    align: 'center',
    width: 100,
    sortable: false,
    render: (_v, row) => (
      <FollowRequestTableAccountingCell
        galleryAccountingHref={
          isAdmin
            ? `/dashboard/users/${userId}/followers/${row.zarplusUserId}`
            : `/dashboard/followers/${row.zarplusUserId}/gallery-accounting`
        }
        onSeeGalleryAccounting={(e) => onSeeGalleryAccountingRow?.(row, e)}
      />
    ),
  },
];
