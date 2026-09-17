import { splitCategories, toStringArray , toIranDate } from '@/utils';
import { FramesByBucketDTO, normalizeAdditionalFields } from '../frame/dto';
import { CategoryField } from '../admin/category/dto';
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
  sku: string;
};

export interface ProductByBucketDTO {
  id: number;
  bucketId: number;
  bucketName: string;
  model: string;
  archived: boolean;
  images: string[];
  image: string | null;
  variants: ProductVariant[];
}

export interface ProductCategoryDTO {
  id: number;
  enName: string;
  faName: string;
  fields: CategoryField[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductGenderCategoryDTO {
  id: number;
  enName: string;
  faName: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ServerSideProductCaratDTO = Record<string, string | undefined>;
export interface ProductCaratDTO {
  amount: string;
  value: string;
}

export const getProductsByFrameDTO = (response: {
  data: any;
  meta: any;
}): {
  bucketName: string;
  products: ProductByBucketDTO[];
  frame: FramesByBucketDTO;
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
} => {
  const frame = response.data.frame;
  const { category, genderCategory } = splitCategories(frame.categories);
  const covers = toStringArray(frame.covers);
  const images = toStringArray(frame.images);

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
        variants: (product.variants ?? []).map((variant: any) => ({
          id: variant.id,
          stock: variant.stock,
          weight: variant.weight,
          extraPrice: variant.extra_price,
          extraWage: variant.extra_wage,
          sku: variant.sku,
        })),
      };
    }),
    frame: {
      id: frame.id,
      bucketId: frame.bucket_id,
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
      image: images.length > 0 ? images[0] : null,
      images: toStringArray(frame.product_images),
      blur: frame.blur,
      cover: covers.length > 0 ? covers[0] : null,
      covers: frame.covers === null ? [] : toStringArray(frame.covers),
      archived: frame.archived === 1 || frame.archived === true || frame.archived === '1',
      additionalFields: normalizeAdditionalFields(frame.additional_fields),
    },
    meta: {
      currentPage: response.meta.current_page,
      perPage: response.meta.per_page,
      lastPage: response.meta.last_page,
      total: response.meta.total,
    },
  };
};


export function getProductCaratsDTO(response: ServerSideProductCaratDTO): ProductCaratDTO[] {
  return Object.entries(response)
    .filter(([, v]) => v != null && String(v).trim() !== '')
    .map(([amount, value]) => ({ amount, value: String(value) }));
}

export const getProductCategoriesDTO = (response: any): ProductCategoryDTO[] => {
  return response.map((category: any) => ({
    id: category.id,
    enName: category.en_name,
    faName: category.fa_name,
    fields: category.fields ?? null,
    createdAt: toIranDate(category.created_at),
    updatedAt: toIranDate(category.updated_at),
  }));
};

export const getProductGenderCategoriesDTO = (response: any): ProductGenderCategoryDTO[] => {
  return response.map((category: any) => ({
    id: category.id,
    enName: category.en_name,
    faName: category.fa_name,
    createdAt: toIranDate(category.created_at),
    updatedAt: toIranDate(category.updated_at),
  }));
};
