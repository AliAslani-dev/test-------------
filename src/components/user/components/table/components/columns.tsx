'use client';

import { UserTable } from '..';
import Image from 'next/image';
import { MouseEvent } from 'react';
import useText from '@/hooks/useText';
import { useLang } from '@/hooks/LanContext';
import UserTableClosedCell from './closedCell';
import UserTableEnabledCell from './enabledCell';
import UserTableActionsCell from './actionsCell';
import { Column } from '@/components/shared/table';
import { Box, Tooltip, Typography } from '@mui/material';
import { userTableColumnsName } from '@/components/user/data';

export const makeUserTableColumns = (
  onLocalToggle?: (id: number, next: boolean) => void,
  onLocalCloseStoreToggle?: (id: number, next: boolean) => void,
  onEditRow?: (row: UserTable) => void,
  onSeeOrdersRow?: (row: UserTable, e?: MouseEvent<HTMLAnchorElement>) => void,
  onSeeRequestsRow?: (row: UserTable, e?: MouseEvent<HTMLAnchorElement>) => void,
  onSeeAccountingRow?: (row: UserTable, e?: MouseEvent<HTMLAnchorElement>) => void,
): Column<UserTable>[] => [
  {
    id: 'logo',
    label: userTableColumnsName['logo'],
    width: 75,
    align: 'center',
    sortable: false,
    render: (v, row) => (
      <>
        {v !== null && typeof v === 'string' && v !== '' ? (
          <Tooltip
            placement="top"
            enterDelay={300}
            leaveDelay={0}
            disableInteractive
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  p: 1,
                  borderRadius: 2,
                  boxShadow: 4,
                  maxWidth: 'none',
                },
              },
            }}
            title={
              <Box sx={{ p: 0.5 }}>
                <Box
                  sx={{
                    width: 240,
                    height: 240,
                    position: 'relative',
                  }}
                >
                  <Image
                    src={v}
                    alt="پیش‌نمایش بزرگ لوگو"
                    fill
                    sizes="240px"
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
              </Box>
            }
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                display: 'inline-block',
                lineHeight: 0,
                borderRadius: 1,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Image src={v} alt="لوگو" fill sizes="40px" style={{ objectFit: 'contain' }} />
            </Box>
          </Tooltip>
        ) : null}
      </>
    ),
  },
  { id: 'username', label: userTableColumnsName['username'], minWidth: 260, align: 'right' },
  { id: 'email', label: userTableColumnsName['email'], minWidth: 260, align: 'right' },
  {
    id: 'role',
    label: userTableColumnsName['role'],
    align: 'center',
    width: 124,
    render: (v) => {
      const { lang } = useLang();
      const { t } = useText('user', lang);
      type ValidRole =
        | 'banking-admin'
        | 'banking-provider'
        | 'banking-seller'
        | 'organizational'
        | 'gallery';
      if (
        typeof v !== 'string' ||
        ![
          'banking-admin',
          'banking-provider',
          'banking-seller',
          'organizational',
          'gallery',
        ].includes(v)
      ) {
        return null;
      }

      const role = v as ValidRole;

      const roleMap: Record<ValidRole, string> = {
        'banking-admin': t('table.roles.banking-admin'),
        'banking-provider': t('table.roles.banking-provider'),
        'banking-seller': t('table.roles.banking-seller'),
        organizational: t('table.roles.organizational'),
        gallery: t('table.roles.gallery'),
      };

      return <Typography fontSize={14}>{roleMap[role]}</Typography>;
    },
  },
  {
    id: 'sellerMobile',
    label: userTableColumnsName['sellerMobile'],
    minWidth: 132,
    align: 'right',
  },
  {
    id: 'enabled',
    label: userTableColumnsName['enabled'],
    align: 'center',
    width: 118,
    render: (v, row) => (
      <UserTableEnabledCell value={!!v} row={row} onLocalToggle={onLocalToggle} />
    ),
  },
  {
    id: 'closed',
    label: userTableColumnsName['closed'],
    align: 'center',
    width: 118,
    render: (v, row) => (
      <UserTableClosedCell
        value={!!row.closed}
        row={row}
        onLocalClosedToggle={onLocalCloseStoreToggle}
      />
    ),
  },
  {
    id: 'actions',
    label: userTableColumnsName['actions'],
    align: 'center',
    width: 220,
    sortable: false,
    render: (_v, row) => (
      <UserTableActionsCell
        ordersHref={`/dashboard/users/${row.id}/orders`}
        requestsHref={`/dashboard/users/${row.id}/followers`}
        accountingHref={`/dashboard/users/${row.id}/accounting`}
        onEdit={() => onEditRow?.(row)}
        onSeeOrders={(e) => onSeeOrdersRow?.(row, e)}
        onSeeRequests={(e) => onSeeRequestsRow?.(row, e)}
        onSeeAccounting={(e) => onSeeAccountingRow?.(row, e)}
      />
    ),
  },
];
