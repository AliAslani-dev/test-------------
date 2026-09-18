'use client';

import { OrderTable } from '..';
import JDate from 'jalali-date';
import { fWC, tPD } from '@/utils';
import theme from '@/styles/Theme';
import Chip from '@mui/material/Chip';
import { NegNumText } from '@/utils/utils';
import OrderStatusCell from './orderStatusCell';
import OrderTableActionsCell from './actionsCell';
import { Column } from '@/components/shared/table';
import UploadIcon from '@mui/icons-material/Upload';
import PersonIcon from '@mui/icons-material/Person';
import { Box, IconButton, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { orderTableColumnsName } from '@/components/order/data';

export const makeOrderTableColumns = (
  isAdmin: boolean,
  justForView: boolean,
  printingId: number | null,
  onUploadRow?: (row: OrderTable) => void,
  onPrintRow?: (row: OrderTable) => void,
  onUserInformationRow?: (row: OrderTable) => void,
  onChangeOrderStatus?: (id: number, patch: Partial<OrderTable>) => void,
  onViewRow?: (row: OrderTable) => void,
  isFromTrade?: boolean,
): Column<OrderTable>[] => {
  const columns: Column<OrderTable>[] = [
    {
      id: 'documents',
      label: orderTableColumnsName['documents'],
      align: 'center',
      sortable: false,
      render: (_v, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <IconButton
            onClick={() => onUploadRow?.(row)}
            sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
          >
            {row.documents.package !== null &&
            row.documents.post_box !== null &&
            row.documents.product !== null &&
            row.documents.scales !== null &&
            row.documents.send_method !== null &&
            row.documents.tracking_code !== null ? (
              <CheckCircleIcon sx={{ height: '20px', width: '20px', color: 'green' }} />
            ) : (
              <UploadIcon sx={{ height: '20px', width: '20px', color: '#9F6701' }} />
            )}
          </IconButton>
        </Box>
      ),
    },
    {
      id: 'actions',
      label: orderTableColumnsName['actions'],
      align: 'center',
      sortable: false,
      render: (_v, row) => (
        <OrderTableActionsCell
          onPrint={() => onPrintRow?.(row)}
          isPrinting={printingId === row.id}
        />
      ),
    },
    {
      id: 'userInformationAction',
      label: orderTableColumnsName['userInformationAction'],
      align: 'center',
      sortable: false,
      render: (_v, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <IconButton
            onClick={() => onUserInformationRow?.(row)}
            sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}
          >
            <PersonIcon sx={{ height: '20px', width: '20px', color: '#9F6701' }} />
          </IconButton>
        </Box>
      ),
    },
    { id: 'id', label: orderTableColumnsName['id'], align: 'center', minWidth: 135 },
    {
      id: 'orderCode',
      label: orderTableColumnsName['orderCode'],
      minWidth: 142,
      align: 'right',
    },
    {
      id: 'G',
      label: orderTableColumnsName['G'],
      minWidth: 110,
      align: 'right',
    },
    {
      id: 'title',
      label: orderTableColumnsName['title'],
      minWidth: 350,
      align: 'right',
      sortable: true,
      render: (v, row) => (
        <Box
          onClick={() => {
            row.productId && row.bucketId && onViewRow && onViewRow(row);
          }}
          sx={
            row.productId && row.bucketId
              ? {
                  cursor: 'pointer',
                  color: 'rgb(30, 32, 172)',
                  '&:hover .MuiTypography-root': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }
              : {}
          }
        >
          <Typography fontSize="14px" sx={{ transition: 'color 0.2s' }}>
            {String(v)}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'createdAt',
      label: orderTableColumnsName['createdAt'],
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
      id: 'goldPrice',
      label: orderTableColumnsName['goldPrice'],
      minWidth: 114,
      align: 'center',
      sortable: true,
      render: (v) => (
        <Typography fontSize="14px">
          {v === 0 ? '-' : String(tPD(fWC(v ? (v as number) : 0)))}
        </Typography>
      ),
    },
    {
      id: 'price',
      label: orderTableColumnsName['price'],
      align: 'center',
      minWidth: 140,
      render: (v) => <NegNumText sx={{ fontSize: '14px' }}>{tPD(fWC(Number(v)))}</NegNumText>,
    },
    {
      id: 'invoiceShippingTotal',
      label: orderTableColumnsName['invoiceShippingTotal'],
      minWidth: 142,
      align: 'center',
      sortable: true,
      render: (v) => <Typography fontSize="14px">{String(tPD(fWC(v as number)))}</Typography>,
    },
    // { id: 'type', label: orderTableColumnsName['type'], align: 'center', minWidth: 130 },
    {
      id: 'fromMiniApps',
      label: orderTableColumnsName['fromMiniApps'],
      align: 'center',
      minWidth: 130,
      sortable: true,
      render(_, row) {
        const configs = {
          0: { label: 'فروشگاهی', color: '#ff7504' },
          1: { label: 'وبسایت گالری', color: '#054ba2' },
          2: { label: 'کارتخوان', color: '#9C27B0' },
          3: { label: 'خرید طلا', color: '#126d00' },
          4: { label: 'فروش طلا', color: '#ff0000' },
        };

        const item = configs[row.fromMiniApps as keyof typeof configs];

        return (
          <Chip
            size="small"
            variant="outlined"
            label={item.label}
            sx={{
              fontSize: '12px',
              color: item.color,
              backgroundColor: `${item.color}15`,
              border: `1px solid ${item.color}40`,
              fontWeight: 'bold',
            }}
          />
        );
      },
    },
    {
      id: 'paymentStatusFa',
      label: orderTableColumnsName['paymentStatusFa'],
      align: 'center',
      minWidth: 155,
    },
    {
      id: 'statusTitle',
      label: orderTableColumnsName['statusTitle'],
      align: 'center',
      minWidth: 150,
      render: (v, row) => {
        return (
          <OrderStatusCell
            initialValue={v as string}
            orderId={row.id}
            isAdmin={isAdmin}
            onChangeOrderStatus={onChangeOrderStatus}
            justForView={justForView}
          />
        );
      },
    },
  ];

  if (isFromTrade) {
    const tradeTableColumns: Column<OrderTable>[] = [
      { id: 'id', label: orderTableColumnsName['id'], align: 'center', minWidth: 135 },
      {
        id: 'orderCode',
        label: orderTableColumnsName['orderCode'],
        minWidth: 142,
        align: 'right',
      },
      {
        id: 'G',
        label: orderTableColumnsName['G'],
        minWidth: 110,
        align: 'right',
      },
      {
        id: 'title',
        label: orderTableColumnsName['title'],
        minWidth: 400,
        align: 'right',
        sortable: true,
        render: (v, row) => (
          <Box
            onClick={() => {
              row.productId && row.bucketId && onViewRow && onViewRow(row);
            }}
            sx={
              row.productId && row.bucketId
                ? {
                    cursor: 'pointer',
                    color: 'rgb(30, 32, 172)',
                    '&:hover .MuiTypography-root': {
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }
                : {}
            }
          >
            <Typography fontSize="14px" sx={{ transition: 'color 0.2s' }}>
              {String(v)}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'createdAt',
        label: orderTableColumnsName['createdAt'],
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
        id: 'goldPrice',
        label: orderTableColumnsName['goldPrice'],
        minWidth: 114,
        align: 'center',
        sortable: true,
        render: (v) => (
          <Typography fontSize="14px">
            {v === 0 ? '-' : String(tPD(fWC(v ? (v as number) : 0)))}
          </Typography>
        ),
      },
      {
        id: 'price',
        label: orderTableColumnsName['price'],
        align: 'center',
        minWidth: 140,
        render: (v) => <NegNumText sx={{ fontSize: '14px' }}>{tPD(fWC(Number(v)))}</NegNumText>,
      },
      {
        id: 'fromMiniApps',
        label: orderTableColumnsName['fromMiniApps'],
        align: 'center',
        minWidth: 130,
        sortable: true,
        render(_, row) {
          const configs = {
            0: { label: 'فروشگاهی', color: '#ff7504' },
            1: { label: 'وبسایت گالری', color: '#054ba2' },
            2: { label: 'کارتخوان', color: '#9C27B0' },
            3: { label: 'خرید طلا', color: '#126d00' },
            4: { label: 'فروش طلا', color: '#ff0000' },
          };

          const item = configs[row.fromMiniApps as keyof typeof configs];

          return (
            <Chip
              size="small"
              variant="outlined"
              label={item.label}
              sx={{
                fontSize: '12px',
                color: item.color,
                backgroundColor: `${item.color}15`,
                border: `1px solid ${item.color}40`,
                fontWeight: 'bold',
              }}
            />
          );
        },
      },
      {
        id: 'paymentStatusFa',
        label: orderTableColumnsName['paymentStatusFa'],
        align: 'center',
        minWidth: 155,
      },
      {
        id: 'statusTitle',
        label: orderTableColumnsName['statusTitle'],
        align: 'center',
        minWidth: 150,
        render: (v, row) => {
          return (
            <OrderStatusCell
              initialValue={v as string}
              orderId={row.id}
              isAdmin={isAdmin}
              onChangeOrderStatus={onChangeOrderStatus}
              justForView={justForView}
            />
          );
        },
      },
    ];

    return tradeTableColumns;
  }

  if (!isAdmin) {
    return columns.filter((col) => col.id !== 'invoiceShippingTotal');
  }

  return columns;
};
