import { Box, Typography, Chip, Button, alpha } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SortIcon from '@mui/icons-material/Sort';
import { getStatusDetails } from '../utils/statusUtils';
import { OrderInfoBarProps } from '../types';

export const OrderInfoBar = ({
  zarplusUser,
  orderTitle,
  status,
  onExport,
  onSort,
  isExporting,
  hasItems,
  t,
}: OrderInfoBarProps) => {
  const { label: statusLabel, colorKey: statusColorKey } = getStatusDetails(status);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#9C7A2B' }}>
          {t('dialog.order_from')} {zarplusUser}
          {orderTitle ? ` - ${orderTitle}` : ''}
        </Typography>
        <Chip
          label={statusLabel}
          size="small"
          sx={(theme) => {
            const colorObj = theme.palette[statusColorKey as keyof typeof theme.palette] as any;
            return {
              bgcolor: alpha(colorObj?.main || theme.palette.grey[500], 0.16),
              color: colorObj?.dark || theme.palette.grey[700],
              fontWeight: 600,
              fontSize: '0.8125rem',
            };
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Button
          variant="text"
          size="small"
          onClick={onExport}
          disabled={isExporting || !hasItems}
          endIcon={<DownloadIcon sx={{ mr: '3px' }} />}
          sx={{
            color: '#9C7A2B',
            fontWeight: 700,
            '&:hover': { backgroundColor: 'transparent', opacity: 0.8 },
          }}
        >
          {isExporting ? t('dialog.submitting') : t('dialog.export_excel')}
        </Button>

        <Button
          endIcon={<SortIcon />}
          onClick={onSort}
          sx={{ color: 'text.secondary', fontWeight: 600, gap: 1 }}
        >
          {t('dialog.sort_group')}
        </Button>
      </Box>
    </Box>
  );
};
