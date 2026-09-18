'use client';

import { OrderTable } from '..';
import { useState } from 'react';
import useText from '@/hooks/useText';
import { LoadingButton } from '@mui/lab';
import { useNotification } from '@/hooks/useNotification';
import { changeOrderStatus, changeTradeGoldStatus } from '@/api/admin/wallet/service';
import {
  Select,
  Dialog,
  MenuItem,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { changeOrderStatusByProvider } from '@/api/wallet/service';

const STATUS_SENT = 'ارسال شده';
const STATUS_CANCELLED = 'لغو شده';
const STATUS_PENDING = 'در حال آماده سازی';
const STATUS_WAITING = 'در انتظار';
const STATUS_COMPLETED = 'تکمیل شده';
const STATUS_RETURNED = 'مرجوعی';
const STATUS_ADMIN_WAITING = 'در انتظار تایید ادمین';

const getAllowedTransitions = (
  currentStatus: string,
  isAdmin: boolean,
  justForView: boolean,
): string[] => {
  if (justForView) {
    return [];
  }

  if (isAdmin) {
    switch (currentStatus) {
      case STATUS_PENDING:
        return [STATUS_SENT, STATUS_CANCELLED];
      case STATUS_SENT:
        return [STATUS_COMPLETED];
      case STATUS_COMPLETED:
        return [STATUS_RETURNED];
      case STATUS_ADMIN_WAITING:
        return [STATUS_COMPLETED, STATUS_CANCELLED];
      default:
        // STATUS_WAITING, STATUS_CANCELLED, STATUS_RETURNED have no manual outgoing transitions
        return [];
    }
  } else {
    switch (currentStatus) {
      case STATUS_PENDING:
        return [STATUS_SENT];
      default:
        return [];
    }
  }
};

interface StatusCellProps {
  initialValue: string;
  orderId: number;
  isAdmin: boolean;
  onChangeOrderStatus?: (id: number, patch: Partial<OrderTable>) => void;
  justForView: boolean;
}

const OrderStatusCell = ({
  initialValue,
  orderId,
  isAdmin,
  onChangeOrderStatus,
  justForView,
}: StatusCellProps) => {
  const { t } = useText('order');
  const { showNotification } = useNotification();

  const [currentValue, setCurrentValue] = useState(initialValue);
  const [pendingValue, setPendingValue] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const allowedTransitions = getAllowedTransitions(currentValue, isAdmin, justForView);
  const isReadOnly = allowedTransitions.length === 0;

  if (isReadOnly) {
    return <Typography sx={{ fontSize: '14px' }}>{currentValue}</Typography>;
  }

  const handleChange = (event: any) => {
    const newValue = event.target.value;
    if (newValue === currentValue) return;

    setPendingValue(newValue);
    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (loading) return;
    if (pendingValue) {
      setLoading(true);
      try {
        if (isAdmin) {
          if (currentValue === STATUS_ADMIN_WAITING) {
            const statusId = pendingValue === STATUS_COMPLETED ? 1 : 0;
            await changeTradeGoldStatus(orderId, statusId);
          } else {
            await changeOrderStatus(orderId, pendingValue);
          }

          showNotification(t('table.order_status_successfully_changed'), 'success');
          setCurrentValue(pendingValue);
          onChangeOrderStatus?.(orderId, { statusTitle: pendingValue });
        } else {
          await changeOrderStatusByProvider(orderId);
          showNotification(t('table.order_status_successfully_changed'), 'success');
          setCurrentValue(pendingValue);
          onChangeOrderStatus?.(orderId, { statusTitle: pendingValue });
        }
      } catch (error) {
        showNotification(t('table.order_status_change_err'), 'error');
        console.error('Failed to update status', error);
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
          '& .MuiSelect-select': { py: 0.5, px: 1 },
          minWidth: '160px',
        }}
      >
        <MenuItem value={currentValue} sx={{ display: 'none' }}>
          {currentValue}
        </MenuItem>

        {allowedTransitions.map((status) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </Select>

      <Dialog open={isDialogOpen} onClose={handleCancel}>
        <DialogTitle sx={{ fontFamily: 'inherit' }}>تغییر وضعیت سفارش</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: 'inherit' }}>
            آیا از تغییر وضعیت سفارش به <strong>"{pendingValue}"</strong> اطمینان دارید؟
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ gap: '10px' }}>
          <LoadingButton
            loading={loading}
            onClick={handleCancel}
            color="inherit"
            sx={{ fontFamily: 'inherit', boxShadow: 0, ':hover': { boxShadow: 0 } }}
          >
            انصراف
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
            تایید
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderStatusCell;
