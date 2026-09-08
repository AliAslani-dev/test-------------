'use client';

import { useState } from 'react';
import useText from '@/hooks/useText';
import { LoadingButton } from '@mui/lab';
import { useNotification } from '@/hooks/useNotification';
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
import { WholesaleOrderTable } from '..';
import { WholesaleOrderStatusType } from '@/api/order/dto';
import { useLang } from '@/hooks/LanContext';

interface WholesaleOrderStatusCellProps {
  initialValue: WholesaleOrderStatusType;
  orderId: number;
  onChangeStatus?: (id: number, patch: Partial<WholesaleOrderTable>) => void;
}

const WholesaleOrderStatusCell = ({
  initialValue,
  orderId,
  onChangeStatus,
}: WholesaleOrderStatusCellProps) => {
  const { lang } = useLang();
  const { t } = useText('order', lang);
  const { showNotification } = useNotification();

  const [currentValue, setCurrentValue] = useState<WholesaleOrderStatusType>(initialValue);
  const [pendingValue, setPendingValue] = useState<WholesaleOrderStatusType | null>(null);
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

  return (
    <>
      <Select
        value={currentValue}
        disabled
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
    </>
  );
};

export default WholesaleOrderStatusCell;
