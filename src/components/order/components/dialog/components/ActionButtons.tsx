import { Box, Button } from '@mui/material';
import { ActionButtonsProps } from '../types';

export const ActionButtons = ({
  status,
  loadingAction,
  isMobile,
  hasItems,
  onReject,
  onInProgress,
  onApprove,
  onDeliver,
  deliverDisabled = false,
  t,
}: ActionButtonsProps) => {
  const shouldShowActions = status >= 0 && status <= 3;

  if (!shouldShowActions) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        width: { xs: '100%', sm: 'auto' },
        ml: { sm: 'auto' },
      }}
    >
      {(status === 0 || status === 1) && (
        <Button
          variant="outlined"
          color="error"
          fullWidth={isMobile}
          disabled={loadingAction}
          onClick={onReject}
          sx={{ fontWeight: 700, borderRadius: 2 }}
        >
          {t('dialog.reject_order')}
        </Button>
      )}

      {status === 0 && (
        <Button
          variant="outlined"
          color="info"
          fullWidth={isMobile}
          disabled={loadingAction}
          onClick={onInProgress}
          sx={{ fontWeight: 700, borderRadius: 2 }}
        >
          {t('dialog.in_progress')}
        </Button>
      )}

      {status === 1 && (
        <Button
          variant="contained"
          fullWidth={isMobile}
          onClick={onApprove}
          disabled={loadingAction || !hasItems}
          sx={{
            bgcolor: '#9C7A2B',
            '&:hover': { bgcolor: '#7A5C1F' },
            px: 4,
            borderRadius: 2,
            fontWeight: 800,
            boxShadow: 'none',
          }}
        >
          {t('dialog.approve_order')}
        </Button>
      )}

      {status === 3 && (
        <Button
          variant="contained"
          fullWidth={isMobile}
          onClick={onDeliver}
          disabled={loadingAction || deliverDisabled}
          sx={{
            bgcolor: '#9C7A2B',
            '&:hover': { bgcolor: '#7A5C1F' },
            px: 4,
            borderRadius: 2,
            fontWeight: 800,
            boxShadow: 'none',
          }}
        >
          {t('dialog.deliver_order')}
        </Button>
      )}
    </Box>
  );
};
