'use client';

import { BucketTable } from '..';
import theme from '@/styles/Theme';
import type { MouseEvent } from 'react';
import { MAIN_COLOR } from '@/constants';
import { Box, IconButton } from '@mui/material';
import BucketTableEnabledCell from './enabledCell';
import BucketTableActionsCell from './actionsCell';
import { Column } from '@/components/shared/table';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { bucketTableColumnsName } from '@/components/bucket/data';

export const makeBucketTableColumns = (
  onLocalToggle?: (id: number, next: boolean) => void,
  onViewRow?: (row: BucketTable) => void,
  // onEditRow?: (row: BucketTable) => void,
  onShowFrames?: (row: BucketTable, e?: MouseEvent<HTMLAnchorElement>) => void,
): Column<BucketTable>[] => [
  { id: 'name', label: bucketTableColumnsName['name'], minWidth: 240, align: 'right' },
  { id: 'user', label: bucketTableColumnsName['user'], minWidth: 240, align: 'right' },
  { id: 'identifier', label: bucketTableColumnsName['identifier'], width: 180, align: 'right' },
  {
    id: 'showName',
    label: bucketTableColumnsName['showName'],
    align: 'center',
    width: 128,
    render: (_v, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <IconButton sx={{ color: 'inherit', backgroundColor: theme.palette.grey[200] }}>
          {row.showName ? (
            <TaskAltIcon sx={{ height: '20px', width: '20px', color: 'green' }} />
          ) : (
            <HighlightOffIcon sx={{ height: '20px', width: '20px', color: MAIN_COLOR }} />
          )}
        </IconButton>
      </Box>
    ),
  },
  {
    id: 'enabled',
    label: bucketTableColumnsName['enabled'],
    align: 'center',
    width: 120,
    render: (v, row) => (
      <BucketTableEnabledCell value={!!v} row={row} onLocalToggle={onLocalToggle} />
    ),
  },
  {
    id: 'actions',
    label: bucketTableColumnsName['actions'],
    align: 'center',
    sortable: false,
    width: 90,
    render: (_v, row) => (
      <BucketTableActionsCell
        framesHref={`/dashboard/buckets/${row.id}/frames`}
        onView={() => onViewRow?.(row)}
        // onEdit={() => onEditRow?.(row)}
        onShowFrames={(e) => onShowFrames?.(row, e)}
      />
    ),
  },
];
