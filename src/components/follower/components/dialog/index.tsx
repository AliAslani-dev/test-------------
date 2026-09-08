'use client';

import theme from '@/styles/Theme';
import useText from '@/hooks/useText';
import Slide from '@mui/material/Slide';
import CloseIcon from '@mui/icons-material/Close';
import { ZarplusUserDTO } from '@/api/follower/dto';
import DialogSX from '@/components/shared/dialog/styles';
import SX from '@/components/user/components/dialog/styles';
import ImageUploader from '@/components/shared/image-uploader';
import { FunctionComponent, useEffect, useState } from 'react';
import CustomTextField from '@/components/shared/custom-text-field';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useMediaQuery,
  InputAdornment,
} from '@mui/material';

interface ZarplusUserDialogProps {
  open: boolean;
  onClose: () => void;
  showingUser: ZarplusUserDTO | undefined;
}

const ZarplusUserDialog: FunctionComponent<ZarplusUserDialogProps> = ({
  open,
  onClose,
  showingUser,
}) => {
  const { t } = useText('followers');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [defaultBucketName, setName] = useState<string>('');
  const [sellerMobile, setSellerMobile] = useState<string>('');
  const [sellerFullName, setSellerFullName] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [domainPrefix, setDomainPrefix] = useState<string>('');

  const [image, setImage] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [showcaseImage, setShowcaseImage] = useState<string>('');
  const [showcase, setShowcase] = useState<File | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;

    const resetAll = () => {
      setName('');
      setSellerMobile('');
      setSellerFullName('');
      setFullName('');
      setProvince('');
      setCity('');
      setAddress('');
      setDescription('');
      setDomainPrefix('');

      setImage('');
      setFile(null);
      setShowcaseImage('');
      setShowcase(null);
    };

    const u = showingUser;
    if (!u) {
      resetAll();
      return;
    }

    setName(u.defaultBucketName ?? '');
    setSellerMobile(u.sellerMobile ?? '');
    setSellerFullName(u.sellerFullName ?? '');
    setFullName(u.fullName ?? '');
    setAddress(u.address ?? '');
    setDescription(u.description ?? '');
    setDomainPrefix(u.domainPrefix ?? '');

    setImage(u.logo ?? '');
    setFile(null);
    setShowcaseImage(u.showcase ?? '');
    setShowcase(null);

    setProvince(u.province ?? '');
    setCity(u.city ?? '');
  }, [open, showingUser?.id]);

  const handleCloseInternal = () => {
    if (loading) return;
    onClose();

    setName('');
    setSellerMobile('');
    setSellerFullName('');
    setFullName('');
    setProvince('');
    setCity('');
    setAddress('');
    setDescription('');
    setDomainPrefix('');

    setImage('');
    setFile(null);
    setShowcase(null);
    setShowcaseImage('');
  };

  const handleClose = () => {
    if (loading) return;
    handleCloseInternal();
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
        <DialogTitle sx={DialogSX.header_title}>{t(`dialog.title`)}</DialogTitle>
        <IconButton onClick={handleClose} aria-label={t('dialog.close')}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={DialogSX.dialog_content}>
        <Box sx={SX.dialog_content_wrapper}>
          <Box sx={SX.inputs_wrapper}>
            <Box sx={SX.row_two_col}>
              <CustomTextField
                id="defaultBucketName"
                value={defaultBucketName}
                setValue={() => {}}
                title={t('dialog.default_bucket_name')}
                disabled
              />
              <CustomTextField
                id="fullName"
                value={fullName}
                setValue={setFullName}
                title={t('dialog.full_name')}
                disabled
              />
            </Box>

            <Box sx={{ width: '100%' }}>
              <CustomTextField
                id="domainPrefix"
                value={domainPrefix + '.zar.plus'}
                setValue={() => {}}
                title={t('dialog.domain_prefix')}
                disabled
              />
            </Box>

            <Box sx={SX.row_two_col}>
              <CustomTextField
                id="sellerFullName"
                value={sellerFullName}
                setValue={() => {}}
                title={t('dialog.seller_full_name')}
                disabled
              />
              <CustomTextField
                id="sellerMobile"
                value={sellerMobile}
                setValue={() => {}}
                title={t('dialog.seller_mobile')}
                disabled
              />
            </Box>

            <Box sx={SX.row_two_col}>
              <CustomTextField
                id="province"
                value={province}
                setValue={() => {}}
                title={t('dialog.province')}
                disabled
              />
              <CustomTextField
                id="city"
                value={city}
                setValue={() => {}}
                title={t('dialog.city')}
                disabled
              />
            </Box>

            <CustomTextField
              id="address"
              value={address}
              setValue={() => {}}
              title={t('dialog.address')}
              disabled
              rows={2}
            />

            <CustomTextField
              id="description"
              value={description}
              setValue={() => {}}
              title={t('dialog.description')}
              disabled
              rows={3}
            />

            <Box sx={SX.row_two_col}>
              <Box sx={SX.uploader_wrapper}>
                <Box sx={SX.uploader_wrapper_header}>
                  <Typography sx={SX.uploader_title}>{t('dialog.logo')}</Typography>
                </Box>
                <ImageUploader
                  value={file ?? undefined}
                  onChange={(f) => {
                    return;
                  }}
                  defaultValueUrl={image ?? undefined}
                  height={200}
                  disabled
                />
              </Box>
              <Box sx={SX.uploader_wrapper}>
                <Box sx={SX.uploader_wrapper_header}>
                  <Typography sx={SX.uploader_title}>{t('dialog.showcase')}</Typography>
                </Box>
                <ImageUploader
                  value={showcase ?? undefined}
                  onChange={(f) => {
                    return;
                  }}
                  defaultValueUrl={showcaseImage ?? undefined}
                  height={200}
                  disabled
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ZarplusUserDialog;
