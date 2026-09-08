import { profileApi } from '@/api';
import { getProfileDTO } from './dto';

export const getProfile = async () => {
  try {
    const response = await profileApi.getProfileAPI();
    if (response && response.status === 200) {
      return getProfileDTO(response.data);
    }
  } catch (err) {
    console.error('Getting profile failed.', err);
    return getProfileDTO({ zeroStock: 0 });
  }
};

export const editProfile = async (
  password: string | null,
  sellerMobile: string | null,
  file: File | null,
  sellerFullName: string | null,
  description: string | null,
  showcase: File | null,
  signedContract: number | null,
  businessLicense: number | null,
  businessLicenseImage: File | null,
  minOrderWeight: number | null,
  address: string | null,
) => {
  const fd = new FormData();
  if (password !== null) fd.append('password', password);
  if (file !== null) fd.append('logo', file, file.name);
  if (sellerMobile !== null) fd.append('seller_mobile', sellerMobile);
  if (sellerFullName !== null) fd.append('seller_full_name', sellerFullName);
  if (description !== null) fd.append('description', description);
  if (showcase !== null) fd.append('showcase', showcase, showcase.name);
  if (signedContract !== null) fd.append('signed_contract', JSON.stringify(signedContract));
  if (businessLicense !== null) fd.append('business_license', JSON.stringify(businessLicense));
  if (businessLicenseImage !== null)
    fd.append('business_license_image', businessLicenseImage, businessLicenseImage.name);
  if (minOrderWeight !== null) fd.append('min_order_weight', JSON.stringify(minOrderWeight));
  if (address !== null) fd.append('address', address);

  return profileApi.editProfileAPI(fd).then((response) => response.data ?? response);
};

export const toggleStoreStatus = async (closed: number, openingTime: string | undefined) => {
  const fd = new FormData();
  fd.append('closed', String(closed));
  if (openingTime !== undefined) fd.append('opening_time', openingTime);

  return profileApi.editProfileAPI(fd).then((response) => response.data ?? response);
};
