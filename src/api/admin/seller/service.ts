import { sellerApi } from '@/api';
import { FramesFilters, getAllFramesDTO, getTagDTO, getTagsDTO } from './dto';

export const getTags = async (categoryId: number) => {
  try {
    const response = await sellerApi.getTagsAPI(categoryId);
    if (response && response.status === 200) {
      return getTagsDTO(response.data);
    }
  } catch (err) {
    console.error('Getting seller tags failed.', err);
    return getTagsDTO([]);
  }
};

export const getTag = async (tagId: number) => {
  try {
    const response = await sellerApi.getTagAPI(tagId);
    if (response && response.status === 200) {
      return getTagDTO(response.data);
    }
  } catch (err) {
    console.error('Getting tag failed.', err);
    return {
      id: 0,
      sellerId: 0,
      name: '',
      categoryEnName: '',
      categoryFaName: '',
      categoryId: 0,
      position: 0,
      banners: [],
      enabled: false,
      bundles: [],
    };
  }
};

export const getAllFrames = async (fitlers: FramesFilters) => {
  try {
    const response = await sellerApi.getAllFramesAPI(fitlers);
    if (response && response.status === 200) {
      return getAllFramesDTO(response.data);
    }
  } catch (err) {
    console.error('Getting all frames failed.', err);
    return getAllFramesDTO({
      data: [],
      meta: {
        currentPage: 1,
        lastPage: 1,
        perPage: 25,
        total: 0,
      },
    });
  }
};

export const addTag = async (
  categoryId: number,
  userId: number,
  position: number,
  name: string,
  banner?: File | null,
  banner2?: File | null,
  banner3?: File | null,
) => {
  const fd = new FormData();

  // REQUIRED
  fd.append('position', JSON.stringify(position));
  fd.append('name', name);

  // OPTIONAL
  if (banner) fd.append('banner', banner, banner.name);
  if (banner2) fd.append('banner2', banner2, banner2.name);
  if (banner3) fd.append('banner3', banner3, banner3.name);

  return sellerApi.addTagAPI(categoryId, userId, fd).then((r) => r.data ?? r);
};

export const editTag = async (
  tagId: number,
  position: number,
  banner: File | null,
  banner2: File | null,
  banner3: File | null,
) => {
  const fd = new FormData();

  if (position) fd.append('position', JSON.stringify(position));
  if (banner) fd.append('banner', banner, banner.name);
  if (banner2) fd.append('banner2', banner2, banner2.name);
  if (banner3) fd.append('banner3', banner3, banner3.name);

  return sellerApi.editTagAPI(tagId, fd).then((r) => r.data ?? r);
};

export const toggleTagStatus = async (tagId: number) => {
  try {
    const response = await sellerApi.toggleTagStatusAPI(tagId);
    return response.data;
  } catch (err) {
    console.error('Toggle tag status failed.', err);
    throw err;
  }
};

export const assignFramesToTag = async (tagId: number, frameIds: number[]) => {
  try {
    const response = await sellerApi.assignFramesToTagAPI(tagId, frameIds);
    return response.data;
  } catch (err) {
    console.error('Assign frames to tag failed.', err);
    throw err;
  }
};

export const deleteFrameFromTag = async (bundleId: number) => {
  try {
    const response = await sellerApi.deleteFrameFromTagAPI(bundleId);
    return response.data;
  } catch (err) {
    console.error('Deleting fram from tag failed.', err);
    throw err;
  }
};
