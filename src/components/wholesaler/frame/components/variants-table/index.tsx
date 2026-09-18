'use client';

import useText from '@/hooks/useText';
import { FunctionComponent } from 'react';
import { ProductVariant } from '@/api/product/dto';
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

interface ProductVariantsTableProps {
  variants: ProductVariant[];
}

const ProductVariantsTable: FunctionComponent<ProductVariantsTableProps> = ({ variants }) => {
  const { t } = useText('frame');

  if (!variants || variants.length === 0) return null;

  return (
    <Box
      sx={{
        marginX: 0.5,
        marginY: 2,
        padding: 2,
        paddingBottom: 3,
        backgroundColor: 'rgba(0,0,0, 0.02)',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      <Table size="small" aria-label="product-variants" sx={{ width: 340 }}>
        <TableHead>
          <TableRow
            sx={{
              '& th': {
                borderBottom: (theme) => `1px solid ${theme.palette.divider} !important`,
              },
            }}
          >
            <TableCell align="center">{t('dialog.variant.stock')}</TableCell>
            <TableCell align="center">{t('dialog.variant.weight')}</TableCell>
            {/* <TableCell align="center">{t('dialog.variant.id')}</TableCell> */}
          </TableRow>
        </TableHead>

        <TableBody>
          {variants.map((variant, idx) => (
            <TableRow key={variant.id ?? `row_${idx}`}>
              <TableCell align="center" sx={{ width: '120px' }}>
                {variant.stock ?? 0}
              </TableCell>
              <TableCell align="center">{variant.weight ?? 0}</TableCell>
              {/* <TableCell align="center">{variant.id ?? '-'}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ProductVariantsTable;
