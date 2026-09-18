'use client';

import { WholesaleOrderTable } from '..';
import { alpha, Chip, Typography } from '@mui/material';
import { Column } from '@/components/shared/table';
import WholesaleOrderTableActionsCell from './actionsCell';
import { wholesaleOrderTableColumnsName } from '@/components/wholesale-orders/data';
import { WholesaleOrderStatusType } from '@/api/zarhub/dto';
import JDate from 'jalali-date';
import { fWC, tPD } from '@/utils';

export const makeWholesaleOrderTableColumns = (
  onViewRow?: (row: WholesaleOrderTable) => void,
): Column<WholesaleOrderTable>[] => [
  {
    id: 'title',
    label: wholesaleOrderTableColumnsName['title'],
    align: 'right',
    minWidth: 280,
  },
  {
    id: 'bucketName',
    label: wholesaleOrderTableColumnsName['bucketName'],
    align: 'right',
    minWidth: 155,
  },
  {
    id: 'finalGoldCredit',
    label: wholesaleOrderTableColumnsName['finalGoldCredit'],
    minWidth: 175,
    align: 'center',
    render: (v, row) => (
      <Typography
        fontSize="14px"
        sx={{
          direction: 'ltr',
          unicodeBidi: 'isolate',
        }}
      >
        {v !== null && v !== 0 ? String(tPD(v as number)) : '-'}
      </Typography>
    ),
  },
  {
    id: 'finalRialCredit',
    label: wholesaleOrderTableColumnsName['finalRialCredit'],
    minWidth: 160,
    align: 'center',
    render: (v) => (
      <Typography fontSize="14px">
        {v !== null && v !== 0 ? String(tPD(fWC(v as number))) : '-'}
      </Typography>
    ),
  },
  {
    id: 'createdAt',
    label: wholesaleOrderTableColumnsName['createdAt'],
    align: 'center',
    minWidth: 130,
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
    id: 'updatedAt',
    label: wholesaleOrderTableColumnsName['updatedAt'],
    align: 'center',
    minWidth: 130,
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
    id: 'status',
    label: wholesaleOrderTableColumnsName['status'],
    align: 'center',
    width: 220,
    render: (v) => {
      const statusValue = v as WholesaleOrderStatusType;

      let label = 'نامشخص';
      let colorKey: 'success' | 'error' | 'info' | 'warning' | 'grey' = 'grey';

      if (statusValue === 6) {
        label = 'نهایی شده';
        colorKey = 'success';
      } else if (statusValue === 5) {
        label = 'دریافت شده';
        colorKey = 'success';
      } else if (statusValue === 4) {
        label = 'ارسال شده';
        colorKey = 'info';
      } else if (statusValue === 3) {
        label = 'در انتظار ارسال';
        colorKey = 'success';
      } else if (statusValue === 2) {
        label = 'تایید شده توسط بنکدار';
        colorKey = 'success';
      } else if (statusValue === 1) {
        label = 'در حال بررسی';
        colorKey = 'info';
      } else if (statusValue === 0) {
        label = 'ثبت شده';
        colorKey = 'warning';
      } else if (statusValue === -1) {
        label = 'رد شده توسط بنکدار';
        colorKey = 'error';
      } else if (statusValue === -2) {
        label = 'رد شده توسط گالری';
        colorKey = 'error';
      }

      return (
        <Chip
          label={label}
          size="small"
          sx={(theme) => {
            if (colorKey === 'grey') {
              return {
                bgcolor: alpha(theme.palette.grey[500], 0.16),
                color: theme.palette.grey[700],
                fontWeight: 600,
                fontSize: '0.8125rem',
              };
            }

            const baseColorPalette = theme.palette[colorKey] as { main: string; dark: string };
            return {
              bgcolor: alpha(baseColorPalette.main, 0.16),
              color: baseColorPalette.dark,
              fontWeight: 600,
              fontSize: '0.8125rem',
            };
          }}
        />
      );
    },
  },
  {
    id: 'actions',
    label: wholesaleOrderTableColumnsName['actions'],
    width: 130,
    align: 'center',
    sortable: false,
    render: (_v, row) => <WholesaleOrderTableActionsCell onView={() => onViewRow?.(row)} />,
  },
];
