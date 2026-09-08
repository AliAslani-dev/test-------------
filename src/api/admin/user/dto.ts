import { toIranDate } from '@/utils';
import { UserRole } from '@/constants';

export interface UserDTO {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  enabled: boolean;
  emailVerifiedAt: null | Date;
  refCode: null | string;

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
  birthDate: null | string;

  closed: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface ProvinceDTO {
  id: number;
  name: string;
  slug: string;
  telPrefix: string;
}

export interface CityDTO {
  id: number;
  name: string;
  slug: string;
  telPrefix: string;
}

export interface RegionDTO {
  provinces: string[];
  cities: Record<string, string[]>;
}

export interface DomainCheckDTO {
  duplicate: boolean;
}

export const getUsersDTO = (response: any): UserDTO[] => {
  return response.map((user: any) => ({
    id: user.id,
    email: user.email ? user.email : '',
    username: user.username ? user.username : '',
    role: user.role as UserRole,
    enabled: user.enabled ? user.enabled == 1 : false,
    refCode: user.ref_code ?? null,
    emailVerifiedAt: user.email_verified_at ? toIranDate(user.email_verified_at) : null,

    logo: user.logo ? user.logo : null,
    sellerMobile: user.seller_mobile ?? null,
    sellerFullName: user.seller_full_name ?? null,
    fullName: user.full_name ?? null,
    mobile: user.mobile ?? null,
    nationalCode:
      user.national_code === undefined ||
      user.national_code === null ||
      user.national_code === 'null' ||
      user.national_code === ''
        ? null
        : user.national_code,
    refererName: user.referer_name ?? null,
    province: user.province ? user.province : null,
    city: user.city ? user.city : null,
    address: user.address ?? null,
    description: user.description ?? null,
    showcase: user.showcase ?? null,
    domain: user.domain ?? null,
    signedContract:
      user.signed_contract !== null ? (user.signed_contract === 1 ? true : false) : null,
    businessLicense:
      user.business_license !== null ? (user.business_license === 1 ? true : false) : null,
    businessLicenseImage: user.business_license_image ?? null,
    birthDate:
      user.birth_date === undefined ||
      user.birth_date === null ||
      user.birth_date === 'null' ||
      user.birth_date === ''
        ? null
        : user.birth_date,

    closed: user.closed == 1,

    createdAt: toIranDate(user.created_at),
    updatedAt: toIranDate(user.updated_at),
  }));
};

export const getProvincesDTO = (response: any): ProvinceDTO[] => {
  return response.map((item: any, inx: number) => ({
    id: inx + 1,
    name: item.province,
    slug: item.province,
    telPrefix: '',
  }));
};

export const getCitiesDTO = (response: any, province_name: string): CityDTO[] => {
  let cities: string[] = [];
  response.forEach((item: any) => {
    if (item.province) {
      if (item.province === province_name) {
        cities = item.cities;
      }
    }
  });
  return cities.map((city: any, inx: number) => ({
    id: inx + 1,
    name: city,
    slug: city,
    telPrefix: '',
  }));
};

export const getRegionDTO = (response: any): RegionDTO => {
  const provinces: string[] = [];
  const cities: Record<string, string[]> = {};

  response.forEach((item: any) => {
    if (item.province) {
      provinces.push(item.province);
      cities[item.province] = item.cities || [];
    }
  });

  return { provinces, cities };
};
