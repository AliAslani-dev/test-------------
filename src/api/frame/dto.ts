import { CategoryField } from '../admin/category/dto';
import { splitCategories, toIranDate, toStringArray } from '@/utils';

export interface FramesFilters {
  per_page: number;
  page: number;
  filter?: string;
  from?: string;
  to?: string;
}

export type FrameAdditionalFields = Record<string, string>;

export interface FramesByBucketDTO {
  id: number;
  bucketId: number;
  bucketName: string;
  category: number | null;
  genderCategory: number | null;
  model: string;
  wage: string;
  profit: string;
  discount: string;
  carat: string;
  minWeight: string;
  maxWeight: string;
  totalWeight: string;
  images: string[];
  image: string | null;
  covers: string[];
  cover: string | null;
  archived: boolean;
  blur: 0 | 1;
  additionalFields: FrameAdditionalFields | null;
}

export interface FrameCategoryDTO {
  id: number;
  enName: string;
  faName: string;
  fields: CategoryField[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FrameGenderCategoryDTO {
  id: number;
  enName: string;
  faName: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ServerSideFrameCaratDTO = Record<string, string | undefined>;
export interface FrameCaratDTO {
  amount: string;
  value: string;
}
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
export const getFramesByBucketDTO = (response: {
  data: any;
  meta: any;
}): {
  bucketName: string;
  frames: FramesByBucketDTO[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
} => {
  return {
    bucketName: response.data.bucket_name,
    frames: response.data.frames.map((frame: any) => {
      const { category, genderCategory } = splitCategories(frame.categories);

      return {
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
        images: toStringArray(frame.product_images),
        blur: frame.blur ?? 1,
        covers: frame.covers === null ? [] : toStringArray(frame.covers),
        cover:
          frame.covers === null || frame.covers === '' || frame.covers.lenght === 0
            ? null
            : frame.covers[0],
        archived: frame.archived === 1 || frame.archived === true || frame.archived === '1',
        additionalFields: normalizeAdditionalFields(frame.additional_fields),
      };
    }),
    meta: {
      currentPage: response.meta.current_page,
      perPage: response.meta.per_page,
      lastPage: response.meta.last_page,
      total: response.meta.total,
    },
  };
};

export function getFrameCaratsDTO(response: ServerSideFrameCaratDTO): FrameCaratDTO[] {
  return Object.entries(response)
    .filter(([, v]) => v != null && String(v).trim() !== '')
    .map(([amount, value]) => ({ amount, value: String(value) }));
}

export const getFrameCategoriesDTO = (response: any): FrameCategoryDTO[] => {
  return response.map((category: any) => ({
    id: category.id,
    enName: category.en_name,
    faName: category.fa_name,
    fields: category.fields ?? null,
    createdAt: toIranDate(category.created_at),
    updatedAt: toIranDate(category.updated_at),
  }));
};

export const getFrameGenderCategoriesDTO = (response: any): FrameGenderCategoryDTO[] => {
  return response.map((category: any) => ({
    id: category.id,
    enName: category.en_name,
    faName: category.fa_name,
    createdAt: toIranDate(category.created_at),
    updatedAt: toIranDate(category.updated_at),
  }));
};
