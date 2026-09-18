// 'use client';

// import Image from 'next/image';
// import { OrderTable } from '..';
// import useText from '@/hooks/useText';
// import { useEffect, useState } from 'react';
// import { addOrderDocument } from '@/api/wallet/service';
// import { useNotification } from '@/hooks/useNotification';
// import ImageUploader from '@/components/shared/image-uploader';
// import {
//   Box,
//   Tooltip,
//   Skeleton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Typography,
// } from '@mui/material';

// interface OrderTableDocumentCellProps {
//   value: OrderTable['document'];
//   row: OrderTable;
//   onLocalDocument?: (id: number, next: OrderTable['document']) => void;
// }

// export default function OrderTableDocumentCell({
//   value,
//   row,
//   onLocalDocument,
// }: OrderTableDocumentCellProps) {
//   const { t } = useText('order');
//   const { showNotification } = useNotification();
//   const [busy, setBusy] = useState(false);
//   const [pendingFile, setPendingFile] = useState<File | null>(null);
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
//   const [uploaderKey, setUploaderKey] = useState(0);

//   const hasDocument = !!value;

//   useEffect(() => {
//     if (!pendingFile) {
//       if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
//       setPendingPreviewUrl(null);
//       return;
//     }
//     const url = URL.createObjectURL(pendingFile);
//     setPendingPreviewUrl(url);
//     return () => {
//       URL.revokeObjectURL(url);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pendingFile]);

//   const handleUploaderChange = (file: File | null) => {
//     if (!file) return;
//     setPendingFile(file);
//     setConfirmOpen(true);
//   };

//   const handleCancelConfirm = () => {
//     if (busy) return;
//     setConfirmOpen(false);
//     setPendingFile(null);
//     setUploaderKey((k) => k + 1);
//   };

//   const handleConfirm = async () => {
//     if (!pendingFile) return;
//     setBusy(true);

//     try {
//       const res = await addOrderDocument(row.id, pendingFile);
//       const nextUrl = (res && res.image[0]) ?? null;

//       if (!nextUrl || typeof nextUrl !== 'string') {
//         throw new Error('NO_DOCUMENT_URL');
//       }

//       onLocalDocument?.(row.id, nextUrl);

//       showNotification(t('table.document_upload_success'), 'success');

//       setConfirmOpen(false);
//       setPendingFile(null);
//     } catch (err) {
//       console.error(err);
//       showNotification(t('table.document_upload_failed'), 'error');
//     } finally {
//       setBusy(false);
//     }
//   };

//   // 1) Document exists → show tooltip with thumbnail
//   if (hasDocument && typeof value === 'string' && value.trim() !== '') {
//     return (
//       <Tooltip
//         placement="top"
//         enterDelay={300}
//         leaveDelay={0}
//         disableInteractive
//         componentsProps={{
//           tooltip: {
//             sx: {
//               bgcolor: 'background.paper',
//               color: 'text.primary',
//               p: 1,
//               borderRadius: 2,
//               boxShadow: 4,
//               maxWidth: 'none',
//             },
//           },
//         }}
//         title={
//           <Box sx={{ p: 0.5 }}>
//             <Box
//               sx={{
//                 width: 240,
//                 height: 240,
//                 position: 'relative',
//               }}
//             >
//               <Image
//                 src={value}
//                 alt="پیش‌نمایش سند"
//                 fill
//                 sizes="240px"
//                 style={{ objectFit: 'contain' }}
//               />
//             </Box>
//           </Box>
//         }
//       >
//         <Box
//           sx={{
//             width: 40,
//             height: 40,
//             display: 'inline-block',
//             lineHeight: 0,
//             borderRadius: 1,
//             position: 'relative',
//             overflow: 'hidden',
//           }}
//         >
//           <Image src={value} alt="سند" fill sizes="40px" style={{ objectFit: 'contain' }} />
//         </Box>
//       </Tooltip>
//     );
//   }

//   // 2) No document + busy uploading → Skeleton
//   if (busy) {
//     return <Skeleton variant="rounded" width={40} height={40} sx={{ mx: 'auto' }} />;
//   }

//   // 3) No document → compact uploader + confirm dialog
//   return (
//     <>
//       <Box sx={{ width: 40, height: 40, mx: 'auto' }}>
//         <ImageUploader
//           key={uploaderKey}
//           variant="compact"
//           width="100%"
//           height="100%"
//           onChange={handleUploaderChange}
//           disabled={busy}
//           maxFileSizeBytes={6 * 1024 * 1024}
//           maxFileSizeBytesErrorMessage="سایز فایل انتخابی حداکثر ۶ مگابایت باشد."
//         />
//       </Box>

//       <Dialog
//         open={confirmOpen}
//         onClose={busy ? undefined : handleCancelConfirm}
//         maxWidth="xs"
//         fullWidth
//       >
//         <DialogTitle sx={{ fontSize: 14 }}>{t('table.document_confirm_title')}</DialogTitle>
//         <DialogContent sx={{ pt: 1 }}>
//           {pendingPreviewUrl && (
//             <Box
//               sx={{
//                 width: '100%',
//                 display: 'flex',
//                 justifyContent: 'center',
//                 mt: 1,
//               }}
//             >
//               <Box sx={{ width: 240, height: 240, position: 'relative' }}>
//                 <Image
//                   src={pendingPreviewUrl}
//                   alt="پیش‌نمایش تصویر انتخاب شده"
//                   fill
//                   sizes="240px"
//                   style={{ objectFit: 'contain' }}
//                 />
//               </Box>
//             </Box>
//           )}
//           <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
//             {t('table.document_confirm_body')}
//           </Typography>
//         </DialogContent>
//         <DialogActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
//           <Button
//             onClick={handleConfirm}
//             disabled={busy}
//             variant="contained"
//             sx={{ bgcolor: '#cbaf71', boxShadow: '0', ':hover': { boxShadow: '0' } }}
//           >
//             {t('table.confirm')}
//           </Button>
//           <Button onClick={handleCancelConfirm} disabled={busy} color="inherit">
//             {t('table.cancel')}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// }
