'use client';

import theme from '@/styles/Theme';
import useText from '@/hooks/useText';
import { NAME_RE } from '@/constants';
import { BucketTable } from '../table';
import Slide from '@mui/material/Slide';
import { LoadingButton } from '@mui/lab';
import { UserDTO } from '@/api/admin/user/dto';
import CloseIcon from '@mui/icons-material/Close';
import DialogSX from '@/components/shared/dialog/styles';
import { useNotification } from '@/hooks/useNotification';
import SX from '@/components/bucket/components/dialog/styles';
import { UserSelect } from '@/components/user/components/select';
import CustomTextField from '@/components/shared/custom-text-field';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { addAdminBucket, editAdminBucket } from '@/api/admin/bucket/service';
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
import { useLang } from '@/hooks/LanContext';

interface BucketDialogProps {
  open: boolean;
  onClose: () => void;
  mode: BucketModalMode;
  setMode: React.Dispatch<React.SetStateAction<BucketModalMode>>;
  showingBucket: BucketTable | undefined;
  setShowingBucket: React.Dispatch<React.SetStateAction<BucketTable | undefined>>;
  onAdded?: (bucket: BucketTable) => void;
  onEdited?: (id: number, patch: Partial<BucketTable>) => void;
}
export type BucketModalMode = 'add' | 'view' | 'edit';

const BucketDialog: FunctionComponent<BucketDialogProps> = ({
  open,
  onClose,
  mode,
  setMode,
  showingBucket,
  setShowingBucket,
  onAdded,
  onEdited,
}) => {
  const { lang } = useLang();
  const { t } = useText('bucket', lang);
  const { showNotification } = useNotification();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [name, setName] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showName, setShowName] = useState<number>(1);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' || mode === 'view') {
      setName(showingBucket?.name ?? '');
      setShowName(showingBucket?.showName ? (showingBucket.showName ? 1 : 0) : 0);
      if (showingBucket?.userId) {
        setSelectedUser({
          id: showingBucket.userId,
          username: showingBucket.user ?? '',
          email: '',
        } as UserDTO);
      } else {
        setSelectedUser(null);
      }
    } else {
      setName('');
      setSelectedUser(null);
    }
  }, [open, mode, showingBucket?.id]);

  const addFormIsValid = useMemo(() => {
    const hasUser = !!selectedUser?.id;
    return NAME_RE.test(name.trim()) && (mode === 'view' ? true : hasUser);
  }, [name, selectedUser]);

  const editFormIsValid = useMemo(() => {
    if (!NAME_RE.test(name.trim())) return false;

    return showingBucket?.name !== name || showingBucket.showName !== (showName == 1);
  }, [name, showName]);

  const onButtonClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      switch (mode) {
        case 'add': {
          if (!selectedUser?.id) {
            setLoading(false);
            break;
          }
          const created = await addAdminBucket(selectedUser.id, name, showName);
          showNotification(t('dialog.add.success_notification'), 'success');

          const data = (created?.data ?? created) as Partial<BucketTable> | undefined;
          const newBucket: BucketTable = {
            id: data?.id ?? Date.now(),
            name: data?.name ?? name,
            identifier: data?.identifier ?? '',
            showName: showName == 1,
            userId: selectedUser.id,
            user: selectedUser.username,
            enabled: data?.enabled ?? true,
            actions: <></>,
          };
          onAdded?.(newBucket);

          // setShowingBucket(newBucket);
          // setMode('view');
          handleClose();
          break;
        }
        case 'edit': {
          if (!showingBucket?.id) break;
          if (!selectedUser?.id) {
            setLoading(false);
            break;
          }
          const orgData = showingBucket;
          await editAdminBucket(
            showingBucket.id,
            name !== orgData.name ? name : null,
            (showName == 1) !== orgData.showName ? showName : null,
          );
          showNotification(t('dialog.edit.success_notification'), 'success');

          onEdited?.(showingBucket.id, {
            name,
            showName: showName == 1,
            userId: selectedUser.id,
            user: selectedUser.username,
          });

          // setShowingBucket((prev) =>
          //   prev ? { ...prev, name, userId: selectedUser.id, user: selectedUser.username } : prev,
          // );
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
    setSelectedUser(null);
  };

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
        <DialogTitle sx={DialogSX.header_title}>{t(`dialog.${mode}.title`)}</DialogTitle>
        <IconButton onClick={handleClose} aria-label={t('dialog.close')}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={DialogSX.dialog_content}>
        <Box sx={SX.dialog_content_wrapper}>
          <Box sx={SX.inputs_wrapper}>
            <Box sx={SX.inner_inputs_wrapper}>
              <CustomTextField
                id="name"
                value={name}
                setValue={setName}
                title={t('dialog.name')}
                validate={(v) => NAME_RE.test(String(v).trim())}
                disabled={mode === 'view'}
                hasStar
              />
              <UserSelect
                value={selectedUser}
                setValue={setSelectedUser}
                disabled={mode !== 'add'}
                hasStar={mode === 'add'}
              />
            </Box>
            <Box sx={SX.inner_inputs_wrapper}>
              <Box sx={SX.select}>
                <Typography sx={SX.select_title}>{t('dialog.show_name')}</Typography>
                <Select
                  size="small"
                  fullWidth
                  labelId="show-name-label"
                  id="show-name"
                  value={showName}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E7E6E6',
                    },
                  }}
                  onChange={(e) => setShowName(e.target.value as number)}
                  disabled={mode === 'view'}
                >
                  <MenuItem key={'yes'} value={1}>
                    {t('dialog.yes')}
                  </MenuItem>
                  <MenuItem key={'no'} value={0}>
                    {t('dialog.no')}
                  </MenuItem>
                </Select>
              </Box>
            </Box>
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

export default BucketDialog;
