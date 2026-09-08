'use client';

import { CategoryTable } from '..';
import { Column } from '@/components/shared/table';
import CategoryTableActionsCell from './actionsCell';
import { categoryTableColumnsName } from '@/components/category/data';

export const makeCategoryTableColumns = (
  onViewRow?: (row: CategoryTable) => void,
  onEditRow?: (row: CategoryTable) => void,
): Column<CategoryTable>[] => [
  { id: 'faName', label: categoryTableColumnsName['faName'], align: 'right' },
  { id: 'enName', label: categoryTableColumnsName['enName'], align: 'right' },
  {
    id: 'actions',
    label: categoryTableColumnsName['actions'],
    align: 'center',
    width: 90,
    sortable: false,
    render: (_v, row) => (
      <CategoryTableActionsCell onView={() => onViewRow?.(row)} onEdit={() => onEditRow?.(row)} />
    ),
  },
];
