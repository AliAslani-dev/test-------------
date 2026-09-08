'use client';

import { OrganizationTable } from '..';
import { Column } from '@/components/shared/table';
import OrganizationTableActionsCell from './actionsCell';
import { organizationTableColumnsName } from '@/components/organization/data';
import { Box, Chip } from '@mui/material';

export const makeOrganizationTableColumns = (
  onViewRow?: (row: OrganizationTable) => void,
  onEditRow?: (row: OrganizationTable) => void,
): Column<OrganizationTable>[] => [
  { 
    id: 'faName', 
    label: organizationTableColumnsName['faName'], 
    align: 'right' 
  },
  { 
    id: 'enName', 
    label: organizationTableColumnsName['enName'], 
    align: 'right' 
  },
  { 
    id: 'commission', 
    label: organizationTableColumnsName['commission'], 
    align: 'center',
    render: (value) => (
      <Box>
        {value}%
      </Box>
    ),
  },
  { 
    id: 'isEnabled', 
    label: organizationTableColumnsName['isEnabled'], 
    align: 'center',
    render: (value) => (
      <Chip 
        label={value ? 'فعال' : 'غیرفعال'} 
        color={value ? 'success' : 'error'}
        size="small"
        sx={{ minWidth: 60 }}
      />
    ),
  },
  {
    id: 'actions',
    label: organizationTableColumnsName['actions'],
    align: 'center',
    width: 120,
    sortable: false,
    render: (_v, row) => (
      <OrganizationTableActionsCell 
        onView={() => onViewRow?.(row)} 
        onEdit={() => onEditRow?.(row)} 
      />
    ),
  },
];