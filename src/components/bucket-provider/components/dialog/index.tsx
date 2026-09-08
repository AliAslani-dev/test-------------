'use client';

import theme from '@/styles/Theme';
import useText from '@/hooks/useText';
import { NAME_RE } from '@/constants';
import Slide from '@mui/material/Slide';
import { LoadingButton } from '@mui/lab';
import { BucketProviderTable } from '../table';
import CloseIcon from '@mui/icons-material/Close';
import DialogSX from '@/components/shared/dialog/styles';
import { useNotification } from '@/hooks/useNotification';
import { addBucket, editBucket } from '@/api/bucket/service';
import SX from '@/components/bucket/components/dialog/styles';
import CustomTextField from '@/components/shared/custom-text-field';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, useMediaQuery } from '@mui/material';
import { useLang } from '@/hooks/LanContext';

interface BucketProviderDialogProps {
  open: boolean;
  onClose: () => void;
  mode: BucketProviderModalMode;
  setMode: React.Dispatch<React.SetStateAction<BucketProviderModalMode>>;
  showingBucketProvider: BucketProviderTable | undefined;
  setShowingBucketProvider: React.Dispatch<React.SetStateAction<BucketProviderTable | undefined>>;
  onAdded?: (bucket: BucketProviderTable) => void;
  onEdited?: (id: number, patch: Partial<BucketProviderTable>) => void;
}
export type BucketProviderModalMode = 'add' | 'view' | 'edit';

const BucketProviderDialog: FunctionComponent<BucketProviderDialogProps> = ({
  open,
  onClose,
  mode,
  setMode,
  showingBucketProvider,
  setShowingBucketProvider,
  onAdded,
  onEdited,
}) => {
  const { lang } = useLang();
  const { t } = useText('bucket', lang);
  const { showNotification } = useNotification();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' || mode === 'view') {
      setName(showingBucketProvider?.name ?? '');
    } else {
      setName('');
    }
  }, [open, mode, showingBucketProvider?.id]);

  const handleNameChange = (value: string) => {
    if (mode === 'view') return;
    setName(value as string);
  };

  const formIsValid = useMemo(() => {
    const nameValue = name.trim();
    return NAME_RE.test(nameValue);
  }, [name]);

  const onButtonClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      switch (mode) {
        case 'add': {
          const created = await addBucket(name);
          showNotification(t('dialog.add.success_notification'), 'success');

          const data = (created?.data ?? created) as Partial<BucketProviderTable> | undefined;
          const newBucketProvider: BucketProviderTable = {
            id: data?.id ?? Date.now(),
            name: data?.name ?? name,
            identifier: data?.identifier ?? '',
            enabled: data?.enabled ?? true,
            actions: <></>,
          };
          onAdded?.(newBucketProvider);

          // setShowingBucketProvider(newBucketProvider);
          // setMode('view');
          handleClose();
          break;
        }
        case 'edit': {
          if (!showingBucketProvider?.id) break;
          await editBucket(showingBucketProvider.id, name);
          showNotification(t('dialog.edit.success_notification'), 'success');

          onEdited?.(showingBucketProvider.id, {
            name,
          });

          setShowingBucketProvider((prev) => (prev ? { ...prev, name } : prev));
          // setMode('view');
          handleClose();
          break;
        }
        default:
          break;
      }
    } catch (e) {
      showNotification(
        mode === 'add' ? t('dialog.add.error_notification') : t('dialog.edit.error_notification'),
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
    setName('');
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
        <DialogTitle sx={DialogSX.header_title}>{t(`dialog.${mode}.title`)}</DialogTitle>
        <IconButton onClick={handleClose} aria-label={t('dialog.close')}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={DialogSX.dialog_content}>
        <Box sx={SX.dialog_content_wrapper}>
          <Box sx={SX.inputs_wrapper}>
            <CustomTextField
              id="name"
              value={name}
              setValue={handleNameChange}
              title={t('dialog.name')}
              validate={(v) => NAME_RE.test(String(v).trim())}
              disabled={mode === 'view'}
              hasStar
            />
          </Box>

          {mode !== 'view' && (
            <LoadingButton
              onClick={onButtonClick}
              variant="contained"
              disabled={!formIsValid || loading}
              sx={SX.continue_button}
              loading={loading}
            >
              {t(`dialog.${mode}.button`)}
            </LoadingButton>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default BucketProviderDialog;
