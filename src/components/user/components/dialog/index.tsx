'use client';

import theme from '@/styles/Theme';
import { UserTable } from '../table';
import useText from '@/hooks/useText';
import Slide from '@mui/material/Slide';
import { LoadingButton } from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';
import { ProvinceSelect, CitySelect } from '../select';
import DialogSX from '@/components/shared/dialog/styles';
import { useNotification } from '@/hooks/useNotification';
import { ProvinceDTO, CityDTO } from '@/api/admin/user/dto';
import SX from '@/components/user/components/dialog/styles';
import { getRandomInt, persianToEnglishNumber, jalaliToGregorian } from '@/utils';
import ImageUploader from '@/components/shared/image-uploader';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import CustomTextField from '@/components/shared/custom-text-field';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { DATE_RE, EMAIL_RE, MOBILE_RE, NAME_RE, NATIONAL_CODE_RE, UserRole } from '@/constants';
import {
  addAdminUser,
  editAdminUser,
  addProviderUser,
  editProviderUser,
  userCheckDomain,
  getCities,
} from '@/api/admin/user/service';
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
  InputAdornment,
} from '@mui/material';
import { useLang } from '@/hooks/LanContext';
import DatePicker from '@/components/shared/date-picker';
import JDate from 'jalali-date';

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  mode: UserModalMode;
  setMode?: React.Dispatch<React.SetStateAction<UserModalMode>>;
  showingUser: UserTable | undefined;
  setShowingUser: React.Dispatch<React.SetStateAction<UserTable | undefined>>;
  onAdded?: (user: UserTable) => void;
  onEdited?: (id: number, patch: Partial<UserTable>) => void;
  userStatus?: 'USER' | 'PRE';
}

export type UserModalMode = 'add' | 'edit' | 'view';

const trim = (v: string | null | undefined) => (v ?? '').trim();
const strChanged = (current: string, original?: string | null) => current !== (original ?? '');

const getFallbackFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    return null;
  }
};

const UserDialog: FunctionComponent<UserDialogProps> = ({
  open,
  onClose,
  mode,
  showingUser,
  setShowingUser,
  onAdded,
  onEdited,
  userStatus = 'USER',
}) => {
  const { lang } = useLang();
  const { t } = useText('user', lang);
  const { showNotification } = useNotification();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<UserRole>();

  const [sellerMobile, setSellerMobile] = useState<string>('');
  const [sellerFullName, setSellerFullName] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [nationalCode, setNationalCode] = useState<string>('');
  const [refererName, setRefererName] = useState<string>('');
  const [province, setProvince] = useState<ProvinceDTO | null>(null);
  const [city, setCity] = useState<CityDTO | null>(null);
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [domain, setDomain] = useState<string>('');
  const [domainStatus, setDomainStatus] = useState<
    'idle' | 'checking' | 'ok' | 'duplicate' | 'error'
  >('idle');

  const [image, setImage] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [showcaseImage, setShowcaseImage] = useState<string>('');
  const [showcase, setShowcase] = useState<File | null>(null);

  const [signedContract, setSignedContract] = useState<0 | 1>(0);
  const [businessLicense, setBusinessLicense] = useState<0 | 1>(0);
  const [businessLicenseImage, setBusinessLicenseImage] = useState<string>('');
  const [businessLicenseImageFile, setBusinessLicenseImageFile] = useState<File | null>(null);

  const [birthDate, setBirthDate] = useState<string>('');
  const [dBirthDate, setDBirthDate] = useState<Date | undefined>(undefined);

  const [loading, setLoading] = useState<boolean>(false);

  const isView = mode === 'view' || userStatus === 'PRE';
  const isAdd = mode === 'add' && !isView;
  const isEdit = mode === 'edit' && !isView;

  const availableRoles = useMemo((): UserRole[] => {
    return ['banking-provider', 'banking-admin', 'banking-seller'];
  }, []);

  const isProviderRole = role?.includes('provider') || role === 'banking-provider';
  const isAdminRole = !isProviderRole;

  useEffect(() => {
    let finalBirthDate: string | null = null;
    if (dBirthDate !== undefined) {
      const jalaliDate = JDate.toJalali(dBirthDate);

      const year = jalaliDate[0];
      const month = String(jalaliDate[1]).padStart(2, '0');
      const day = String(jalaliDate[2]).padStart(2, '0');

      finalBirthDate = `${year}-${month}-${day}`;
    }

    setBirthDate(finalBirthDate ?? '');
  }, [dBirthDate, birthDate]);

  useEffect(() => {
    if (!open) return;

    const resetAll = () => {
      setName('');
      setEmail('');
      setPassword('');
      setRole(availableRoles[0] || 'provider');

      setSellerMobile('');
      setSellerFullName('');
      setFullName('');
      setMobile('');
      setNationalCode('');
      setRefererName('');
      setProvince(null);
      setCity(null);
      setAddress('');
      setDescription('');
      setDomain('');

      setImage('');
      setFile(null);
      setShowcaseImage('');
      setShowcase(null);
      setSignedContract(0);
      setBusinessLicense(0);
      setBusinessLicenseImage('');
      setBirthDate('');
      setDBirthDate(undefined);
      setBusinessLicenseImageFile(null);
    };

    if (isAdd) {
      resetAll();
      return;
    }

    const u = showingUser;
    if (!u) {
      resetAll();
      return;
    }

    setName(u.username ?? '');
    setEmail(u.email ?? '');
    setRole((u.role as UserRole) ?? 'provider');
    setSellerMobile(u.sellerMobile ?? '');
    setSellerFullName(u.sellerFullName ?? '');
    setFullName(u.fullName ?? '');
    setMobile(u.mobile ?? '');
    setNationalCode(u.nationalCode ?? '');
    setRefererName(u.refererName ?? '');
    setAddress(u.address ?? '');
    setDescription(u.description ?? '');
    setDomain(u.domain ?? '');

    setImage(u.logo ?? '');
    setFile(null);
    setShowcaseImage(u.showcase ?? '');
    setShowcase(null);

    setSignedContract(u.signedContract !== null ? (u.signedContract ? 1 : 0) : 0);
    setBusinessLicense(u.businessLicense !== null ? (u.businessLicense ? 1 : 0) : 0);
    setBusinessLicenseImage(u.businessLicenseImage ?? '');
    setBusinessLicenseImageFile(null);

    setBirthDate(u.birthDate ? u.birthDate : '');

    const gregorianDate = jalaliToGregorian(u.birthDate ? u.birthDate : '');
    if (gregorianDate) setDBirthDate(gregorianDate);

    if (u.provinceId) {
      setProvince({
        id: u.provinceId,
        name: u.province ?? '',
        slug: '',
        telPrefix: '',
      });

      if (u.city) {
        (async () => {
          try {
            const cities = await getCities(u.province!);
            const found = cities?.find((c) => c.name === u.city!);
            if (found) setCity(found);
            else {
              setCity({
                id: getRandomInt(),
                name: u.city!,
                slug: '',
                telPrefix: '',
              });
            }
          } catch {
            setCity(null);
          }
        })();
      } else {
        setCity(null);
      }
    } else if (u.province !== '') {
      setProvince({
        id: getRandomInt(),
        name: u.province ?? '',
        slug: '',
        telPrefix: '',
      });

      if (u.city) {
        (async () => {
          try {
            const cities = await getCities(u.province!);
            const found = cities?.find((c) => c.name === u.city!);
            if (found) setCity(found);
            else {
              setCity({
                id: getRandomInt(),
                name: u.city!,
                slug: '',
                telPrefix: '',
              });
            }
          } catch {
            setCity(null);
          }
        })();
      } else {
        setCity(null);
      }
    } else {
      setProvince(null);
      setCity(null);
    }
  }, [open, mode, showingUser?.id, isAdd, availableRoles]);

  useEffect(() => {
    if (!open) return;

    if (!isAdd || !isProviderRole) {
      setDomainStatus('idle');
      return;
    }

    const trimmed = trim(domain);
    if (!trimmed) {
      setDomainStatus('idle');
      return;
    }

    let alive = true;
    setDomainStatus('checking');

    const handle = setTimeout(async () => {
      try {
        const res = await userCheckDomain(trimmed);
        if (!alive) return;
        setDomainStatus(res?.duplicate ? 'duplicate' : 'ok');
      } catch {
        if (!alive) return;
        setDomainStatus('error');
      }
    }, 500);

    return () => {
      alive = false;
      clearTimeout(handle);
    };
  }, [open, isAdd, isProviderRole, domain]);

  const formIsValid = useMemo(() => {
    if (isView) return false;

    /* ADMIN */
    if (isAdminRole) {
      if (isAdd) {
        const baseAdminValid = EMAIL_RE.test(email) && password.length > 5;
        if (role === 'banking-seller') {
          return baseAdminValid && NAME_RE.test(name);
        }
        return baseAdminValid;
      }

      const orig = showingUser;
      if (!orig) return false;

      const emailOk = EMAIL_RE.test(email);
      const passwordOk = password.length === 0 || password.length > 5;

      const hasChanges = strChanged(email, orig.email) || password.length > 0;

      return emailOk && passwordOk && hasChanges;
    }

    if (isProviderRole) {
      const passwordIsOk = isAdd
        ? password.length >= 5
        : password.length === 0 || password.length >= 5;
      const emailIsOk = EMAIL_RE.test(email);
      const fullNameIsOk = NAME_RE.test(fullName);
      const mobileIsOk = MOBILE_RE.test(mobile);
      const nationalCodeIsOk = nationalCode === '' || NATIONAL_CODE_RE.test(nationalCode);
      const refererNameIsOk = refererName.length !== 0;
      const sellerFullNameIsOk = NAME_RE.test(sellerFullName);
      const sellerMobileIsOk = MOBILE_RE.test(sellerMobile);
      const provinceIsOk = province !== null;
      const cityIsOk = city !== null;
      const birthDateIsOk = birthDate === '' || DATE_RE.test(birthDate);
      const addressIsOk = address.length >= 3;
      const descriptionIsOk = description.length === 0 || description.length >= 3;
      const logoIsOk = true;
      const showcaseIsOk = true;
      const signedContractIsOk = signedContract === 1;
      const businessLicenseIsOk =
        businessLicense === 0 ? true : isAdd ? businessLicenseImageFile !== null : true;

      const commonFieldsIsOk =
        passwordIsOk &&
        emailIsOk &&
        fullNameIsOk &&
        mobileIsOk &&
        nationalCodeIsOk &&
        refererNameIsOk &&
        sellerFullNameIsOk &&
        sellerMobileIsOk &&
        provinceIsOk &&
        cityIsOk &&
        birthDateIsOk &&
        addressIsOk &&
        descriptionIsOk &&
        logoIsOk &&
        showcaseIsOk &&
        signedContractIsOk &&
        businessLicenseIsOk;

      if (isAdd) {
        const nameIsOk = NAME_RE.test(name);
        const domainIsOk = domain.length > 0 && domainStatus === 'ok';
        return commonFieldsIsOk && nameIsOk && domainIsOk;
      }

      if (!commonFieldsIsOk) {
        return false;
      }

      const orig = showingUser;
      if (!orig) return false;

      const hasChanges =
        strChanged(email, orig.email) ||
        password.length > 0 ||
        strChanged(sellerMobile, orig.sellerMobile) ||
        strChanged(sellerFullName, orig.sellerFullName) ||
        strChanged(fullName, orig.fullName) ||
        strChanged(mobile, orig.mobile) ||
        strChanged(nationalCode, orig.nationalCode ?? '') ||
        strChanged(refererName, orig.refererName) ||
        strChanged(province?.name ?? 'null', orig.province) ||
        strChanged(city?.name ?? 'null', orig.city) ||
        strChanged(address, orig.address) ||
        strChanged(description, orig.description) ||
        !!file ||
        (image === '' && (orig.logo ?? '') !== '') ||
        !!showcase ||
        (showcaseImage === '' && (orig.showcase ?? '') !== '') ||
        strChanged(String(signedContract === 1), String(orig.signedContract)) ||
        strChanged(String(businessLicense === 1), String(orig.businessLicense)) ||
        !!businessLicenseImageFile ||
        strChanged(birthDate, orig.birthDate ?? '');

      return hasChanges;
    }

    return false;
  }, [
    isView,
    isAdd,
    isAdminRole,
    isProviderRole,
    role,
    email,
    password,
    name,
    sellerMobile,
    sellerFullName,
    fullName,
    mobile,
    nationalCode,
    refererName,
    province,
    city,
    address,
    description,
    file,
    image,
    showcase,
    showcaseImage,
    domain,
    domainStatus,
    businessLicense,
    businessLicenseImageFile,
    signedContract,
    birthDate,
    showingUser,
  ]);

  const handleCloseInternal = () => {
    if (loading) return;
    onClose();

    setName('');
    setEmail('');
    setSellerMobile('');
    setPassword('');
    setSellerFullName('');
    setFullName('');
    setMobile('');
    setNationalCode('');
    setRefererName('');
    setProvince(null);
    setCity(null);
    setAddress('');
    setDescription('');
    setDomain('');

    setImage('');
    setFile(null);
    setShowcase(null);
    setShowcaseImage('');

    setSignedContract(0);
    setBusinessLicense(0);
    setBusinessLicenseImage('');
    setBusinessLicenseImageFile(null);

    setBirthDate('');
  };

  const handleClose = () => {
    if (loading) return;
    handleCloseInternal();
  };

  const onButtonClick = async () => {
    if (loading || isView) return;
    setLoading(true);

    try {
      /* ADMIN */
      if (isAdminRole) {
        if (isAdd) {
          const created = await addAdminUser(
            email,
            password,
            role as 'banking-admin' | 'banking-seller',
            role === 'banking-seller' ? name : undefined,
          );

          showNotification(t('dialog.add.success_notification'), 'success');

          onAdded?.({
            id: created?.id ?? Date.now(),
            username: created?.username ?? (role === 'banking-seller' ? name : email),
            email: created?.email ?? email,
            role,
            enabled: true,
            actions: <></>,
          } as UserTable);

          handleCloseInternal();
          return;
        }

        if (isEdit && showingUser) {
          const emailToSend = strChanged(email, showingUser.email) ? trim(email) : null;
          const passwordToSend = password.length > 0 ? trim(password) : null;

          await editAdminUser(showingUser.id, emailToSend, passwordToSend);

          showNotification(t('dialog.edit.success_notification'), 'success');

          onEdited?.(showingUser.id, {
            email: emailToSend ?? showingUser.email,
          });

          handleCloseInternal();
          return;
        }
      }

      /* PROVIDER (NON-ADMIN) */
      if (isProviderRole) {
        /* ADD */
        if (isAdd) {
          const trimmedDomain = trim(domain);
          if (province === null || city === null) return;
          if (domain !== '' && trimmedDomain) {
            try {
              const res = await userCheckDomain(trimmedDomain);
              if (res?.duplicate) {
                showNotification(t('dialog.domain_duplicate_error'), 'error');
                setLoading(false);
                return;
              }
            } catch {
              showNotification(t('dialog.domain_check_failed_notification'), 'error');
              setLoading(false);
              return;
            }
          }

          let finalLogo = file;
          if (!finalLogo) {
            finalLogo = await getFallbackFile('/images/DefaultLogo.jpg', 'DefaultLogo.jpg');
          }

          let finalShowcase = showcase;
          if (!finalShowcase) {
            finalShowcase = await getFallbackFile('/images/Showcase.jpg', 'Showcase.jpg');
          }

          const created = await addProviderUser(
            email,
            password,
            role as 'banking-provider',
            name,
            sellerMobile,
            finalLogo as File,
            sellerFullName,
            fullName,
            mobile,
            nationalCode === '' ? null : nationalCode,
            refererName,
            province.name,
            city.name,
            address,
            description,
            trimmedDomain,
            finalShowcase as File,
            signedContract,
            businessLicense,
            businessLicenseImageFile,
            birthDate === '' ? null : birthDate,
          );

          showNotification(t('dialog.add.success_notification'), 'success');

          onAdded?.({
            id: created?.id ?? Date.now(),
            username: created?.username ?? name,
            email: created?.email ?? email,
            sellerMobile: created?.sellerMobile ?? sellerMobile,
            role,
            enabled: true,
            actions: <></>,
          } as UserTable);

          handleCloseInternal();
          return;
        }

        /* EDIT */
        if (isEdit && showingUser) {
          const editedUserValues: any = {};

          if (strChanged(email, showingUser.email)) {
            editedUserValues.email = email;
          }
          if (strChanged(sellerMobile, showingUser.sellerMobile)) {
            editedUserValues.sellerMobile = sellerMobile;
          }
          if (strChanged(sellerFullName, showingUser.sellerFullName)) {
            editedUserValues.sellerFullName = sellerFullName;
          }
          if (strChanged(fullName, showingUser.fullName)) {
            editedUserValues.fullName = fullName;
          }
          if (strChanged(mobile, showingUser.mobile)) {
            editedUserValues.mobile = mobile;
          }
          if (strChanged(nationalCode, showingUser.nationalCode ?? '')) {
            editedUserValues.nationalCode = nationalCode;
          }
          if (strChanged(refererName, showingUser.refererName)) {
            editedUserValues.refererName = refererName;
          }

          const newProvinceName = province?.name ?? 'null';
          if (strChanged(newProvinceName, showingUser.province)) {
            editedUserValues.province = newProvinceName;
            editedUserValues.provinceId = province?.id ?? showingUser.provinceId;
          }

          const newCityName = city?.name ?? 'null';
          if (strChanged(newCityName, showingUser.city)) {
            editedUserValues.city = newCityName;
          }

          if (strChanged(address, showingUser.address)) {
            editedUserValues.address = address;
          }
          if (strChanged(description, showingUser.description)) {
            editedUserValues.description = description;
          }

          const signedContractBool = signedContract === 1;
          if (strChanged(String(signedContractBool), String(showingUser.signedContract))) {
            editedUserValues.signedContract = signedContract;
          }

          const businessLicenseBool = businessLicense === 1;
          if (strChanged(String(businessLicenseBool), String(showingUser.businessLicense))) {
            editedUserValues.businessLicense = businessLicense;
          }

          if (strChanged(birthDate, showingUser.birthDate ?? '')) {
            editedUserValues.birthDate = birthDate;
          }

          let finalLogo = file;
          if (!file && !image) {
            finalLogo = await getFallbackFile('/images/DefaultLogo.jpg', 'DefaultLogo.jpg');
          }

          let finalShowcase = showcase;
          if (!showcase && !showcaseImage) {
            finalShowcase = await getFallbackFile('/images/Showcase.jpg', 'Showcase.jpg');
          }

          await editProviderUser(
            showingUser.id,
            editedUserValues.email ?? null,
            password.length > 0 ? trim(password) : null,
            editedUserValues.sellerMobile ?? null,
            finalLogo || null,
            editedUserValues.sellerFullName ?? null,
            editedUserValues.fullName ?? null,
            editedUserValues.mobile ?? null,
            editedUserValues.nationalCode ?? null,
            editedUserValues.refererName ?? null,
            editedUserValues.province ?? null,
            editedUserValues.city ?? null,
            editedUserValues.address ?? null,
            editedUserValues.description !== undefined ? editedUserValues.description : null,
            finalShowcase || null,
            editedUserValues.signedContract ?? null,
            editedUserValues.businessLicense ?? null,
            businessLicenseImageFile || null,
            editedUserValues.birthDate || null,
          );

          showNotification(t('dialog.edit.success_notification'), 'success');

          onEdited?.(showingUser.id, editedUserValues);
          handleCloseInternal();
          return;
        }
      }
    } catch (e) {
      showNotification(
        isAdd ? t('dialog.add.error_notification') : t('dialog.edit.error_notification'),
        'error',
      );
    } finally {
      setLoading(false);
    }
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
            <Box sx={SX.select}>
              <Typography sx={SX.select_title}>{t('dialog.role')}</Typography>
              <Select
                size="small"
                fullWidth
                labelId="role-label"
                id="role"
                value={role}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E7E6E6',
                  },
                }}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={!isAdd}
              >
                {availableRoles.map((r) => (
                  <MenuItem key={r} value={r}>
                    {t(`dialog.roles.${r}`) || r}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <CustomTextField
              id="email"
              value={email}
              setValue={setEmail}
              title={t('dialog.email')}
              validate={(v) => EMAIL_RE.test(v)}
              disabled={isView}
              hasStar
            />

            {!isView && (
              <CustomTextField
                id="password"
                isPassword
                value={password}
                setValue={setPassword}
                title={t('dialog.password')}
                validate={(v) => v.length >= 5}
                hasStar={isAdd}
              />
            )}

            {!isView && isAdd && role === 'banking-seller' && (
              <CustomTextField
                id="bucket_name"
                value={name}
                setValue={setName}
                title={t('dialog.bucket_name')}
                validate={(v) => NAME_RE.test(v)}
                hasStar
              />
            )}

            {isProviderRole && (
              <>
                <Box sx={SX.row_two_col}>
                  {isAdd && (
                    <CustomTextField
                      id="bucket_name"
                      value={name}
                      setValue={setName}
                      title={t('dialog.bucket_name')}
                      validate={(v) => NAME_RE.test(v)}
                      hasStar
                    />
                  )}
                  <Box sx={{ width: '100%' }}>
                    <CustomTextField
                      id="domain"
                      value={domain}
                      setValue={setDomain}
                      title={t('dialog.domain')}
                      disabled={!isAdd}
                      hasStar
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography sx={{ color: 'text.disabled', direction: 'ltr', ml: 1 }}>
                              zarhub.net/
                            </Typography>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <>
                            {domainStatus === 'ok' && <CheckCircleRoundedIcon color="success" />}
                            {(domainStatus === 'duplicate' || domainStatus === 'error') && (
                              <ErrorRoundedIcon color="error" />
                            )}
                            {(domainStatus === 'idle' || domainStatus === 'checking') && (
                              <LanguageRoundedIcon color="disabled" />
                            )}
                          </>
                        ),
                        sx: {
                          direction: 'ltr',
                          '& input': { textAlign: 'left' },
                        },
                      }}
                    />
                    {isAdd && isProviderRole && (
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.5,
                          ml: 0.5,
                          color:
                            domainStatus === 'duplicate' || domainStatus === 'error'
                              ? 'error.main'
                              : 'text.secondary',
                        }}
                      >
                        {domainStatus === 'checking' && t('dialog.domain_checking')}
                        {domainStatus === 'ok' && t('dialog.domain_available')}
                        {domainStatus === 'duplicate' && t('dialog.domain_duplicate_error')}
                        {domainStatus === 'error' && t('dialog.domain_check_failed_notification')}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={SX.row_two_col}>
                  <CustomTextField
                    id="fullName"
                    value={fullName}
                    setValue={setFullName}
                    title={t('dialog.full_name')}
                    disabled={isView}
                    validate={(v) => NAME_RE.test(v)}
                    hasStar
                  />
                  <CustomTextField
                    id="mobile"
                    value={mobile}
                    setValue={(val) => setMobile(persianToEnglishNumber(val))}
                    title={t('dialog.mobile')}
                    disabled={isView}
                    validate={(v) => MOBILE_RE.test(v)}
                    hasStar
                  />
                </Box>

                <Box sx={SX.row_two_col}>
                  <CustomTextField
                    id="nationalCode"
                    value={nationalCode}
                    setValue={setNationalCode}
                    title={t('dialog.national_code')}
                    disabled={isView}
                    validate={(v) => v.length === 0 || (v.length > 0 && NATIONAL_CODE_RE.test(v))}
                  />
                  <CustomTextField
                    id="refererName"
                    value={refererName}
                    setValue={setRefererName}
                    title={t('dialog.referer_name')}
                    disabled={isView}
                    validate={(v) => v.length !== 0}
                    hasStar
                  />
                </Box>

                <Box sx={SX.row_two_col}>
                  <CustomTextField
                    id="sellerFullName"
                    value={sellerFullName}
                    setValue={setSellerFullName}
                    title={t('dialog.seller_full_name')}
                    disabled={isView}
                    validate={(v) => NAME_RE.test(v)}
                    hasStar
                  />
                  <CustomTextField
                    id="sellerMobile"
                    value={sellerMobile}
                    setValue={(val) => setSellerMobile(persianToEnglishNumber(val))}
                    title={t('dialog.seller_mobile')}
                    validate={(v) => MOBILE_RE.test(v)}
                    disabled={isView}
                    hasStar
                  />
                </Box>

                <Box sx={SX.row_two_col}>
                  <ProvinceSelect
                    value={province}
                    setValue={(p) => {
                      setProvince(p);
                      if (!isView) setCity(null);
                    }}
                    disabled={isView}
                    hasStar
                  />
                  <CitySelect
                    value={city}
                    setValue={setCity}
                    province={province ? province.name : null}
                    disabled={isView}
                    hasStar
                  />
                </Box>

                <Box>
                  <DatePicker
                    value={dBirthDate}
                    setValue={setDBirthDate}
                    title={t('dialog.birth_date')}
                  />
                </Box>

                <CustomTextField
                  id="address"
                  value={address}
                  setValue={setAddress}
                  title={t('dialog.address')}
                  disabled={isView}
                  rows={2}
                  validate={(v) => v.length >= 3}
                  hasStar
                />

                <CustomTextField
                  id="description"
                  value={description}
                  setValue={setDescription}
                  title={t('dialog.description')}
                  disabled={isView}
                  rows={3}
                  validate={(v) => v.length === 0 || v.length >= 3}
                />

                <Box sx={SX.row_two_col}>
                  <Box sx={SX.uploader_wrapper}>
                    <Box sx={SX.uploader_wrapper_header}>
                      <Typography sx={SX.uploader_title}>{t('dialog.logo')}</Typography>
                      {/* <Typography sx={SX.star}>*</Typography> */}
                    </Box>
                    <ImageUploader
                      value={file ?? undefined}
                      onChange={(f) => {
                        if (isView) return;
                        setFile(f);
                        setImage('');
                      }}
                      defaultValueUrl={image ?? undefined}
                      disabled={isView}
                      height={200}
                    />
                  </Box>
                  <Box sx={SX.uploader_wrapper}>
                    <Box sx={SX.uploader_wrapper_header}>
                      <Typography sx={SX.uploader_title}>{t('dialog.showcase')}</Typography>
                      {/* <Typography sx={SX.star}>*</Typography> */}
                    </Box>
                    <ImageUploader
                      value={showcase ?? undefined}
                      onChange={(f) => {
                        if (isView) return;
                        setShowcase(f);
                        setShowcaseImage('');
                      }}
                      defaultValueUrl={showcaseImage ?? undefined}
                      disabled={isView}
                      height={200}
                    />
                  </Box>
                </Box>
                <Box sx={SX.row_two_col}>
                  <Box sx={SX.select}>
                    <Box sx={SX.uploader_wrapper_header}>
                      <Typography sx={SX.select_title}>{t('dialog.signed_contract')}</Typography>
                      <Typography sx={SX.star}>*</Typography>
                    </Box>
                    <Select
                      size="small"
                      fullWidth
                      labelId="signed-contract-label"
                      id="signedContract"
                      value={signedContract}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E7E6E6',
                        },
                      }}
                      onChange={(e) => setSignedContract(e.target.value)}
                      disabled={isView}
                    >
                      <MenuItem value={0}>{t('dialog.no')}</MenuItem>
                      <MenuItem value={1}>{t('dialog.yes')}</MenuItem>
                    </Select>
                  </Box>
                  <Box sx={SX.select}>
                    <Typography sx={SX.select_title}>{t('dialog.business_license')}</Typography>
                    <Select
                      size="small"
                      fullWidth
                      labelId="business_license-label"
                      id="businessLicense"
                      value={businessLicense}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E7E6E6',
                        },
                      }}
                      onChange={(e) => setBusinessLicense(e.target.value)}
                      disabled={isView}
                    >
                      <MenuItem value={0}>{t('dialog.no')}</MenuItem>
                      <MenuItem value={1}>{t('dialog.yes')}</MenuItem>
                    </Select>
                  </Box>
                </Box>
                {businessLicense === 1 && (
                  <Box sx={SX.uploader_wrapper}>
                    <Box sx={SX.uploader_wrapper_header}>
                      <Typography sx={SX.uploader_title}>
                        {t('dialog.business_license_image')}
                      </Typography>
                      <Typography sx={SX.star}>*</Typography>
                    </Box>
                    <ImageUploader
                      value={businessLicenseImageFile ?? undefined}
                      onChange={(f) => {
                        if (isView) return;
                        setBusinessLicenseImageFile(f);
                        if (f) setBusinessLicenseImage('');
                      }}
                      defaultValueUrl={businessLicenseImage ?? undefined}
                      disabled={isView}
                      height={200}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>

          {!isView && (
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

export default UserDialog;
