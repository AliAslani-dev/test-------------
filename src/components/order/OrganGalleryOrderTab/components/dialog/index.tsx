// 'use client';

// import theme from '@/styles/Theme';
// import FactorPreview from './factor';
// import useText from '@/hooks/useText';
// import { OrderTable } from '../table';
// import Slide from '@mui/material/Slide';
// import { LoadingButton } from '@mui/lab';
// import { useReactToPrint } from 'react-to-print';
// import CloseIcon from '@mui/icons-material/Close';
// import DialogSX from '@/components/shared/dialog/styles';
// import { useNotification } from '@/hooks/useNotification';
// import { FunctionComponent, useRef, useState } from 'react';
// import SX from '@/components/order/components/dialog/styles';
// import { Box, Dialog, DialogContent, DialogTitle, IconButton, useMediaQuery } from '@mui/material';
// import { AllOrderTable } from '@/components/all-orders/components/table';

// interface OrderDialogProps {
//   open: boolean;
//   onClose: () => void;
//   showingOrder: OrderTable | AllOrderTable | undefined;
// }

// const OrderDialog: FunctionComponent<OrderDialogProps> = ({ open, onClose, showingOrder }) => {
//   const { t } = useText('order');
//   const { showNotification } = useNotification();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

//   const [loading, setLoading] = useState<boolean>(false);
//   const printContentRef = useRef<HTMLDivElement | null>(null);

//   const handlePrint = useReactToPrint({
//     contentRef: printContentRef,
//     documentTitle: showingOrder ? `order-${showingOrder.id}` : 'order',
//     pageStyle: `
//       @page {
//         size: A5 portrait;
//         margin: 0;
//       }
//       @media print {
//         body {
//           margin: 0;
//           -webkit-print-color-adjust: exact;
//           print-color-adjust: exact;
//           background: #f5f5f7;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           min-height: 100vh;
//         }
//         #order-print-page {
//           margin-top: 40px;
//           width: calc(100% - 20mm);
//           height: calc(100% - 20mm);
//           border: 2px solid rgb(239, 239, 239);
//           border-radius: 16px;
//           padding: 20px;
//           background: #fff;
//           box-sizing: border-box;
//           display: flex;
//           flex-direction: column;
//         }
//       }
//     `,
//   });

//   const onButtonClick = () => {
//     if (!showingOrder) {
//       showNotification(t('table.no_data_to_display'), 'error');
//       return;
//     }
//     handlePrint();
//   };

//   const handleClose = () => {
//     if (loading) return;
//     onClose();
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={handleClose}
//       fullWidth
//       maxWidth="sm"
//       fullScreen={isMobile}
//       slots={isMobile ? { transition: Slide } : undefined}
//       slotProps={isMobile ? { transition: { direction: 'up' as const } } : undefined}
//       sx={{
//         ...DialogSX.dialog,
//         ...(isMobile && DialogSX.bottom_sheet_dialog),
//       }}
//     >
//       <Box sx={DialogSX.header_container}>
//         <DialogTitle sx={DialogSX.header_title}>{t(`dialog.view.title`)}</DialogTitle>
//         <IconButton onClick={handleClose} aria-label={t('dialog.close')}>
//           <CloseIcon sx={{ fontSize: 20 }} />
//         </IconButton>
//       </Box>

//       <DialogContent sx={DialogSX.dialog_content}>
//         <Box sx={SX.dialog_content_wrapper}>
//           <Box sx={SX.print_preview_wrapper}>
//             <Box ref={printContentRef} sx={SX.print_page} id="order-print-page">
//               <FactorPreview data={showingOrder} />
//             </Box>
//           </Box>
//           <LoadingButton
//             onClick={onButtonClick}
//             variant="contained"
//             sx={SX.continue_button}
//             loading={loading}
//           >
//             {t(`dialog.view.button`)}
//           </LoadingButton>
//         </Box>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default OrderDialog;
