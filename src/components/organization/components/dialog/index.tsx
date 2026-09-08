'use client';

import theme from '@/styles/Theme';
import useText from '@/hooks/useText';
import { NAME_RE } from '@/constants';
import Slide from '@mui/material/Slide';
import { LoadingButton } from '@mui/lab';
import { OrganizationTable } from '../table';
import CloseIcon from '@mui/icons-material/Close';
import DialogSX from '@/components/shared/dialog/styles';
import { useNotification } from '@/hooks/useNotification';
import SX from '@/components/organization/components/dialog/styles';
import CustomTextField from '@/components/shared/custom-text-field';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { addOrganization, editOrganization } from '@/api/admin/organization/service';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { useLang } from '@/hooks/LanContext';

interface OrganizationDialogProps {
  open: boolean;
  onClose: () => void;
  mode: OrganizationModalMode;
  setMode: React.Dispatch<React.SetStateAction<OrganizationModalMode>>;
  showingOrganization: OrganizationTable | undefined;
  setShowingOrganization: React.Dispatch<React.SetStateAction<OrganizationTable | undefined>>;
  onAdded?: (organization: OrganizationTable) => void;
  onEdited?: (id: number, patch: Partial<OrganizationTable>) => void;
}

export type OrganizationModalMode = 'add' | 'view' | 'edit';

const OrganizationDialog: FunctionComponent<OrganizationDialogProps> = ({
  open,
  onClose,
  mode,
  setMode,
  showingOrganization,
  setShowingOrganization,
  onAdded,
  onEdited,
}) => {
  const { lang } = useLang();
  const { t } = useText('organization', lang);
  const { showNotification } = useNotification();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [faName, setFaName] = useState<string>('');
  const [enName, setEnName] = useState<string>('');
  const [commission, setCommission] = useState<number | string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' || mode === 'view') {
      setFaName(showingOrganization?.faName ?? '');
      setEnName(showingOrganization?.enName ?? '');
      setCommission(showingOrganization?.commission ?? '');
    } else {
      setFaName('');
      setEnName('');
      setCommission('');
    }
  }, [open, mode, showingOrganization?.id]);

  // ولیدیشن برای حالت افزودن
  const addFormIsValid = useMemo(() => {
    return NAME_RE.test(faName.trim()) && NAME_RE.test(enName.trim()) && Number(commission) >= 0;
  }, [faName, enName, commission]);

  // ولیدیشن برای حالت ویرایش - فقط کمیسیون رو چک کن
  const editFormIsValid = useMemo(() => {
    // اگه کمیسیون معتبر نباشه
    if (Number(commission) < 0) return false;
    
    // اگه کمیسیون تغییر نکرده باشه، دکمه غیرفعال بمونه
    if (Number(commission) === showingOrganization?.commission) return false;
    
    return true;
  }, [commission, showingOrganization]);

  const onButtonClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      switch (mode) {
        case 'add': {
          const created = await addOrganization(enName, faName, Number(commission));
          showNotification(t('dialog.add.success_notification'), 'success');

          const newOrganization: OrganizationTable = {
            id: created.id,
            faName: created.faName,
            enName: created.enName,
            commission: created.commission,
            isEnabled: created.isEnabled ?? true,
            actions: <></>,
          };
          onAdded?.(newOrganization);
          handleClose();
          break;
        }

        case 'edit': {
          if (!showingOrganization?.id) {
            setLoading(false);
            break;
          }

          await editOrganization(
            showingOrganization.id,
            Number(commission)
          );

          showNotification(t('dialog.edit.success_notification'), 'success');

          // فقط کمیسیون رو آپدیت کن
          onEdited?.(showingOrganization.id, {
            commission: Number(commission),
          });

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
    setFaName('');
    setEnName('');
    setCommission('');
  };

  // فیلدهای اسم فقط در حالت add فعال باشن
  const isNameDisabled = mode === 'view' || mode === 'edit';

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
              id="faName"
              value={faName}
              setValue={setFaName}
              title={t('dialog.fa_name')}
              validate={(v) => NAME_RE.test(v.trim())}
              disabled={isNameDisabled}
              hasStar={mode === 'add'}
            />
            <CustomTextField
              id="enName"
              value={enName}
              setValue={setEnName}
              title={t('dialog.en_name')}
              validate={(v) => NAME_RE.test(v.trim())}
              disabled={isNameDisabled}
              hasStar={mode === 'add'}
            />
            <CustomTextField
              id="commission"
              value={String(commission)}
              setValue={(v) => setCommission(v)}
              title={t('dialog.commission')}
              disabled={mode === 'view'}
              hasStar
            />
          </Box>

          {mode !== 'view' && (
            <LoadingButton
              onClick={onButtonClick}
              variant="contained"
              disabled={
                loading ||
                (mode === 'add' && !addFormIsValid) ||
                (mode === 'edit' && !editFormIsValid)
              }
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

export default OrganizationDialog;