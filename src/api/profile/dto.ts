export interface ProfileDTO {
  email: string;
  username: string;
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
  domain: null | string;
  signedContract: null | boolean;
  businessLicense: null | boolean;
  businessLicenseImage: null | string;
  minOrderWeight: null | number;
  closed: boolean;
}

export const getProfileDTO = (response: any): ProfileDTO => {
  return {
    email: response.email ? response.email : '',
    username: response.username ? response.username : '',
    logo: response.logo ? response.logo : null,
    sellerMobile: response.seller_mobile ?? null,
    sellerFullName: response.seller_full_name ?? null,
    fullName: response.full_name ?? null,
    mobile: response.mobile ?? null,
    nationalCode: response.national_code ?? null,
    refererName: response.referer_name ?? null,
    province: response.province ? response.province : null,
    city: response.city ? response.city : null,
    address: response.address ?? null,
    description: response.description ?? null,
    showcase: response.showcase ?? null,
    domain: response.domain ?? null,
    signedContract: response.signed_contract ? response.signed_contract == 1 : null,
    businessLicense: response.business_license ? response.business_license == 1 : null,
    businessLicenseImage: response.business_license_image ?? null,
    minOrderWeight: response.min_order_weight ? Number(response.min_order_weight) : 0,
    closed: response.closed == 1,
  };
};
