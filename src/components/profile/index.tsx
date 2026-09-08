'use client';

import theme from '@/styles/Theme';
import dynamic from 'next/dynamic';
import useText from '@/hooks/useText';
import { MOBILE_RE, PERCENT_NUMBER_RE } from '@/constants';
import { LoadingButton } from '@mui/lab';
import SX from '@/components/profile/styles';
import { ProfileDTO } from '@/api/profile/dto';
import { persianToEnglishNumber } from '@/utils';
import BadgeIcon from '@mui/icons-material/Badge';
import PlaceIcon from '@mui/icons-material/Place';
import ImageUploader from '../shared/image-uploader';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import SecurityIcon from '@mui/icons-material/Security';
import CustomTextField from '../shared/custom-text-field';
import { useNotification } from '@/hooks/useNotification';
import HandshakeIcon from '@mui/icons-material/Handshake';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { editProfile, getProfile } from '@/api/profile/service';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  Skeleton,
  Typography,
  useMediaQuery,
  Button,
} from '@mui/material';
import { useLang } from '@/hooks/LanContext';

const LocationPicker = dynamic(() => import('../shared/location-picker/location-picker'), {
  ssr: false,
  loading: () => <Skeleton variant="rounded" height={400} sx={{ my: 2, borderRadius: 3 }} />,
});

const ProfileTab: FunctionComponent = () => {
  const { lang } = useLang();
  const { t } = useText('profile', lang);
  const { showNotification } = useNotification();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // --- States ---
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileDTO | undefined>(undefined);
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [sellerMobile, setSellerMobile] = useState('');
  const [sellerFullName, setSellerFullName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [showcaseImage, setShowcaseImage] = useState('');
  const [showcase, setShowcase] = useState<File | null>(null);
  const [signedContract, setSignedContract] = useState<0 | 1>(0);
  const [businessLicense, setBusinessLicense] = useState<0 | 1>(0);
  const [businessLicenseImage, setBusinessLicenseImage] = useState('');
  const [businessLicenseImageFile, setBusinessLicenseImageFile] = useState<File | null>(null);
  const [minOrderWeight, setMinOrderWeight] = useState('0');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProfile();
      setProfileData(res);
      if (res) {
        setSellerFullName(res.sellerFullName || '');
        setSellerMobile(res.sellerMobile || '');
        setDescription(res.description || '');
        setAddress(res.address || '');
        setImage(res.logo || '');
        setShowcaseImage(res.showcase || '');
        setSignedContract(res.signedContract ? 1 : 0);
        setBusinessLicense(res.businessLicense ? 1 : 0);
        setBusinessLicenseImage(res.businessLicenseImage || '');
        setMinOrderWeight(res.minOrderWeight ? String(res.minOrderWeight) : '0');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isLicenseLocked = profileData?.businessLicense === true;
  const isLicenseImageLocked = !!profileData?.businessLicenseImage;

  const formIsValid = useMemo(() => {
    if (!profileData) return false;

    const isPassValid = password.length === 0 || (password.length > 5 && password === rePassword);
    if (!isPassValid) return false;

    if (businessLicense === 1 && !businessLicenseImage && !businessLicenseImageFile) return false;

    if (!MOBILE_RE.test(sellerMobile)) return false;

    if (address.trim().length === 0) return false;

    const hasChanges =
      password.length > 0 ||
      sellerMobile !== profileData.sellerMobile ||
      sellerFullName !== profileData.sellerFullName ||
      description !== profileData.description ||
      address !== profileData.address ||
      !!file ||
      !!showcase ||
      !!businessLicenseImageFile ||
      signedContract !== (profileData.signedContract ? 1 : 0) ||
      businessLicense !== (profileData.businessLicense ? 1 : 0) ||
      minOrderWeight !== String(profileData.minOrderWeight);

    return hasChanges;
  }, [
    password,
    rePassword,
    sellerMobile,
    sellerFullName,
    description,
    address,
    file,
    showcase,
    businessLicense,
    businessLicenseImageFile,
    businessLicenseImage,
    signedContract,
    minOrderWeight,
    profileData,
  ]);

  const onButtonClick = async () => {
    if (!profileData) return;

    setLoading(true);
    try {
      await editProfile(
        password.length > 0 ? password.trim() : null,
        sellerMobile !== profileData.sellerMobile ? sellerMobile : null,
        file,
        sellerFullName !== profileData.sellerFullName ? sellerFullName : null,
        description !== profileData.description ? description : null,
        showcase,
        signedContract !== (profileData.signedContract ? 1 : 0) ? signedContract : null,
        businessLicense !== (profileData.businessLicense ? 1 : 0) ? businessLicense : null,
        businessLicenseImageFile,
        Number(minOrderWeight) !== profileData.minOrderWeight ? Number(minOrderWeight) : null,
        address !== profileData.address ? address : null,
      );

      showNotification(t('success_notification'), 'success');
      fetchData();
    } catch (e) {
      showNotification(t('error_notification'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!profileData && loading ? (
        <ProfileTabSkeleton />
      ) : (
        <Box sx={SX.tab_wrapper}>
          <Typography sx={SX.tab_title}>{t('tab_title')}</Typography>

          <Box sx={SX.card}>
            <Box sx={SX.inner_fields_wrapper}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Typography sx={SX.section_title}>
                  <StorefrontIcon color="primary" /> {t('shop_information')}
                </Typography>
                <Box sx={SX.inner_fields_wrapper}>
                  <CustomTextField
                    id="username"
                    value={profileData?.username ?? ''}
                    setValue={() => {}}
                    title={t('username')}
                    disabled
                  />
                  <CustomTextField
                    id="email"
                    value={profileData?.email ?? ''}
                    setValue={() => {}}
                    title={t('email')}
                    disabled
                  />
                </Box>
                <Box sx={SX.inner_fields_wrapper}>
                  <CustomTextField
                    id="address"
                    value={`zarhub.net/${profileData?.domain}`}
                    setValue={() => {}}
                    title={t('website_address')}
                    disabled
                  />
                  <CustomTextField
                    id="minOrderWeight"
                    title={t('min_order_weight')}
                    value={minOrderWeight}
                    setValue={setMinOrderWeight}
                    numeric={'decimal'}
                    decimalScale={2}
                    min={0}
                    max={1000}
                    validate={(v) => PERCENT_NUMBER_RE.test(v)}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={SX.card}>
            <Typography sx={SX.section_title}>
              <PhotoLibraryIcon color="primary" sx={{ mr: 1 }} /> {t('logo_and_showcase')}
            </Typography>
            <Box sx={SX.inner_fields_wrapper}>
              <Box sx={{ flex: 1 }}>
                <ImageUploader
                  value={file ?? undefined}
                  onChange={setFile}
                  defaultValueUrl={image}
                  height={200}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <ImageUploader
                  value={showcase ?? undefined}
                  onChange={setShowcase}
                  defaultValueUrl={showcaseImage}
                  height={200}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={SX.card}>
            <Typography sx={SX.section_title}>
              <BadgeIcon color="primary" sx={{ mr: 1 }} /> {t('identity_information')}
            </Typography>
            <Box sx={SX.inner_fields_wrapper}>
              <CustomTextField
                id="fullName"
                value={profileData?.fullName ?? ''}
                setValue={() => {}}
                title={t('full_name')}
                disabled
              />
              <CustomTextField
                id="mobile"
                value={profileData?.mobile || ''}
                setValue={() => {}}
                title={t('mobile')}
                disabled
              />
            </Box>
            <Box sx={SX.inner_fields_wrapper}>
              <CustomTextField
                id="nationalCode"
                value={profileData?.nationalCode ?? ''}
                setValue={() => {}}
                title={t('national_code')}
                disabled
              />
            </Box>
            <Box sx={SX.inner_fields_wrapper}>
              <CustomTextField
                id="sellerFullName"
                value={sellerFullName}
                setValue={setSellerFullName}
                title={t('seller_full_name')}
              />
              <CustomTextField
                id="sellerMobile"
                value={sellerMobile}
                setValue={(v) => setSellerMobile(persianToEnglishNumber(v))}
                title={t('seller_mobile')}
                validate={(v) => MOBILE_RE.test(v)}
              />
            </Box>
            <CustomTextField
              id="description"
              value={description}
              setValue={setDescription}
              title={t('description')}
              rows={3}
            />
          </Box>

          <Box sx={SX.card}>
            <Typography sx={SX.section_title}>
              <PlaceIcon color="primary" sx={{ mr: 1 }} /> {t('address_and_location')}
            </Typography>
            <Box sx={SX.inner_fields_wrapper}>
              <CustomTextField
                id="province"
                value={profileData?.province ?? ''}
                setValue={() => {}}
                title={t('province')}
                disabled
              />
              <CustomTextField
                id="city"
                value={profileData?.city ?? ''}
                setValue={() => {}}
                title={t('city')}
                disabled
              />
            </Box>
            <CustomTextField
              id="address"
              value={address}
              setValue={setAddress}
              title={t('address')}
              validate={(v) => v.trim().length > 0}
            />
            {/* <Box sx={{ mt: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mt: 1, 
              mb: -1, 
              fontWeight: 700, 
              color: theme.palette.grey[500],
              fontSize: '12px'
            }}
          >
            {t('select_location_on_map')}
          </Typography>
          
          <LocationPicker 
            lat={lat} 
            lng={lng} 
            onChange={(la, ln) => { setLat(la); setLng(ln); }} 
          />
        </Box> */}
          </Box>

          <Box sx={SX.card}>
            <Typography sx={SX.section_title}>
              <SecurityIcon color="primary" sx={{ mr: 1 }} /> {t('security_settings')}
            </Typography>
            <Box sx={SX.inner_fields_wrapper}>
              <CustomTextField
                id="password"
                value={password}
                setValue={setPassword}
                title={t('password')}
                isPassword
              />
              <CustomTextField
                id="rePassword"
                value={rePassword}
                setValue={setRePassword}
                title={t('re_password')}
                isPassword
              />
            </Box>
          </Box>

          <Box sx={SX.card}>
            <Typography sx={SX.section_title}>
              <WorkspacePremiumIcon color="primary" sx={{ mr: 1 }} /> {t('license')}
            </Typography>
            <Box sx={{ maxWidth: '400px' }}>
              <Typography
                variant="caption"
                sx={{ display: 'block', mb: 1, fontWeight: 600, color: theme.palette.grey[500] }}
              >
                {t('business_license')}
              </Typography>
              <Select
                size="small"
                fullWidth
                value={businessLicense}
                disabled={isLicenseLocked}
                onChange={(e) => setBusinessLicense(e.target.value as 0 | 1)}
              >
                <MenuItem value={0}>{t('no')}</MenuItem>
                <MenuItem value={1}>{t('yes')}</MenuItem>
              </Select>
            </Box>

            {businessLicense === 1 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                  {t('business_license_image')}
                </Typography>
                <ImageUploader
                  value={businessLicenseImageFile ?? undefined}
                  onChange={setBusinessLicenseImageFile}
                  defaultValueUrl={businessLicenseImage}
                  disabled={isLicenseImageLocked}
                  height={200}
                />
              </Box>
            )}
          </Box>

          <Box sx={SX.card}>
            <Typography sx={SX.section_title}>
              <HandshakeIcon color="primary" sx={{ mr: 1 }} /> {t('contract_title')}
            </Typography>
            <Box sx={SX.pdf_container}>
              <object
                data={'/files/terms_and_conditions_.pdf'}
                type="application/pdf"
                width="100%"
                height="100%"
              />
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={signedContract === 1}
                  disabled={profileData?.signedContract === true}
                  onChange={(e) => setSignedContract(e.target.checked ? 1 : 0)}
                  color="primary"
                />
              }
              label={
                <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                  {t(
                    `contract_accept_label${profileData?.signedContract === true ? '_confirmed' : ''}`,
                  )}
                </Typography>
              }
            />
          </Box>

          <LoadingButton
            onClick={onButtonClick}
            variant="contained"
            disabled={!formIsValid || loading}
            loading={loading}
            sx={SX.continue_button}
          >
            {t('confirm_button')}
          </LoadingButton>
        </Box>
      )}
    </>
  );
};

const ProfileTabSkeleton = () => {
  return (
    <Box sx={SX.tab_wrapper}>
      <Skeleton
        variant="text"
        width={120}
        height={50}
        sx={{ mb: 3, borderRadius: 4, alignSelf: 'center' }}
      />

      <Box sx={SX.card}>
        <Box sx={SX.inner_fields_wrapper}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Skeleton variant="text" width={140} height={24} />
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
          </Box>
          <Box sx={{ ...SX.qr_container, minWidth: { md: '250px' } }}>
            <Skeleton variant="rounded" width={150} height={150} />
            <Skeleton variant="text" width={100} sx={{ mt: 2 }} />
            <Skeleton variant="text" width={120} />
          </Box>
        </Box>
      </Box>

      <Box sx={SX.card}>
        <Skeleton variant="text" width={160} height={24} />
        <Box sx={SX.inner_fields_wrapper}>
          <Skeleton variant="rounded" height={200} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={200} sx={{ flex: 1 }} />
        </Box>
      </Box>

      <Box sx={SX.card}>
        <Skeleton variant="text" width={140} height={24} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Box sx={SX.inner_fields_wrapper}>
            <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
            <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
          </Box>
          <Box sx={SX.inner_fields_wrapper}>
            <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
            <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
          </Box>
          <Box sx={SX.inner_fields_wrapper}>
            <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
            <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
          </Box>
          <Skeleton variant="rounded" height={100} />
        </Box>
      </Box>

      <Box sx={SX.card}>
        <Skeleton variant="text" width={150} height={24} />
        <Box sx={SX.inner_fields_wrapper}>
          <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
        </Box>
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="rounded" height={400} />
      </Box>

      <Box sx={SX.card}>
        <Skeleton variant="text" width={140} height={24} />
        <Box sx={SX.inner_fields_wrapper}>
          <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
        </Box>
      </Box>

      <Box sx={SX.card}>
        <Skeleton variant="text" width={140} height={24} />
        <Skeleton variant="rounded" width="100%" height={40} sx={{ maxWidth: 400 }} />
      </Box>

      <Box sx={SX.card}>
        <Skeleton variant="text" width={140} height={24} />
        <Skeleton variant="rounded" height={400} />
        <Skeleton variant="text" width={250} height={30} />
      </Box>

      <Skeleton variant="rounded" sx={{ ...SX.continue_button, alignSelf: 'center' }} />
    </Box>
  );
};

export default ProfileTab;
