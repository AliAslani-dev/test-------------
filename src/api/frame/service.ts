import { frameApi } from '@/api';
import { createBlurredImageFile } from '@/utils';
import {
  FramesFilters,
  getFrameCaratsDTO,
  getFramesByBucketDTO,
  FrameAdditionalFields,
  getFrameCategoriesDTO,
  getFrameGenderCategoriesDTO,
} from './dto';

export const getFramesByBucket = async (bucket_id: number, params: FramesFilters) => {
  try {
    const response = await frameApi.getFramesByBucketAPI(bucket_id, params);
    if (response && response.status === 200) {
      return getFramesByBucketDTO(response.data);
    }
  } catch (err) {
    console.error('Getting frames failed.', err);
    return {
      bucketName: '',
      frames: [],
      meta: {
        currentPage: 1,
        lastPage: 1,
        perPage: 25,
        total: 0,
      },
    };
  }
};

export const getArchivedFramesByBucket = async (bucket_id: number, params: FramesFilters) => {
  try {
    const response = await frameApi.getArchivedFramesByBucketAPI(bucket_id, params);
    if (response && response.status === 200) {
      return getFramesByBucketDTO(response.data);
    }
  } catch (err) {
    console.error('Getting archived frames failed.', err);
    return {
      bucketName: '',
      frames: [],
      meta: {
        currentPage: 0,
        lastPage: 0,
        perPage: 25,
        total: 0,
      },
    };
  }
};

export const addFrame = async (
  bucketId: number,
  categories: number[],
  wage: string,
  profit: string,
  carat: string,
  model: string,
  discount: string,
  additionalFields: FrameAdditionalFields | null,
  minWeight: number,
  maxWeight: number,
  totalWeight: number,
  blur: number,
  cover: File,
  cover2?: File,
  cover3?: File,
) => {
  const fd = new FormData();
  fd.append('bucket_id', JSON.stringify(bucketId));
  fd.append('categories', JSON.stringify(categories));
  fd.append('wage', wage);
  fd.append('profit', profit);
  fd.append('carat', carat);
  fd.append('model', model);
  fd.append('discount', discount);
  fd.append('additional_fields', JSON.stringify(additionalFields));
  fd.append('min_weight', JSON.stringify(minWeight));
  fd.append('max_weight', JSON.stringify(maxWeight));
  fd.append('total_weight', JSON.stringify(totalWeight));
  fd.append('blur', JSON.stringify(blur));

  fd.append('cover', cover, cover.name);
  if (cover2) fd.append('cover2', cover2, cover2.name);
  if (cover3) fd.append('cover3', cover3, cover3.name);

  const blurredCover = await createBlurredImageFile(cover, {
    blurRadiusInOriginalPx: 40,
    maxDimension: 300,
    quality: 0.7,
    outputFormat: 'image/jpeg',
  });
  if (blurredCover) {
    fd.append('blurred_cover', blurredCover, blurredCover.name);
  } else {
    console.error('Failed to create blurred cover');
  }

  return frameApi.addFrameAPI(bucketId, fd).then((response) => response.data ?? response);
};

export const editFrame = async (
  bucketId: number,
  frameId: number,
  wage?: string,
  profit?: string,
  model?: string,
  discount?: string,
  additionalFields?: FrameAdditionalFields | null,
  minWeight?: number,
  maxWeight?: number,
  totalWeight?: number,
  blur?: number,
  cover?: File,
  cover2?: File,
  cover3?: File,
) => {
  const fd = new FormData();
  if (wage !== undefined) fd.append('wage', wage);
  if (profit !== undefined) fd.append('profit', profit);
  if (model !== undefined) fd.append('model', model);
  if (discount !== undefined) fd.append('discount', discount);
  if (additionalFields !== undefined)
    fd.append('additional_fields', JSON.stringify(additionalFields));
  if (minWeight !== undefined) fd.append('min_weight', JSON.stringify(minWeight));
  if (maxWeight !== undefined) fd.append('max_weight', JSON.stringify(maxWeight));
  if (totalWeight !== undefined) fd.append('total_weight', JSON.stringify(totalWeight));
  if (blur !== undefined) fd.append('blur', JSON.stringify(blur));

  if (cover !== undefined) {
    fd.append('cover', cover, cover.name);
    const blurredCover = await createBlurredImageFile(cover, {
      blurRadiusInOriginalPx: 40,
      maxDimension: 300,
      quality: 0.7,
      outputFormat: 'image/jpeg',
    });
    if (blurredCover) {
      fd.append('blurred_cover', blurredCover, blurredCover.name);
    } else {
      console.error('Failed to create blurred cover');
    }
  }
  if (cover2 !== undefined) fd.append('cover2', cover2, cover2.name);
  if (cover3 !== undefined) fd.append('cover3', cover3, cover3.name);

  return frameApi.editFrameAPI(bucketId, frameId, fd).then((response) => response.data ?? response);
};

export const getFrameCategories = async () => {
  try {
    const response = await frameApi.getFrameCategoriesAPI();
    if (response && response.status === 200) {
      return getFrameCategoriesDTO(response.data);
    }
  } catch (err) {
    console.error('Getting frame categories failed.', err);
    return getFrameCategoriesDTO([]);
  }
};

export const getFrameGenderCategories = async () => {
  try {
    const response = await frameApi.getFrameGenderCategoriesAPI();
    if (response && response.status === 200) {
      return getFrameGenderCategoriesDTO(response.data);
    }
  } catch (err) {
    console.error('Getting frame gender categories failed.', err);
    return getFrameGenderCategoriesDTO([]);
  }
};

export const getFrameCarats = async () => {
  try {
    const response = await frameApi.getFrameCaratsAPI();
    if (response && response.status === 200) {
      return getFrameCaratsDTO(response.data);
    }
  } catch (err) {
    console.error('Getting frame carats failed.', err);
    return [];
  }
};

export const frameToggleArchive = async (bucket_id: number, frame_id: number) => {
  try {
    const response = await frameApi.frameToggleArchiveAPI(bucket_id, frame_id);
    return response.data;
  } catch (err) {
    console.error('Archiving frame failed.', err);
    throw err;
  }
};

export const frameToggleUnarchive = async (bucket_id: number, frame_id: number) => {
  try {
    const response = await frameApi.frameToggleUnarchiveAPI(bucket_id, frame_id);
    return response.data;
  } catch (err) {
    console.error('Unarchiving frame failed.', err);
    throw err;
  }
};
