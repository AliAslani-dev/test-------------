'use client';

import theme from '@/styles/Theme';
import { OrderTable } from '../table';
import useText from '@/hooks/useText';
import Slide from '@mui/material/Slide';
import CloseIcon from '@mui/icons-material/Close';
import DialogSX from '@/components/shared/dialog/styles';
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import SX from '@/components/order/components/user-dialog/styles';
import CustomTextField from '@/components/shared/custom-text-field';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { AllOrderTable } from '@/components/all-orders/components/table';

interface OrderUserInformationDialogProps {
  open: boolean;
  onClose: () => void;
  showingOrder: OrderTable | AllOrderTable | undefined;
}

const OrderUserInformationDialog: FunctionComponent<OrderUserInformationDialogProps> = ({
  open,
  onClose,
  showingOrder,
}) => {
  const { t } = useText('order');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [mobilePhone, setMobilePhone] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>('');

  const printRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setFirstName(showingOrder?.firstName ?? '');
    setLastName(showingOrder?.lastName ?? '');
    setMobilePhone(showingOrder?.mobilePhone ?? '');
    setPostalCode(showingOrder?.postalCode ?? '');
    setShippingAddress(showingOrder?.shippingAddress ?? '');
  }, [open, showingOrder?.id]);

  const handleClose = () => {
    onClose();
    setFirstName('');
    setLastName('');
    setMobilePhone('');
    setPostalCode('');
    setShippingAddress('');
  };

  const handlePrint = () => {
    if (!printRef.current) {
      window.print();
      return;
    }

    // 1) Create a body-level clone so it's not inside hidden ancestors
    const cloneWrapper = document.createElement('div');
    cloneWrapper.id = '__print_a5_root__';
    cloneWrapper.innerHTML = printRef.current.innerHTML;

    // Fix form controls so values actually print (important for inputs)
    cloneWrapper.querySelectorAll('input').forEach((el) => {
      const input = el as HTMLInputElement;
      input.setAttribute('value', input.value ?? '');
    });
    cloneWrapper.querySelectorAll('textarea').forEach((el) => {
      const ta = el as HTMLTextAreaElement;
      ta.textContent = ta.value ?? '';
    });

    document.body.appendChild(cloneWrapper);

    // 2) Inject A5 print CSS that prints ONLY the clone
    const style = document.createElement('style');
    style.setAttribute('data-a5-print', 'true');
    style.innerHTML = `
      @page {
        size: A5;
        margin: 10mm;
      }

      @media print {
        /* Hide everything except our clone (direct child of body) */
        body > *:not(#__print_a5_root__) {
          display: none !important;
        }

        #__print_a5_root__ {
          display: block !important;
        }

        html, body {
          height: auto !important;
          overflow: visible !important;
          background: #fff !important;
        }

        /* Ensure disabled text is visible in print */
        input, textarea {
          color: #000 !important;
          -webkit-text-fill-color: #000 !important;
          opacity: 1 !important;
        }
      }
    `;
    document.head.appendChild(style);

    // 3) Print
    window.print();

    // 4) Cleanup
    setTimeout(() => {
      document.querySelector('style[data-a5-print="true"]')?.remove();
      document.getElementById('__print_a5_root__')?.remove();
    }, 300);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      slots={isMobile ? { transition: Slide } : undefined}
      slotProps={isMobile ? { transition: { direction: 'up' as const } } : undefined}
      sx={{
        ...DialogSX.dialog,
        ...(isMobile && DialogSX.bottom_sheet_dialog),
      }}
    >
      <Box sx={DialogSX.header_container}>
        <DialogTitle sx={DialogSX.header_title}>
          {t(`user_information_dialog.view.title`)}
        </DialogTitle>

        <IconButton onClick={handleClose} aria-label={t('user_information_dialog.close')}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={DialogSX.dialog_content}>
        {/* This content will be cloned and printed */}
        <Box ref={printRef}>
          <Box sx={SX.dialog_content_wrapper}>
            <Box sx={SX.inputs_wrapper}>
              <Box sx={SX.inner_inputs_wrapper}>
                <CustomTextField
                  id={'firstName'}
                  value={firstName}
                  setValue={setFirstName}
                  title={t('user_information_dialog.first_name')}
                  disabled
                />
                <CustomTextField
                  id={'lastName'}
                  value={lastName}
                  setValue={setLastName}
                  title={t('user_information_dialog.last_name')}
                  disabled
                />
              </Box>

              <Box sx={SX.inner_inputs_wrapper}>
                <CustomTextField
                  id={'mobilePhone'}
                  value={mobilePhone}
                  setValue={setMobilePhone}
                  title={t('user_information_dialog.mobile_phone')}
                  disabled
                  numeric="int"
                  min={-9999999999}
                  max={9999999999}
                  allowNegative
                />
                <CustomTextField
                  id={'postalCode'}
                  value={postalCode}
                  setValue={setPostalCode}
                  title={t('user_information_dialog.postal_code')}
                  disabled
                />
              </Box>

              <CustomTextField
                id="shippingAddress"
                value={shippingAddress}
                setValue={setShippingAddress}
                title={t('user_information_dialog.shipping_address')}
                disabled
                rows={2}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {/* Bottom buttons (NOT visible in print) */}
      <DialogActions
        className="no-print"
        sx={{
          px: 2,
          py: 1.5,
          gap: 1,
          ...(isMobile && {
            position: 'sticky',
            bottom: 0,
            background: theme.palette.background.paper,
            borderTop: '1px solid rgba(0,0,0,0.08)',
          }),
        }}
      >
        <Button
          onClick={handlePrint}
          variant="contained"
          endIcon={<PrintRoundedIcon sx={{ mr: '10px' }} />}
          sx={{
            width: '100%',
            height: '48px',
            borderRadius: '8px',
            mx: '20px',
            fontSize: '16px',
            fontWeight: 600,
            boxShadow: '0',
            marginTop: '24px',
            marginBottom: '24px',
            backgroundColor: '#cbaf71',
          }}
        >
          {t('user_information_dialog.print')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderUserInformationDialog;
