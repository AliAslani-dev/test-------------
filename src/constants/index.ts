import { SxProps, Theme } from '@mui/material';

export type SXMap = Record<string, SxProps<Theme>>;
export type AdminTab =
  | 'dashboard'
  | 'buckets'
  | 'categories'
  | 'users'
  | 'frames'
  | 'products'
  | 'followers'
  | 'accounting'
  | 'tags'
  | 'tag'
  | 'orders-provider'
  | 'orders'
  | 'organization'
  | 'wholesalers';
export type ProviderTab =
  | 'dashboard'
  | 'buckets'
  | 'frames'
  | 'products'
  | 'followers-provider'
  | 'orders-provider'
  | 'accounting'
  | 'profile'
  | 'wholesalers';
export type { UserRole } from './roles';
export { USER_ROLES } from './roles';
export type ClientType = 'admin' | 'zarplus' | 'modopod';

export const NAME_RE = /^[\p{L}\p{N}\p{S}._\u200C()-][\p{L}\p{N}\p{S} ._\u200C()-]{0,199}$/u;
export const NUMBER_RE = /^[0-9]+$/;
export const NATIONAL_CODE_RE = /^[0-9]{10}$/;
export const NEGATIVE_NUMBER_RE = /^-?[0-9]\d*(\.\d+)?$/;
export const MOBILE_RE = /^0\d{10}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const DECIMAL_NUMBER_RE = /^(?:\d+)(?:\.\d{0,4})?$/;
export const NEGATIVE_DECIMAL_NUMBER_RE = /^-?(?:\d+)(?:\.\d{0,4})?$/;
export const PERCENT_NUMBER_RE = /^(100(?:\.0{1,4})?|(?:\d{1,2})(?:\.\d{1,4})?)$/;
export const DATE_RE =
  /^(1[0-9]{3}|[0-9]{4})[./-](0[1-9]|1[0-2])[./-](?:(?:0[1-9]|[12][0-9]|3[01])|(?:0[1-9]|[12][0-9]|30)|(?:0[1-9]|[12][0-9]|30))$/;

export const MAIN_COLOR = '#9C7A2B';
