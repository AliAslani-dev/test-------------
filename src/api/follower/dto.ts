import { ClientType } from '@/constants';
import { toIranDate } from '@/utils';

export type FollowRequestStatusType = -1 | 0 | 1;

export interface ZarplusUserDTO {
  id: number;
  defaultBucketName: string;
  email: string;
  username: string;
  enabled: boolean;
  zeroStock: boolean;
  emailVerifiedAt: null | Date;
  logo: null | string;
  sellerMobile: null | string;
  sellerFullName: null | string;
  fullName: null | string;
  mobile: null | string;
  nationalCode: null | string;
  refererName: null | string;
  province: null | string;
  city: null | string;
  address: null | string;
  description: null | string;
  showcase: null | string;
  domainPrefix: null | string;
  signedContract: null | boolean;
  businessLicense: null | boolean;
  businessLicenseImage: null | string;
  postingByUser: null | boolean;
  goldenPosId: null | number;
  goldenPosTerminalNumber: null | string;
  client: ClientType;
  createdAt: Date;
  updatedAt: Date;
}

export interface FollowRequestDTO {
  id: number;
  approved: FollowRequestStatusType;
  userId: number;
  zarplusUserId: number;
  createdAt: Date;
  updatedAt: Date;
}

export const getZarplusUsersDTO = (response: any): ZarplusUserDTO[] => {
  return response.map((user: any) => ({
    id: user.id,
    defaultBucketName: user.default_bucket_name,
    email: user.email ? user.email : '',
    username: user.username ? user.username : '',
    enabled: user.enabled ? user.enabled == 1 : false,
    zeroStock: user.zero_stock ? user.zero_stock == 1 : false,
    emailVerifiedAt: user.email_verified_at ? toIranDate(user.email_verified_at) : null,
    logo: user.logo ? user.logo : null,
    sellerMobile: user.seller_mobile ?? null,
    sellerFullName: user.seller_full_name ?? null,
    fullName: user.full_name ?? null,
    mobile: user.mobile ?? null,
    nationalCode: user.national_code ?? null,
    refererName: user.referer_name ?? null,
    province: user.province ? user.province : null,
    city: user.city ? user.city : null,
    address: user.address ?? null,
    description: user.description ?? null,
    showcase: user.showcase ?? null,
    domainPrefix: user.domain_prefix ?? null,
    signedContract: user.signed_contract ? user.signed_contract == 1 : null,
    businessLicense: user.business_license ? user.business_license == 1 : null,
    businessLicenseImage: user.business_license_image ?? null,
    postingByUser: user.posting_by_user ? user.posting_by_user == 1 : null,
    // signedContract:
    //   user.signed_contract !== null ? (user.signed_contract === 1 ? true : false) : null,
    // businessLicense:
    //   user.business_license !== null ? (user.business_license === 1 ? true : false) : null,
    // businessLicenseImage: user.business_license_image ?? null,
    // postingByUser:
    //   user.posting_by_user !== null ? (user.posting_by_user === 1 ? true : false) : null,
    client: user.client,
    goldenPosId: user.golden_pos_id ?? null,
    goldenPosTerminalNumber: user.golden_pos_terminal_number ?? null,
    createdAt: toIranDate(user.created_at),
    updatedAt: toIranDate(user.updated_at),
  }));
};

export const getFollowRequestsDTO = (response: any): FollowRequestDTO[] => {
  return response.map((user: any) => ({
    id: user.id,
    approved: user.approved,
    userId: user.user_id,
    zarplusUserId: user.zarplus_user_id,
    createdAt: toIranDate(user.created_at),
    updatedAt: toIranDate(user.updated_at),
  }));
};
