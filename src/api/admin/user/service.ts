// src/api/admin/user/service.ts

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

// ============================================
// ADD PROVIDER USER - به‌روز شده با organizationId
// ============================================
export const addProviderUser = async (
  email: string,
  password: string,
  role: 'banking-provider' | 'organizational' | 'gallery',
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
  domain: string | null,
  showcase: File | null,
  signedContract: number,
  businessLicense: number,
  businessLicenseImage: File | null,
  birthDate: string | null,
  organizationId: number | null,
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
  fd.append('signed_contract', JSON.stringify(signedContract));
  fd.append('business_license', JSON.stringify(businessLicense));

  // OPTIONAL - فقط در صورت وجود مقدار اضافه کن
  if (domain) fd.append('domain', domain);
  if (nationalCode) fd.append('national_code', nationalCode);
  if (showcase) fd.append('showcase', showcase, showcase.name);
  if (businessLicenseImage) {
    fd.append('business_license_image', businessLicenseImage, businessLicenseImage.name);
  }
  if (birthDate !== null && birthDate !== undefined) {
    const formatedDate = formatJalaliDate(birthDate);
    fd.append('birth_date', formatedDate);
  }
  if (organizationId !== null && organizationId !== undefined) {
    fd.append('organization_id', JSON.stringify(organizationId));
  }

  try {
    const response = await adminUserApi.addProviderUserAPI(fd);
    return response.data ?? response;
  } catch (err) {
    console.error('Adding provider user failed.', err);
    throw err;
  }
};

// ============================================
// EDIT PROVIDER USER - به‌روز شده با organizationId
// ============================================
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
  organizationId?: number | null,
) => {
  const fd = new FormData();

  // فقط فیلدهایی که مقدار دارند رو append کن
  if (email !== null && email !== undefined) fd.append('email', email);
  if (password !== null && password !== undefined) fd.append('password', password);
  if (file !== null && file !== undefined) fd.append('logo', file, file.name);
  if (sellerMobile !== null && sellerMobile !== undefined) {
    fd.append('seller_mobile', sellerMobile);
  }
  if (sellerFullName !== null && sellerFullName !== undefined) {
    fd.append('seller_full_name', sellerFullName);
  }
  if (fullName !== null && fullName !== undefined) fd.append('full_name', fullName);
  if (mobile !== null && mobile !== undefined) fd.append('mobile', mobile);
  if (nationalCode !== null && nationalCode !== undefined) {
    fd.append('national_code', nationalCode);
  }
  if (refererName !== null && refererName !== undefined) {
    fd.append('referer_name', refererName);
  }
  if (province !== null && province !== undefined) fd.append('province', province);
  if (city !== null && city !== undefined) fd.append('city', city);
  if (address !== null && address !== undefined) fd.append('address', address);
  if (description !== null && description !== undefined) {
    fd.append('description', description);
  }
  if (showcase !== null && showcase !== undefined) {
    fd.append('showcase', showcase, showcase.name);
  }
  if (signedContract !== null && signedContract !== undefined) {
    fd.append('signed_contract', JSON.stringify(signedContract));
  }
  if (businessLicense !== null && businessLicense !== undefined) {
    fd.append('business_license', JSON.stringify(businessLicense));
  }
  if (businessLicenseImage !== null && businessLicenseImage !== undefined) {
    fd.append('business_license_image', businessLicenseImage, businessLicenseImage.name);
  }
  if (birthDate !== null && birthDate !== undefined) {
    const formatedDate = formatJalaliDate(birthDate);
    fd.append('birth_date', formatedDate);
  }
  if (organizationId !== null && organizationId !== undefined) {
    fd.append('organization_id', JSON.stringify(organizationId));
  }

  try {
    const response = await adminUserApi.editProviderUserAPI(userId, fd);
    return response.data ?? response;
  } catch (err) {
    console.error('Editing provider user failed.', err);
    throw err;
  }
};

// ============================================
// سایر توابع
// ============================================
export const providerToggleStoreStatus = async (
  userId: number,
  closed: number,
  openingTime: string | undefined,
) => {
  const fd = new FormData();
  fd.append('closed', String(closed));
  if (openingTime !== undefined) fd.append('opening_time', openingTime);

  try {
    const response = await adminUserApi.editProviderUserAPI(userId, fd);
    return response.data ?? response;
  } catch (err) {
    console.error('Toggling store status failed.', err);
    throw err;
  }
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