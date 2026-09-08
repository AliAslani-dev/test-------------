import { Box, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DialogSX from '@/components/shared/dialog/styles';
import { OrderHeaderProps } from '../types';

export const OrderHeader = ({ orderTitle, onClose, disabled }: OrderHeaderProps) => (
  <Box sx={{ ...DialogSX.header_container, flexShrink: 0 }}>
    <DialogTitle sx={DialogSX.header_title}>
      {orderTitle ? `جزئیات سفارش - ${orderTitle}` : 'جزئیات سفارش'}
    </DialogTitle>
    <IconButton onClick={onClose} disabled={disabled}>
      <CloseIcon sx={{ fontSize: 20 }} />
    </IconButton>
  </Box>
);
