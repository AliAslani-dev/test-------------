import base from '../locales/base.json';
import user from '../locales/user.json';
import bucket from '../locales/bucket.json';
import category from '../locales/category.json';
import table from '../locales/table.json';
import frame from '../locales/frame.json';
import frameCarat from '../locales/frameCarat.json';
import product from '../locales/product.json';
import profile from '../locales/profile.json';
import followers from '../locales/followers.json';
import order from '../locales/order.json';
import galleryAccounting from '../locales/galleryAccounting.json';
import tags from '../locales/tags.json';
import accounting from '../locales/accounting.json';
import organization from '../locales/organization.json';
import wholesalers from '../locales/wholesalers.json';
import wholesaler from '../locales/wholesaler.json';
import basket from '../locales/basket.json';

const locales = {
  base,
  bucket,
  category,
  user,
  frame,
  table,
  frameCarat,
  product,
  profile,
  followers,
  order,
  galleryAccounting,
  tags,
  accounting,
  organization,
  wholesalers,
  wholesaler,
  basket,
};

interface UseTextReturn {
  t: TFunction;
}

type TFunction = (key: string, variables?: Record<string, string>) => string;

export default function useText(
  ns: string = 'common',
  lang: 'Fa' | 'En' | 'Tu' = 'Fa',
): UseTextReturn {
  // @ts-expect-error - Dynamic access to locales object with string index
  const locale = locales[ns];

  function getNestedValue(obj: any, key: string): any {
    if (!key) return undefined;
    return key.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  function t(key: string, variables?: Record<string, string>): string {
    if (!key) return '';

    const valueObject = getNestedValue(locale, key);

    if (!valueObject) return key;

    let value = valueObject[lang] || valueObject.Fa;

    if (!value) return key;

    if (variables) {
      Object.keys(variables).forEach((varKey) => {
        value = value.replace(`{{${varKey}}}`, variables[varKey]);
      });
    }

    return value;
  }

  return { t };
}
