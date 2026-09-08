'use client';

import type { MouseEvent } from 'react';
import { BucketProviderTable } from '..';
import { Column } from '@/components/shared/table';
import BucketProviderTableEnabledCell from './enabledCell';
import BucketProviderTableActionsCell from './actionsCell';
import { bucketProviderTableColumnsName } from '@/components/bucket-provider/data';

export const makeBucketProviderTableColumns = (
  onLocalToggle?: (id: number, next: boolean) => void,
  onViewRow?: (row: BucketProviderTable) => void,
  // onEditRow?: (row: BucketProviderTable) => void,
  onShowFrames?: (row: BucketProviderTable, e?: MouseEvent<HTMLAnchorElement>) => void,
): Column<BucketProviderTable>[] => [
  { id: 'name', label: bucketProviderTableColumnsName['name'], minWidth: 240, align: 'right' },
  // { id: 'identifier', label: bucketProviderTableColumnsName['identifier'], minWidth: 240, align: 'right' },
  {
    id: 'enabled',
    label: bucketProviderTableColumnsName['enabled'],
    align: 'center',
    width: 120,
    render: (v, row) => (
      <BucketProviderTableEnabledCell value={!!v} row={row} onLocalToggle={onLocalToggle} />
    ),
  },
  {
    id: 'actions',
    label: bucketProviderTableColumnsName['actions'],
    align: 'center',
    width: 90,
    sortable: false,
    render: (_v, row) => (
      <BucketProviderTableActionsCell
        framesHref={`/dashboard/buckets/${row.id}/frames`}
        onView={() => onViewRow?.(row)}
        // onEdit={() => onEditRow?.(row)}
        onShowFrames={(e) => onShowFrames?.(row, e)}
      />
    ),
  },
];
