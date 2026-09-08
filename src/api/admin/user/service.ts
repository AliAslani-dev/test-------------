import { adminUserApi } from '@/api';
import { UserRole } from '@/constants';
import { DomainCheckDTO, getCitiesDTO, getProvincesDTO, getRegionDTO, getUsersDTO } from './dto';
import { formatJalaliDate } from '@/utils';

export const getUsers = async (role?: UserRole) => {
  try {
    const response = await adminUserApi.getUsersAPI(role);
    if (response && response.status === 200) {
      return getUsersDTO(response.data);
    }
  } catch (err) {
    console.error('Getting users failed.', err);
    return getUsersDTO([]);
  }
};

export const getProvinces = async () => {
  try {
    const response = await adminUserApi.getRegionAPI();
    if (response && response.status === 200) {
      return getProvincesDTO(response.data);
    }
  } catch (err) {
    console.error('Getting provinces failed.', err);
    return [];
  }
};

export const getCities = async (province: string) => {
  try {
    const response = await adminUserApi.getRegionAPI();
    if (response && response.status === 200) {
      return getCitiesDTO(response.data, province);
    }
  } catch (err) {
    console.error('Getting cities failed.', err);
    return [];
  }
};

export const getRegion = async () => {
  try {
    const response = await adminUserApi.getRegionAPI();
    if (response && response.status === 200) {
      return getRegionDTO(response.data);
    }
  } catch (err) {
    console.error('Getting region failed.', err);
    return getRegionDTO({ provinces: [], cities: {} });
  }
};

export const addAdminUser = async (
  email: string,
  password: string,
  role: 'banking-admin' | 'banking-seller',
  bucketName?: string,
) => {
  try {
    const response = await adminUserApi.addAdminUserAPI(email, password, role, bucketName);
    return response.data;
  } catch (err) {
    console.error('Adding admin user failed.', err);
    throw err;
  }
};

export const editAdminUser = async (
  user_id: number,
  email: string | null,
  password: string | null,
) => {
  try {
    const response = await adminUserApi.editAdminUserAPI(user_id, email, password);
    return response.data;
  } catch (err) {
    console.error('Editing admin user failed.', err);
    throw err;
  }
};

export const addProviderUser = async (
  email: string,
  password: string,
  role: 'banking-provider',
  bucketName: string,
  sellerMobile: string,
  file: File,
  sellerFullName: string,
  fullName: string,
  mobile: string,
  nationalCode: string | null,
  refererName: string,
  province: string,
  city: string,
  address: string,
  description: string,
  domain: string,
  showcase: File | null,
  signedContract: number,
  businessLicense: number,
  businessLicenseImage: File | null,
  birthDate: string | null,
) => {
  const fd = new FormData();

  // REQUIRED
  fd.append('email', email);
  fd.append('password', password);
  fd.append('role', role);
  fd.append('bucket_name', bucketName);
  fd.append('seller_mobile', sellerMobile);
  fd.append('logo', file, file.name);
  fd.append('seller_full_name', sellerFullName);
  fd.append('full_name', fullName);
  fd.append('mobile', mobile);
  fd.append('referer_name', refererName);
  fd.append('province', province);
  fd.append('city', city);
  fd.append('address', address);
  fd.append('description', description);
  fd.append('domain', domain);
  fd.append('signed_contract', JSON.stringify(signedContract));
  fd.append('business_license', JSON.stringify(businessLicense));

  // OPTIONAL
  if (nationalCode) fd.append('national_code', nationalCode);
  if (showcase) fd.append('showcase', showcase, showcase.name);
  if (businessLicenseImage)
    fd.append('business_license_image', businessLicenseImage, businessLicenseImage.name);
  if (birthDate !== null && birthDate !== undefined) {
    const formatedDate = formatJalaliDate(birthDate);
    fd.append('birth_date', formatedDate);
  }

  return adminUserApi.addProviderUserAPI(fd).then((r) => r.data ?? r);
};

export const editProviderUser = async (
  userId: number,
  email: string | null,
  password: string | null,
  sellerMobile: string | null,
  file: File | null,
  sellerFullName: string | null,
  fullName: string | null,
  mobile: string | null,
  nationalCode: string | null,
  refererName: string | null,
  province: string | null,
  city: string | null,
  address: string | null,
  description: string | null,
  showcase: File | null,
  signedContract: number | null,
  businessLicense: number | null,
  businessLicenseImage: File | null,
  birthDate: string | null,
) => {
  const fd = new FormData();
  if (email !== null) fd.append('email', email);
  if (password !== null) fd.append('password', password);
  if (file !== null) fd.append('logo', file, file.name);
  if (sellerMobile !== null) fd.append('seller_mobile', sellerMobile);
  if (sellerFullName !== null) fd.append('seller_full_name', sellerFullName);
  if (fullName !== null) fd.append('full_name', fullName);
  if (mobile !== null) fd.append('mobile', mobile);
  if (nationalCode !== null) fd.append('national_code', nationalCode);
  if (refererName !== null) fd.append('referer_name', refererName);
  if (province !== null) fd.append('province', province);
  if (city !== null) fd.append('city', city);
  if (address !== null) fd.append('address', address);
  if (description !== null) fd.append('description', description);
  if (showcase !== null) fd.append('showcase', showcase, showcase.name);
  if (signedContract !== null) fd.append('signed_contract', JSON.stringify(signedContract));
  if (businessLicense !== null) fd.append('business_license', JSON.stringify(businessLicense));
  if (businessLicenseImage !== null)
    fd.append('business_license_image', businessLicenseImage, businessLicenseImage.name);
  if (birthDate !== null) {
    const formatedDate = formatJalaliDate(birthDate);
    fd.append('birth_date', formatedDate);
  }

  return adminUserApi.editProviderUserAPI(userId, fd).then((response) => response.data ?? response);
};

export const providerToggleStoreStatus = async (
  userId: number,
  closed: number,
  openingTime: string | undefined,
) => {
  const fd = new FormData();
  fd.append('closed', String(closed));
  if (openingTime !== undefined) fd.append('opening_time', openingTime);

  return adminUserApi.editProviderUserAPI(userId, fd).then((response) => response.data ?? response);
};

export const userToggleEnabled = async (user_id: number) => {
  try {
    const response = await adminUserApi.userToggleEnabledAPI(user_id);
    return response.data;
  } catch (err) {
    console.error('Enableing user failed.', err);
    throw err;
  }
};

export const userCheckDomain = async (domain: string): Promise<DomainCheckDTO> => {
  try {
    const response = await adminUserApi.userCheckDomainAPI(domain);
    return response.data;
  } catch (err) {
    console.error('Domain check failed.', err);
    throw err;
  }
};
