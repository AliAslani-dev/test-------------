'use client';

import theme from '@/styles/Theme';
import useText from '@/hooks/useText';
import { OrderTable } from '../table';
import { NAME_RE } from '@/constants';
import Slide from '@mui/material/Slide';
import { LoadingButton } from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';
import DialogSX from '@/components/shared/dialog/styles';
import { useNotification } from '@/hooks/useNotification';
import ImageUploader from '@/components/shared/image-uploader';
import CustomTextField from '@/components/shared/custom-text-field';
import SX from '@/components/order/components/document-dialog/styles';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { addOrderDocument, addOrderDocumentInfo, getSendMethods } from '@/api/wallet/service';
import {
  editOrderDocument as adminEditOrderDocument,
  editOrderDocumentInfo as adminAddOrderDocumentInfo,
} from '@/api/admin/wallet/service';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { AllOrderTable } from '@/components/all-orders/components/table';
import { getTwoFStatus } from '@/utils/auth';
import { TwoFStatusDTO } from '@/api/auth/dto';

interface OrderDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  showingOrder: OrderTable | AllOrderTable | undefined;
  onEdited: (id: number, patch: Partial<OrderTable | AllOrderTable>) => void;
  justForView: boolean;
}

const OrderDocumentDialog: FunctionComponent<OrderDocumentDialogProps> = ({
  open,
  onClose,
  showingOrder,
  onEdited,
  justForView,
}) => {
  const { t } = useText('order');
  const { showNotification } = useNotification();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const twof = getTwoFStatus<TwoFStatusDTO>();
  const isAdmin = useMemo(() => {
    const adminRoles = ['admin', 'zarplus-admin'];
    return adminRoles.includes(twof?.role ?? '');
  }, [twof?.role]);

  const [trackingCode, setTrackingCode] = useState<string>('');
  const [sendMethod, setSendMethod] = useState<string>('not-selected');
  const [description, setDescription] = useState<string>('');

  const [sendMethods, setSendMethods] = useState<string[]>([]);
  const [sendMethodsLoading, setSendMethodsLoading] = useState<boolean>(false);
  const [sendMethodsError, setSendMethodsError] = useState<string>('');

  const [productImage, setProductImage] = useState<string>('');
  const [productFile, setProductFile] = useState<File | null>(null);

  const [scalesImage, setScalesImage] = useState<string>('');
  const [scalesFile, setScalesFile] = useState<File | null>(null);

  const [packageImage, setPackageImage] = useState<string>('');
  const [packageFile, setPackageFile] = useState<File | null>(null);

  const [postBoxImage, setPostBoxImage] = useState<string>('');
  const [postBoxFile, setPostBoxFile] = useState<File | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  // Prefill form when dialog opens
  useEffect(() => {
    if (!open || !showingOrder) return;

    setProductImage(showingOrder.documents?.product ?? '');
    setScalesImage(showingOrder.documents?.scales ?? '');
    setPackageImage(showingOrder.documents?.package ?? '');
    setPostBoxImage(showingOrder.documents?.post_box ?? '');

    setTrackingCode(showingOrder.documents?.tracking_code ?? '');
    setSendMethod(showingOrder.documents?.send_method || 'not-selected');
    setDescription(showingOrder.documents?.description ?? '');

    setProductFile(null);
    setScalesFile(null);
    setPackageFile(null);
    setPostBoxFile(null);
  }, [open, showingOrder]);

  // Fetch send methods from API when dialog opens
  useEffect(() => {
    if (!open) return;

    let alive = true;

    (async () => {
      try {
        setSendMethodsError('');
        setSendMethodsLoading(true);

        const methods = await getSendMethods();
        if (!alive) return;

        const safeMethods = Array.isArray(methods) ? methods : [];
        setSendMethods(safeMethods);

        // Keep current value if it exists in methods, otherwise fallback to 'not-selected'
        setSendMethod((prev) => {
          if (prev && prev !== 'not-selected' && safeMethods.includes(prev)) return prev;
          return 'not-selected';
        });
      } catch (e) {
        if (!alive) return;
        setSendMethods([]);
        setSendMethodsError('خطا در دریافت روش‌های ارسال');
        console.error('getSendMethods failed', e);
      } finally {
        if (alive) setSendMethodsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open]);

  const editFormIsValid = useMemo(() => {
    const hasNewFiles =
      productFile !== null || scalesFile !== null || packageFile !== null || postBoxFile !== null;

    const originalProduct = showingOrder?.documents?.product ?? '';
    const originalScales = showingOrder?.documents?.scales ?? '';
    const originalPackage = showingOrder?.documents?.package ?? '';
    const originalPostBox = showingOrder?.documents?.post_box ?? '';

    const hasDeletedFiles =
      (originalProduct !== '' && productImage === '') ||
      (originalScales !== '' && scalesImage === '') ||
      (originalPackage !== '' && packageImage === '') ||
      (originalPostBox !== '' && postBoxImage === '');

    const originalTracking = showingOrder?.documents?.tracking_code ?? '';
    const originalSendMethod = showingOrder?.documents?.send_method || 'not-selected';
    const originalDescription = showingOrder?.documents?.description ?? '';

    const hasInfoChanges =
      trackingCode !== originalTracking ||
      sendMethod !== originalSendMethod ||
      description !== originalDescription;

    return hasNewFiles || hasDeletedFiles || hasInfoChanges;
  }, [
    productFile,
    scalesFile,
    packageFile,
    postBoxFile,
    productImage,
    scalesImage,
    packageImage,
    postBoxImage,
    trackingCode,
    sendMethod,
    description,
    showingOrder,
  ]);

  const onButtonClick = async () => {
    if (loading || !showingOrder?.id) return;
    setLoading(true);

    try {
      const promises: Promise<any>[] = [];

      const processFile = (file: File | null, key: string) => {
        if (isAdmin) {
          return adminEditOrderDocument(showingOrder.id, key as any, file).then((res: any) => ({
            type: 'file',
            key,
            url: res?.image?.[key] || '',
          }));
        } else {
          if (!file) return Promise.resolve({ type: 'file', key, url: '' });

          return addOrderDocument(showingOrder.id, key as any, file).then((res: any) => ({
            type: 'file',
            key,
            url: res?.image?.[key] || '',
          }));
        }
      };

      const originalProduct = showingOrder.documents?.product ?? '';
      if (productFile !== null) promises.push(processFile(productFile, 'product'));
      else if (originalProduct !== '' && productImage === '')
        promises.push(processFile(null, 'product'));

      const originalScales = showingOrder.documents?.scales ?? '';
      if (scalesFile !== null) promises.push(processFile(scalesFile, 'scales'));
      else if (originalScales !== '' && scalesImage === '')
        promises.push(processFile(null, 'scales'));

      const originalPackage = showingOrder.documents?.package ?? '';
      if (packageFile !== null) promises.push(processFile(packageFile, 'package'));
      else if (originalPackage !== '' && packageImage === '')
        promises.push(processFile(null, 'package'));

      const originalPostBox = showingOrder.documents?.post_box ?? '';
      if (postBoxFile !== null) promises.push(processFile(postBoxFile, 'post_box'));
      else if (originalPostBox !== '' && postBoxImage === '')
        promises.push(processFile(null, 'post_box'));

      const originalTracking = showingOrder.documents?.tracking_code ?? '';
      const originalSendMethod = showingOrder.documents?.send_method || 'not-selected';
      const originalDescription = showingOrder.documents?.description ?? '';

      const infoHasChanged =
        trackingCode !== originalTracking ||
        sendMethod !== originalSendMethod ||
        description !== originalDescription;

      if (infoHasChanged) {
        if (isAdmin) {
          const finalSendMethod = sendMethod === 'not-selected' ? null : sendMethod;
          promises.push(
            adminAddOrderDocumentInfo(
              showingOrder.id,
              finalSendMethod,
              trackingCode,
              description,
            ).then(() => ({
              type: 'info',
              tracking_code: trackingCode,
              send_method: sendMethod,
              description: description,
            })),
          );
        } else {
          promises.push(
            addOrderDocumentInfo(showingOrder.id, sendMethod, trackingCode, description).then(
              () => ({
                type: 'info',
                tracking_code: trackingCode,
                send_method: sendMethod,
                description: description,
              }),
            ),
          );
        }
      }

      if (promises.length === 0) {
        handleClose();
        setLoading(false);
        return;
      }

      const results = await Promise.all(promises);

      const updatedDocuments: any = { ...(showingOrder.documents || {}) };
      let hasChanges = false;

      results.forEach((res) => {
        if (res.type === 'file') {
          updatedDocuments[res.key] = res.url;
          hasChanges = true;
        } else if (res.type === 'info') {
          updatedDocuments.tracking_code = res.tracking_code;
          updatedDocuments.send_method = res.send_method;
          updatedDocuments.description = res.description;
          hasChanges = true;
        }
      });

      if (hasChanges && onEdited) {
        onEdited(showingOrder.id, { documents: updatedDocuments });
      }

      showNotification(t('dialog.documents.success_notification'), 'success');
      handleClose();
    } catch (e) {
      showNotification(t('dialog.documents.error_notification'), 'error');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
    setProductFile(null);
    setScalesFile(null);
    setPackageFile(null);
    setPostBoxFile(null);
  };

  if (!showingOrder) return null;

  const isSendMethodFilled =
    !!showingOrder.documents?.send_method && showingOrder.documents.send_method !== 'not-selected';
  const isTrackingCodeFilled = !!showingOrder.documents?.tracking_code;
  const isDescriptionFilled = !!showingOrder.documents?.description;
  const isProductFilled = !!showingOrder.documents?.product;
  const isScalesFilled = !!showingOrder.documents?.scales;
  const isPackageFilled = !!showingOrder.documents?.package;
  const isPostBoxFilled = !!showingOrder.documents?.post_box;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      fullScreen={isMobile}
      slots={isMobile ? { transition: Slide } : undefined}
      slotProps={isMobile ? { transition: { direction: 'up' as const } } : undefined}
      sx={{
        ...DialogSX.dialog,
        ...(isMobile && DialogSX.bottom_sheet_dialog),
      }}
    >
      <Box sx={DialogSX.header_container}>
        <DialogTitle sx={DialogSX.header_title}>{t('dialog.documents.title')}</DialogTitle>
        <IconButton onClick={handleClose} aria-label={t('dialog.documents.close')}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={DialogSX.dialog_content}>
        <Box sx={SX.dialog_content_wrapper}>
          <Box sx={SX.inputs_wrapper}>
            <Box sx={SX.row_two_col}>
              <Box sx={SX.select}>
                <Typography sx={SX.select_title}>{t('dialog.documents.send_method')}</Typography>

                <Select
                  size="small"
                  fullWidth
                  labelId="send-method-label"
                  id="sendMethod"
                  value={sendMethod}
                  displayEmpty
                  disabled={sendMethodsLoading || justForView || (!isAdmin && isSendMethodFilled)}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E7E6E6',
                    },
                  }}
                  onChange={(e) => setSendMethod(String(e.target.value))}
                  renderValue={(selected) => {
                    if (sendMethodsLoading) return 'در حال دریافت...';
                    if (selected === 'not-selected') return 'انتخاب نشده';
                    return selected;
                  }}
                >
                  <MenuItem value="not-selected">انتخاب نشده</MenuItem>

                  {sendMethods.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}

                  {!!sendMethodsError && (
                    <MenuItem disabled value="__error__">
                      {sendMethodsError}
                    </MenuItem>
                  )}
                </Select>
              </Box>

              <CustomTextField
                id="trackingCode"
                disabled={justForView || (!isAdmin && isTrackingCodeFilled)}
                value={trackingCode}
                setValue={setTrackingCode}
                title={t('dialog.documents.tracking_code')}
                validate={(v) => (v ? NAME_RE.test(v.trim()) : true)}
              />
            </Box>

            <Box sx={{ width: '100%', mt: 1 }}>
              <CustomTextField
                id="description"
                disabled={justForView || (!isAdmin && isDescriptionFilled)}
                value={description}
                setValue={setDescription}
                title={t('dialog.documents.description') || 'توضیحات'}
              />
            </Box>

            <Box sx={SX.row_two_col}>
              <Box sx={SX.uploader_wrapper}>
                <Box sx={SX.uploader_wrapper_header}>
                  <Typography sx={SX.uploader_title}>{t('dialog.documents.product')}</Typography>
                </Box>
                <ImageUploader
                  value={productFile ?? undefined}
                  onChange={(f) => {
                    setProductFile(f);
                    setProductImage('');
                  }}
                  defaultValueUrl={productImage ?? undefined}
                  disabled={justForView || (!isAdmin && isProductFilled)}
                  height={200}
                  maxFileSizeBytes={6 * 1024 * 1024}
                  maxFileSizeBytesErrorMessage="سایز فایل انتخابی حداکثر ۶ مگابایت باشد."
                  supportedSizeText="حجم فایل: حداکثر ۶ مگابایت"
                />
              </Box>

              <Box sx={SX.uploader_wrapper}>
                <Box sx={SX.uploader_wrapper_header}>
                  <Typography sx={SX.uploader_title}>{t('dialog.documents.scales')}</Typography>
                </Box>
                <ImageUploader
                  value={scalesFile ?? undefined}
                  onChange={(f) => {
                    setScalesFile(f);
                    setScalesImage('');
                  }}
                  defaultValueUrl={scalesImage ?? undefined}
                  disabled={justForView || (!isAdmin && isScalesFilled)}
                  height={200}
                  maxFileSizeBytes={6 * 1024 * 1024}
                  maxFileSizeBytesErrorMessage="سایز فایل انتخابی حداکثر ۶ مگابایت باشد."
                  supportedSizeText="حجم فایل: حداکثر ۶ مگابایت"
                />
              </Box>
            </Box>

            <Box sx={SX.row_two_col}>
              <Box sx={SX.uploader_wrapper}>
                <Box sx={SX.uploader_wrapper_header}>
                  <Typography sx={SX.uploader_title}>{t('dialog.documents.package')}</Typography>
                </Box>
                <ImageUploader
                  value={packageFile ?? undefined}
                  onChange={(f) => {
                    setPackageFile(f);
                    setPackageImage('');
                  }}
                  defaultValueUrl={packageImage ?? undefined}
                  disabled={justForView || (!isAdmin && isPackageFilled)}
                  height={200}
                  maxFileSizeBytes={6 * 1024 * 1024}
                  maxFileSizeBytesErrorMessage="سایز فایل انتخابی حداکثر ۶ مگابایت باشد."
                  supportedSizeText="حجم فایل: حداکثر ۶ مگابایت"
                />
              </Box>

              <Box sx={SX.uploader_wrapper}>
                <Box sx={SX.uploader_wrapper_header}>
                  <Typography sx={SX.uploader_title}>{t('dialog.documents.post_box')}</Typography>
                </Box>
                <ImageUploader
                  value={postBoxFile ?? undefined}
                  onChange={(f) => {
                    setPostBoxFile(f);
                    setPostBoxImage('');
                  }}
                  defaultValueUrl={postBoxImage ?? undefined}
                  disabled={justForView || (!isAdmin && isPostBoxFilled)}
                  height={200}
                  maxFileSizeBytes={6 * 1024 * 1024}
                  maxFileSizeBytesErrorMessage="سایز فایل انتخابی حداکثر ۶ مگابایت باشد."
                  supportedSizeText="حجم فایل: حداکثر ۶ مگابایت"
                />
              </Box>
            </Box>
          </Box>

          {!justForView && (
            <LoadingButton
              onClick={onButtonClick}
              variant="contained"
              disabled={loading || !editFormIsValid}
              sx={SX.continue_button}
              loading={loading}
            >
              {t('dialog.documents.button')}
            </LoadingButton>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDocumentDialog;
