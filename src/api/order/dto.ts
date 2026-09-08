import { splitCategories, toIranDate, toStringArray } from '@/utils';

export interface OrdersFilters {
  zarplus_user_id?: number;
}

export interface WholesalerDTO {
  id: number;
  bucketName: string;
  bucketId: number;
  address: string;
  logo: string;
  showcase: string;
  province: number;
  city: number;
  fullName: string;
  mobile: string;
  sellerFullName: string;
  sellerMobile: string;
  domain: string;
  description: string;
  approved: boolean;
}

export const getWholesalersDTO = (response: any): WholesalerDTO[] => {
  return response.map((shop: any) => ({
    id: shop.id,
    bucketId: shop.bucket_id,
    bucketName: shop.bucket_name ?? '',
    logo: shop.logo ?? '',
    province: shop.province ?? '',
    city: shop.city ?? '',
    address: shop.address ?? '',
    showcase: shop.showcase ?? '',
    domain: shop.domain ?? '',
    fullName: shop.full_name ?? '',
    mobile: shop.mobile ?? '',
    sellerFullName: shop.seller_full_name ?? '',
    sellerMobile: shop.seller_mobile ?? '',
    description: shop.description ?? '',
    approved: shop.approved,
  }));
};

export interface FrameDTO {
  approved: boolean;
  id: number;
  model: string;
  covers: string[];
  bucketId: number;
  bucketName: string;
  carat: string;
  genderCategory: number | null;
  category: number | null;

  // Approved
  discount: string | null;
  maxWeight: string | null;
  minWeight: string | null;
  profit: string | null;
  wage: string | null;
  totalWeight: string | null;
}

export const getWholesalerFramesDTO = (response: any): FrameDTO[] => {
  return response.map((frame: any) => {
    const { category, genderCategory } = splitCategories(frame.categories);

    return {
      approved: frame.min_weight !== undefined,
      id: frame.id,
      bucketId: frame.bucket_id,
      bucketName: frame.bucket_name ?? '',
      model: frame.model ?? '',
      carat: frame.carat ?? '',
      category,
      genderCategory,
      wage: String(frame.wage ?? ''),
      profit: String(frame.profit ?? ''),
      discount: String(frame.discount ?? ''),
      minWeight: String(frame.min_weight),
      maxWeight: String(frame.max_weight),
      totalWeight: String(frame.total_weight),
      covers: frame.covers === null ? [] : toStringArray(frame.covers),
    };
  });
};

export interface ProductsFilters {
  per_page: number;
  page: number;
  filter?: string;
  from?: string;
  to?: string;
}

export type ProductVariant = {
  id?: number;
  stock: number;
  weight: number;
  extraPrice: number;
  extraWage: number;
};

export interface ProductByFrameDTO {
  id: number;
  bucketId: number;
  bucketName: string;
  model: string;
  archived: boolean;
  images: string[];
  image: string | null;
  variants: ProductVariant[];
}

export const getProductsByFrameDTO = (response: {
  data: any;
  meta: any;
}): {
  bucketName: string;
  products: ProductByFrameDTO[];
  frame: FrameDTO;
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
} => {
  const frame = response.data.frame;
  const { category, genderCategory } = splitCategories(frame.categories);

  return {
    bucketName: response.data.bucket_name,
    products: response.data.products.map((product: any) => {
      const images = toStringArray(product.images);

      return {
        id: product.product_id,
        bucketId: product.bucket_id,
        bucketName: response.data.bucket_name,
        model: String(product.model ?? ''),
        archived: product.archived === 1 || product.archived === true || product.archived === '1',
        images: toStringArray(product.images),
        image: images.length > 0 ? images[0] : null,
        variants: (product.variants ?? [])
          .filter((v: any) => v.stock !== '0')
          .map((variant: any) => ({
            id: variant.id,
            stock: variant.stock,
            weight: variant.weight,
            extraPrice: variant.extra_price,
            extraWage: variant.extra_wage,
          })),
      };
    }),
    frame: {
      approved: frame.approved,
      id: frame.id,
      bucketId: response.data.bucket_id,
      bucketName: response.data.bucket_name,
      category,
      genderCategory,
      model: String(frame.model ?? ''),
      wage: String(frame.wage ?? ''),
      profit: String(frame.profit ?? ''),
      discount: String(frame.discount ?? ''),
      carat: frame.carat ?? '',
      minWeight: String(frame.min_weight),
      maxWeight: String(frame.max_weight),
      totalWeight: String(frame.total_weight),
      covers: frame.covers === null ? [] : toStringArray(frame.covers),
    },
    meta: {
      currentPage: response.meta.current_page,
      perPage: response.meta.per_page,
      lastPage: response.meta.last_page,
      total: response.meta.total,
    },
  };
};

export type FollowRequestStatusType = -1 | 0 | 1;

export interface ViewRequestDTO {
  id: number;
  approved: FollowRequestStatusType;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export const getViewRequestsDTO = (response: any): ViewRequestDTO[] => {
  return response.map((user: any) => ({
    id: user.id,
    approved: user.approved,
    userId: user.user_id,
    createdAt: toIranDate(user.created_at),
    updatedAt: toIranDate(user.updated_at),
  }));
};

export type WholesaleOrderStatusType = -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6;
// -2 : rejected_by_zarplus,
// -1 : rejected_by_zarhub,
// 0  : submit,
// 1  : in_progress,
// 2  : approved_by_zarhub,
// 3  : approved_by_zarplus,
// 4  : delivered_by_zarhub,
// 5  : received_by_zarplus,
// 6  : final,

export type WholesalerOrderItem =
  | {
      weight: number;
      description: string;
      frame: FrameDTO;
    }
  | {
      weight: number;
      description: string;
      frame: FrameDTO;
      product: ProductByFrameDTO;
    }
  | {
      quantity: number;
      description: string;
      frame: FrameDTO;
      product: ProductByFrameDTO;
      variant: ProductVariant;
    };

export function normalizeAdditionalFields(value: unknown) {
  if (value && typeof value === 'object') {
    return value;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
}

export type SendTypeAdditionalFields = Record<string, string>;
export type SettlementTypeAdditionalFields = Record<string, string>;
export type ZarhubSendTypeAdditionalFields = Record<string, string>;

export interface WholesaleOrder {
  id: number;
  title: string | null;
  bucketName: string;
  bucketId: number;
  status: WholesaleOrderStatusType;
  userId: number;
  zarplusUserId: number;
  items: WholesalerOrderItem[];
  finalItems: WholesalerOrderItem[] | null;
  finalGoldCredit: number | null;
  finalRialCredit: number | null;
  sendTypeId: number | null;
  sendTypeAdditionalFields: SendTypeAdditionalFields | null;
  settlementTypeAdditionalFields: SettlementTypeAdditionalFields | null;
  zarhubSendTypeAdditionalFields: ZarhubSendTypeAdditionalFields | null;
  settlementTypeId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export const getOrdersDTO = (response: any): WholesaleOrder[] => {
  return response.map((order: any) => ({
    id: order.id,
    title: order.title,
    bucketName: order.bucket_name,
    bucketId: order.bucket_id,
    status: order.status,
    userId: order.user_id,
    zarplusUserId: order.zarplus_user_id,
    items: order.items.map((item: any) => {
      const { category, genderCategory } = splitCategories(item.frame.categories);
      const frame: FrameDTO = {
        approved: true,
        id: item.frame.id,
        bucketId: order.bucket_id,
        bucketName: order.bucket_name,
        category,
        genderCategory,
        model: String(item.frame.model ?? ''),
        wage: String(item.frame.wage ?? ''),
        profit: String(item.frame.profit ?? ''),
        discount: String(item.frame.discount ?? ''),
        carat: item.frame.carat ?? '',
        minWeight: String(item.frame.min_weight),
        maxWeight: String(item.frame.max_weight),
        totalWeight: String(item.frame.total_weight),
        covers: item.frame.covers === null ? [] : toStringArray(item.frame.covers),
      };

      if (item.product === undefined) {
        return {
          weight: item.weight,
          description: item.description ?? '',
          frame,
        };
      }

      const images = toStringArray(item.product.images);
      const product: ProductByFrameDTO = {
        id: item.product.id,
        bucketId: order.bucket_id,
        bucketName: order.bucket_name,
        model: String(item.product.model ?? ''),
        archived:
          item.product.archived === 1 ||
          item.product.archived === true ||
          item.product.archived === '1',
        images,
        image: images.length > 0 ? images[0] : null,
        variants: [],
      };

      if (item.variant === undefined) {
        return {
          weight: item.weight,
          description: item.description ?? '',
          frame,
          product,
        };
      }

      const variant: ProductVariant = {
        id: item.variant.id,
        stock: item.variant.stock,
        weight: item.variant.weight,
        extraPrice: item.variant.extra_price,
        extraWage: item.variant.extra_wage,
      };

      return {
        quantity: item.quantity,
        description: item.description ?? '',
        frame,
        product,
        variant,
      };
    }),
    finalItems:
      order.final_items === null
        ? null
        : order.final_items.map((item: any) => {
            const { category, genderCategory } = splitCategories(item.frame.categories);
            const frame: FrameDTO = {
              approved: true,
              id: item.frame.id,
              bucketId: order.bucket_id,
              bucketName: order.bucket_name,
              category,
              genderCategory,
              model: String(item.frame.model ?? ''),
              wage: String(item.frame.wage ?? ''),
              profit: String(item.frame.profit ?? ''),
              discount: String(item.frame.discount ?? ''),
              carat: item.frame.carat ?? '',
              minWeight: String(item.frame.min_weight),
              maxWeight: String(item.frame.max_weight),
              totalWeight: String(item.frame.total_weight),
              covers: item.frame.covers === null ? [] : toStringArray(item.frame.covers),
            };

            if (item.product === undefined) {
              return {
                weight: item.weight,
                description: item.description ?? '',
                frame,
              };
            }

            const images = toStringArray(item.product.images);
            const product: ProductByFrameDTO = {
              id: item.product.id,
              bucketId: order.bucket_id,
              bucketName: order.bucket_name,
              model: String(item.product.model ?? ''),
              archived:
                item.product.archived === 1 ||
                item.product.archived === true ||
                item.product.archived === '1',
              images,
              image: images.length > 0 ? images[0] : null,
              variants: [],
            };

            if (item.variant === undefined) {
              return {
                weight: item.weight,
                description: item.description ?? '',
                frame,
                product,
              };
            }

            const variant: ProductVariant = {
              id: item.variant.id,
              stock: item.variant.stock,
              weight: item.variant.weight,
              extraPrice: item.variant.extra_price,
              extraWage: item.variant.extra_wage,
            };

            return {
              quantity: item.quantity,
              description: item.description ?? '',
              frame,
              product,
              variant,
            };
          }),
    finalGoldCredit: order.final_gold_credit === null ? null : Number(order.final_gold_credit),
    finalRialCredit: order.final_rial_credit === null ? null : Number(order.final_rial_credit),
    sendTypeId: order.send_type_id,
    sendTypeAdditionalFields: normalizeAdditionalFields(order.send_type_additional_fields),
    settlementTypeAdditionalFields: normalizeAdditionalFields(
      order.settlement_type_additional_fields,
    ),
    zarhubSendTypeAdditionalFields: normalizeAdditionalFields(
      order.zarhub_send_type_additional_fields,
    ),
    settlementTypeId: order.settlement_type_id,
    createdAt: toIranDate(order.created_at),
    updatedAt: toIranDate(order.updated_at),
  }));
};

export interface GalleryAccountingDTO {
  assetCredit: number;
  assetPrecision: number;
  rialCredit: number;
  userId: number;
  zarplusUserId: number;
  carat: string;
}

export const getGalleryAccountingDTO = (response: any): GalleryAccountingDTO[] => {
  return response.map((acc: any) => {
    return {
      assetCredit: acc.asset_credit,
      assetPrecision: acc.asset_precision,
      rialCredit: acc.rial_credit,
      userId: acc.user_id,
      zarplusUserId: acc.zarplus_user_id,
      carat: acc.carat,
    };
  });
};

export interface AccountingDTO {
  userId: number;
  totalRialCredit: number;
  totalAssetCredit: number;
  totalZarhubRialCredit: number;
  totalZarhubAssetCredit: number;
  totalClientRialCredit: number;
  totalClientAssetCredit: number;
  zarhubShareRial: number;
  zarhubShareAsset: number;
  assetPrecision: number;
  assetId: number;
}

export const getAccountingDTO = (response: any): AccountingDTO[] => {
  return response.map((acc: any) => {
    return {
      userId: acc.user_id,
      totalRialCredit: acc.total_rial_credit ? Number(acc.total_rial_credit) : 0,
      totalAssetCredit: acc.total_asset_credit ? Number(acc.total_asset_credit) : 0,
      totalZarhubRialCredit: acc.total_zarhub_rial_credit
        ? Number(acc.total_zarhub_rial_credit)
        : 0,
      totalZarhubAssetCredit: acc.total_zarhub_asset_credit
        ? Number(acc.total_zarhub_asset_credit)
        : 0,
      totalClientRialCredit: acc.total_client_rial_credit
        ? Number(acc.total_client_rial_credit)
        : 0,
      totalClientAssetCredit: acc.total_client_asset_credit
        ? Number(acc.total_client_asset_credit)
        : 0,
      zarhubShareRial: acc.zarhub_share_rial ? Number(acc.zarhub_share_rial) : 0,
      zarhubShareAsset: acc.zarhub_share_asset ? Number(acc.zarhub_share_asset) : 0,
      assetPrecision: acc.precision || 1,
      assetId: acc.asset_id || 1,
    };
  });
};

export interface PurchaseSettlementTypeDTO {
  id: number;
  name: string;
}

export const getPurchaseSettlementTypesDTO = (response: any): PurchaseSettlementTypeDTO[] => {
  return response.map((pST: any) => ({
    id: pST.id,
    name: pST.name,
  }));
};

export interface SendTypeDTO {
  id: number;
  name: string;
  additionalFields:
    | null
    | {
        name: string;
      }[];
  zarhubAdditionalFields:
    | null
    | {
        name: string;
      }[];
}

export const getSendTypesDTO = (response: any): SendTypeDTO[] => {
  return response.map((st: any) => ({
    id: st.id,
    name: st.name,
    additionalFields: st.additional_fields ?? [],
    zarhubAdditionalFields: st.zarhub_additional_fields ?? [],
  }));
};
