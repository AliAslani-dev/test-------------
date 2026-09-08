'use client';

import { useState } from 'react';
import useText from '@/hooks/useText';
import { FollowRequestTable } from '..';
import { LoadingButton } from '@mui/lab';
import { useNotification } from '@/hooks/useNotification';
import { FollowRequestStatusType } from '@/api/follower/dto';
import { followRequestChangeStatus } from '@/api/follower/service';
import {
  Select,
  Dialog,
  MenuItem,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

interface FollowRequestStatusCellProps {
  initialValue: FollowRequestStatusType;
  requestId: number;
  onChangeStatus?: (id: number, patch: Partial<FollowRequestTable>) => void;
}

const FollowRequestStatusCell = ({
  initialValue,
  requestId,
  onChangeStatus,
}: FollowRequestStatusCellProps) => {
  const { t } = useText('followers');
  const { showNotification } = useNotification();

  const [currentValue, setCurrentValue] = useState<FollowRequestStatusType>(initialValue);
  const [pendingValue, setPendingValue] = useState<FollowRequestStatusType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const STATUS_LABELS: Record<number, string> = {
    [-1]: t('table.rejected'),
    [0]: t('table.waiting'),
    [1]: t('table.approved'),
  };

  const STATUS_COLORS: Record<number, string> = {
    [-1]: '#d32f2f', // Red
    [0]: '#1976d2', // Blue
    [1]: '#2e7d32', // Green
  };

  const activeColor = STATUS_COLORS[currentValue] || '#ccc';

  const handleChange = (event: any) => {
    const newValue = Number(event.target.value) as FollowRequestStatusType;
    if (newValue === currentValue) return;

    setPendingValue(newValue);
    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (loading) return;
    if (pendingValue !== null) {
      setLoading(true);
      try {
        await followRequestChangeStatus(requestId, pendingValue);
        showNotification(t('table.status_successfully_changed'), 'success');
        setCurrentValue(pendingValue);
        onChangeStatus?.(requestId, { approved: pendingValue });
      } catch (error) {
        showNotification(t('table.status_change_err'), 'error');
        console.error('Failed to update request status', error);
      } finally {
        setLoading(false);
      }
    }
    setIsDialogOpen(false);
    setPendingValue(null);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setPendingValue(null);
  };

  return (
    <>
      <Select
        value={currentValue}
        onChange={handleChange}
        size="small"
        sx={{
          fontSize: '14px',
          backgroundColor: '#fff',
          borderRadius: '100px',
          minWidth: '160px',
          color: activeColor,

          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: activeColor,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: activeColor,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: activeColor,
          },
          '& .MuiSelect-select': { py: 0.5, px: 1 },
        }}
      >
        <MenuItem value={0}>{STATUS_LABELS[0]}</MenuItem>
        <MenuItem value={1}>{STATUS_LABELS[1]}</MenuItem>
        <MenuItem value={-1}>{STATUS_LABELS[-1]}</MenuItem>
      </Select>

      <Dialog open={isDialogOpen} onClose={handleCancel}>
        <DialogTitle sx={{ fontFamily: 'inherit' }}>{t('table.dialog_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: 'inherit' }}>
            {t('table.dialog_content_1')}{' '}
            <strong>"{pendingValue !== null ? STATUS_LABELS[pendingValue] : ''}"</strong>{' '}
            {t('table.dialog_content_2')} {t('table.dialog_content_3')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ gap: '10px' }}>
          <LoadingButton
            loading={loading}
            onClick={handleCancel}
            color="inherit"
            sx={{ fontFamily: 'inherit', boxShadow: 0, ':hover': { boxShadow: 0 } }}
          >
            {t('table.cancel')}
          </LoadingButton>
          <LoadingButton
            loading={loading}
            onClick={handleConfirm}
            variant="contained"
            color="primary"
            sx={{
              fontFamily: 'inherit',
              bgcolor: '#A67C00',
              boxShadow: 0,
              ':hover': { boxShadow: 0 },
            }}
          >
            {t('table.confirm')}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FollowRequestStatusCell;
