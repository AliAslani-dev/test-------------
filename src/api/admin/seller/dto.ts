import { FramesByBucketDTO } from '@/api/frame/dto';
import { splitCategories, toIranDate, toStringArray } from '@/utils';

export interface FramesFilters {
  per_page: number;
  page: number;
  filter?: string;
  categories?: number[];
  gender_categories?: number[];
  carat?: string;
  bucket_id?: number;

  min_wage_profit?: number;
  max_wage_profit?: number;

  min_wage_profit_discount?: number;
  max_wage_profit_discount?: number;

  min_total_weight?: number;
  max_total_weight?: number;

  min_min_weight?: number;
  max_min_weight?: number;

  min_max_weight?: number;
  max_max_weight?: number;
}

export type FrameBundle = {
  id: number;
  frame: FramesByBucketDTO;
  deletedAt: Date | null;
};

export interface TagDTO {
  id: number;
  name: string;
  position: number;
  banners: string[];
  categoryEnName: string;
  categoryFaName: string;
  categoryId: number;
  bundles: FrameBundle[];
  enabled: boolean;
  sellerId: number;
}

export type TagBundle = {
  id: number;
  tag: {
    id: number;
    name: string;
    position: number;
    banners: string[];
    categoryId: number;
    enabled: boolean;
    sellerId: number;
  };
  deletedAt: Date | null;
};

export type FrameAdditionalFields = Record<string, string>;
export interface AllFrameDTO {
  id: number;
  bucketId: number;
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

  bundles: TagBundle[];
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
export const getTagsDTO = (response: any): TagDTO[] => {
  return response.map((tag: any) => ({
    id: tag.id,
    sellerId: tag.seller_id,
    name: tag.name,
    categoryEnName: tag.category_en_name,
    categoryFaName: tag.category_fa_name,
    categoryId: tag.category_id,
    position: tag.position,
    banners: toStringArray(tag.banners),
    enabled: tag.enabled === 1 || tag.enabled === true || tag.enabled === '1',
    bundles: tag.bundles.map((bundle: any) => {
      const frame = bundle.frame;
      const { category, genderCategory } = splitCategories(bundle.categories);

      return {
        id: bundle.id,
        deletedAt: bundle.deleted_at !== null ? toIranDate(bundle.deleted_at) : null,
        frame: {
          id: frame.id,
          bucketId: frame.bucket_id,
          bucketName: '',
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
          images: [],
          blur: frame.blur ?? 1,
          covers: frame.covers === null ? [] : toStringArray(frame.covers),
          cover:
            frame.covers === null || frame.covers === '' || frame.covers.lenght === 0
              ? null
              : frame.covers[0],
          archived: frame.archived === 1 || frame.archived === true || frame.archived === '1',
          additionalFields: normalizeAdditionalFields(frame.additional_fields),
        },
      };
    }),
  }));
};

export const getTagDTO = (response: any): TagDTO => ({
  id: response[0].id,
  sellerId: response[0].seller_id,
  name: response[0].name,
  categoryEnName: response[0].category_en_name,
  categoryFaName: response[0].category_fa_name,
  categoryId: response[0].category_id,
  position: response[0].position,
  banners: toStringArray(response[0].banners),
  enabled: response[0].enabled === 1 || response[0].enabled === true || response[0].enabled === '1',
  bundles: response[0].bundles.map((bundle: any) => {
    const { category, genderCategory } = splitCategories(bundle.categories);
    const frame = bundle.frame;

    return {
      id: bundle.id,
      deletedAt: bundle.deleted_at !== null ? toIranDate(bundle.deleted_at) : null,
      frame: {
        id: frame.id,
        bucketId: frame.bucket_id,
        bucketName: '',
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
        images: [],
        blur: frame.blur ?? 1,
        covers: frame.covers === null ? [] : toStringArray(frame.covers),
        cover:
          frame.covers === null || frame.covers === '' || frame.covers.lenght === 0
            ? null
            : frame.covers[0],
        archived: frame.archived === 1 || frame.archived === true || frame.archived === '1',
        additionalFields: normalizeAdditionalFields(frame.additional_fields),
      },
    };
  }),
});

export const getAllFramesDTO = (response: {
  data: any;
  meta: any;
}): {
  frames: AllFrameDTO[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
} => {
  return {
    frames: response.data.map((frame: any) => {
      const { category, genderCategory } = splitCategories(frame.categories);

      return {
        id: frame.id,
        bucketId: frame.bucket_id,
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
        bundles: frame.bundles.map((bundle: any) => {
          const tag = bundle.tag;

          return {
            id: bundle.id,
            deletedAt: bundle.deleted_at !== null ? toIranDate(bundle.deleted_at) : null,
            tag: {
              id: tag.id,
              sellerId: tag.seller_id,
              name: tag.name,
              categoryId: tag.category_id,
              position: tag.position,
              banners: toStringArray(tag.banners),
              enabled: tag.enabled === 1 || tag.enabled === true || tag.enabled === '1',
            },
          };
        }),
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
