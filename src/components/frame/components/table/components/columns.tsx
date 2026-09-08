'use client';

import { tPD } from '@/utils';
import { FrameTable } from '..';
import { MouseEvent } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import FrameTableActionsCell from './actionsCell';
import { Column } from '@/components/shared/table';
import { frameTableColumnsName } from '@/components/frame/data';
import Image from 'next/image';
import FrameTableArchivedCell from './archivedCell';

export const makeFrameTableColumns = (
  onViewRow?: (row: FrameTable) => void,
  onEditRow?: (row: FrameTable) => void,
  onShowProducts?: (row: FrameTable, e?: MouseEvent<HTMLAnchorElement>) => void,
  onLocalArchiveToggle?: (id: number, next: boolean) => void,
): Column<FrameTable>[] => {
  const columns: Column<FrameTable>[] = [
    {
      id: 'cover',
      label: frameTableColumnsName['cover'],
      width: 120,
      align: 'center',
      sortable: false,
      render: (v) => {
        return v ? (
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
                    src={v as string}
                    alt="Image Preview"
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
              <Image
                src={v as string}
                alt="Logo"
                fill
                sizes="40px"
                style={{ objectFit: 'contain' }}
              />
            </Box>
          </Tooltip>
        ) : null;
      },
    },
    {
      id: 'model',
      label: frameTableColumnsName['model'],
      minWidth: 180,
      align: 'right',
      sortable: false,
    },
    {
      id: 'genderCategory',
      label: frameTableColumnsName['genderCategory'],
      minWidth: 100,
      align: 'right',
      sortable: false,
    },
    {
      id: 'category',
      label: frameTableColumnsName['category'],
      minWidth: 100,
      align: 'right',
      sortable: false,
    },
    {
      id: 'totalWeight',
      label: frameTableColumnsName['totalWeight'],
      align: 'center',
      minWidth: 100,
      sortable: false,
      render: (v) => <Typography fontSize="14px">{String(tPD(v as number))}</Typography>,
    },
    {
      id: 'minWeight',
      label: frameTableColumnsName['minWeight'],
      align: 'center',
      minWidth: 100,
      sortable: false,
      render: (v) => <Typography fontSize="14px">{String(tPD(v as number))}</Typography>,
    },
    {
      id: 'maxWeight',
      label: frameTableColumnsName['maxWeight'],
      align: 'center',
      minWidth: 110,
      sortable: false,
      render: (v) => <Typography fontSize="14px">{String(tPD(v as number))}</Typography>,
    },
    {
      id: 'wage',
      label: frameTableColumnsName['wage'],
      align: 'center',
      minWidth: 80,
      sortable: false,
      render: (v) => <Typography fontSize="14px">{String(tPD(v as number))} ٪</Typography>,
    },
    {
      id: 'profit',
      label: frameTableColumnsName['profit'],
      align: 'center',
      minWidth: 80,
      sortable: false,
      render: (v) => <Typography fontSize="14px">{String(tPD(v as number))} ٪</Typography>,
    },
    {
      id: 'discount',
      label: frameTableColumnsName['discount'],
      align: 'center',
      minWidth: 80,
      sortable: false,
      render: (v) => <Typography fontSize="14px">{String(tPD(v as number))} ٪</Typography>,
    },
    {
      id: 'archived',
      label: frameTableColumnsName['archived'],
      minWidth: 140,
      align: 'center',
      render: (v, row) => (
        <FrameTableArchivedCell value={!!v} row={row} onLocalArchiveToggle={onLocalArchiveToggle} />
      ),
    },
    {
      id: 'actions',
      label: frameTableColumnsName['actions'],
      align: 'center',
      width: 130,
      sortable: false,
      render: (_v, row) => (
        <FrameTableActionsCell
          productsHref={`/dashboard/buckets/${row.bucketId}/frames/${row.id}/products`}
          onView={() => onViewRow?.(row)}
          onEdit={() => onEditRow?.(row)}
          onShowProducts={(e) => onShowProducts?.(row, e)}
        />
      ),
    },
  ];

  return columns;
};
