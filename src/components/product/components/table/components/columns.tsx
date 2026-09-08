'use client';

import Image from 'next/image';
import { ProductTable } from '..';
import { Box, Tooltip } from '@mui/material';
import { Column } from '@/components/shared/table';
import ProductTableActionsCell from './actionsCell';
import { productTableColumnsName } from '@/components/product/data';

export const makeProductTableColumns = (
  onViewRow?: (row: ProductTable) => void,
  onEditRow?: (row: ProductTable) => void,
): Column<ProductTable>[] => {
  const columns: Column<ProductTable>[] = [
    // {
    //   id: 'rowNumber',
    //   label: '',
    //   align: 'right',
    //   render: (v) => <Typography fontSize="14px">{String(tPD(v as number))}</Typography>,
    //   sortable: false,
    // },
    {
      id: 'image',
      label: productTableColumnsName['image'],
      // minWidth: 40,
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
    { id: 'model', label: productTableColumnsName['model'], align: 'right' },
    {
      id: 'actions',
      label: productTableColumnsName['actions'],
      align: 'center',
      width: 110,
      sortable: false,
      render: (_v, row) => (
        <ProductTableActionsCell onView={() => onViewRow?.(row)} onEdit={() => onEditRow?.(row)} />
      ),
    },
  ];

  return columns;
};
