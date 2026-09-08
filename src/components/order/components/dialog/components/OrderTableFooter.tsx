import { TableRow, TableCell } from '@mui/material';
import { tPD } from '@/utils';
import { OrderTableFooterProps } from '../types';

export const OrderTableFooter = ({
  totalInitialWeight,
  totalFinalWeight,
  nonZeroGalleryItemsCount,
  nonZeroFinalItemsCount,
  finalGoldCredit,
  finalRialCredit,
  status,
  t,
}: OrderTableFooterProps) => (
  <>
    <TableRow sx={{ bgcolor: '#fafafa' }}>
      <TableCell colSpan={5} />
      <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary' }}>
        {t('dialog.total_initial_amount')}
      </TableCell>
      <TableCell
        align="center"
        sx={{ fontWeight: 800, color: 'text.secondary', borderRight: '1px dashed #e0e0e0' }}
      >
        {tPD(totalInitialWeight.toFixed(3))} {t('dialog.grams')}
      </TableCell>
      <TableCell align="center" sx={{ fontWeight: 900, color: '#9C7A2B', fontSize: '1.1rem' }}>
        {status === 0 ? '—' : `${tPD(totalFinalWeight.toFixed(3))} ${t('dialog.grams')}`}
      </TableCell>
      <TableCell colSpan={2} />
    </TableRow>

    <TableRow sx={{ bgcolor: '#fafafa' }}>
      <TableCell colSpan={5} />
      <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary' }}>
        {t('dialog.active_rows_count')}
      </TableCell>
      <TableCell
        align="center"
        sx={{ fontWeight: 800, color: 'text.secondary', borderRight: '1px dashed #e0e0e0' }}
      >
        {`${tPD(nonZeroGalleryItemsCount)} ${t('dialog.rows')}`}
      </TableCell>
      <TableCell align="center" sx={{ fontWeight: 900, color: '#9C7A2B', fontSize: '1.1rem' }}>
        {status === 0 ? '—' : `${tPD(nonZeroFinalItemsCount)} ${t('dialog.rows')}`}
      </TableCell>
      <TableCell colSpan={2} />
    </TableRow>

    {finalGoldCredit !== undefined && finalGoldCredit !== null && status >= 2 && (
      <TableRow sx={{ bgcolor: '#fafafa' }}>
        <TableCell colSpan={5} />
        <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {t('dialog.final_gold_credit')}
        </TableCell>
        <TableCell
          align="center"
          sx={{ fontWeight: 800, color: 'text.secondary', borderRight: '1px dashed #e0e0e0' }}
        >
          —
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 900, color: '#9C7A2B', fontSize: '1.1rem' }}>
          {tPD(finalGoldCredit.toFixed(3))} {t('dialog.grams')}
        </TableCell>
        <TableCell colSpan={2} />
      </TableRow>
    )}

    {finalRialCredit !== undefined && finalRialCredit !== null && status >= 2 && (
      <TableRow sx={{ bgcolor: '#fafafa' }}>
        <TableCell colSpan={5} />
        <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {t('dialog.final_rial_credit')}
        </TableCell>
        <TableCell
          align="center"
          sx={{ fontWeight: 800, color: 'text.secondary', borderRight: '1px dashed #e0e0e0' }}
        >
          —
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 900, color: '#9C7A2B', fontSize: '1.1rem' }}>
          {tPD(finalRialCredit.toLocaleString())} {t('dialog.rial')}
        </TableCell>
        <TableCell colSpan={2} />
      </TableRow>
    )}
  </>
);
