import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Box,
  Button,
  Paper,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { OrderTableRow } from './OrderTableRow';
import { OrderTableFooter } from './OrderTableFooter';
import { OrderTableProps } from '../types';

export const OrderTable = ({
  items,
  catalogFrames,
  canEdit,
  status,
  totalInitialWeight,
  totalFinalWeight,
  nonZeroGalleryItemsCount,
  nonZeroFinalItemsCount,
  finalGoldCredit,
  finalRialCredit,
  onUpdateItem,
  onRemoveItem,
  onAddNewRow,
  onFrameSelect,
  t,
}: OrderTableProps) => (
  <Paper
    sx={{
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      overflow: 'hidden',
      borderRadius: 2,
      border: '1px solid #f0f0f0',
      boxShadow: 'none',
    }}
  >
    <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
      <Table
        stickyHeader
        sx={{
          minWidth: 1300,
          '& .MuiTableCell-root': { borderBottom: '1px solid #f4f4f4' },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              align="center"
              sx={{
                bgcolor: '#fafafa',
                fontWeight: 800,
                color: 'text.secondary',
                width: 50,
                px: 1,
              }}
            >
              {t('dialog.row')}
            </TableCell>
            <TableCell
              align="center"
              sx={{
                bgcolor: '#fafafa',
                fontWeight: 800,
                color: 'text.secondary',
                width: 60,
                px: 1,
              }}
            >
              {t('dialog.image')}
            </TableCell>
            <TableCell
              align="center"
              sx={{ bgcolor: '#fafafa', fontWeight: 800, color: 'text.secondary', minWidth: 160 }}
            >
              {t('dialog.frame')}
            </TableCell>
            <TableCell
              align="center"
              sx={{ bgcolor: '#fafafa', fontWeight: 800, color: 'text.secondary', minWidth: 100 }}
            >
              {t('dialog.carat')}
            </TableCell>
            <TableCell
              align="center"
              sx={{ bgcolor: '#fafafa', fontWeight: 800, color: 'text.secondary', minWidth: 160 }}
            >
              {t('dialog.product')}
            </TableCell>
            <TableCell
              align="center"
              sx={{ bgcolor: '#fafafa', fontWeight: 800, color: 'text.secondary', minWidth: 160 }}
            >
              {t('dialog.weight_of_variant')}
            </TableCell>
            <TableCell
              align="center"
              sx={{
                bgcolor: '#fafafa',
                fontWeight: 800,
                color: 'text.secondary',
                borderRight: '1px dashed #e0e0e0',
                minWidth: 140,
              }}
            >
              {t('dialog.gallery_numbers')}
            </TableCell>
            <TableCell
              align="center"
              sx={{ bgcolor: '#fafafa', fontWeight: 800, color: '#9C7A2B', minWidth: 160 }}
            >
              {t('dialog.wholesaler_numbers')}
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: '#fafafa', width: 60, minWidth: 60, px: 1 }} />
            <TableCell sx={{ bgcolor: '#fafafa', width: 24, minWidth: 24, p: 0 }} />
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item, index) => (
            <OrderTableRow
              key={item.uid}
              item={item}
              index={index}
              catalogFrames={catalogFrames}
              canEdit={canEdit}
              status={status}
              onUpdateItem={onUpdateItem}
              onRemoveItem={onRemoveItem}
              onFrameSelect={onFrameSelect}
              t={t}
            />
          ))}

          <OrderTableFooter
            totalInitialWeight={totalInitialWeight}
            totalFinalWeight={totalFinalWeight}
            nonZeroGalleryItemsCount={nonZeroGalleryItemsCount}
            nonZeroFinalItemsCount={nonZeroFinalItemsCount}
            finalGoldCredit={finalGoldCredit}
            finalRialCredit={finalRialCredit}
            status={status}
            t={t}
          />
        </TableBody>
      </Table>
    </TableContainer>

    {canEdit && (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 1,
          bgcolor: '#fcfcfc',
          borderTop: '1px dashed #e0e0e0',
          flexShrink: 0,
        }}
      >
        <Button
          endIcon={<AddCircleOutlineIcon />}
          onClick={onAddNewRow}
          sx={{ color: '#9C7A2B', fontWeight: 600, gap: 1 }}
        >
          {t('dialog.add_new_row')}
        </Button>
      </Box>
    )}
  </Paper>
);
