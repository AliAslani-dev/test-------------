import { axiosPrivate } from '@/api/axios';
import { FramesFilters } from './dto';

const getTagsAPI = (categoryId: number) => {
  const route = `/api/admin/seller/tags/${categoryId}`;
  const response = axiosPrivate.get(route);
  return response;
};

const getTagAPI = (tagId: number) => {
  const route = `/api/admin/seller/tag/${tagId}`;
  const response = axiosPrivate.get(route);
  return response;
};

const getAllFramesAPI = (params: FramesFilters) => {
  const route = `/api/admin/seller/all_frames`;
  const response = axiosPrivate.get(route, { params });
  return response;
};

const addTagAPI = (categoryId: number, userId: number, fd: FormData) => {
  return axiosPrivate.post(`/api/admin/seller/new_tag/${categoryId}/${userId}`, fd, {
    headers: { 'Content-Type': undefined },
  });
};

const editTagAPI = (tagId: number, fd: FormData) => {
  return axiosPrivate.put(`/api/admin/seller/update_tag/${tagId}`, fd, {
    headers: { 'Content-Type': undefined },
  });
};

const toggleTagStatusAPI = (tagId: number) => {
  const response = axiosPrivate.put(`/api/admin/seller/toggle_tag_status/${tagId}`);
  return response;
};

const assignFramesToTagAPI = (tagId: number, frameIds: number[]) => {
  const response = axiosPrivate.post(`/api/admin/seller/assign_tags/${tagId}`, {
    frame_ids: frameIds,
  });
  return response;
};

const deleteFrameFromTagAPI = (bundleId: number) => {
  const response = axiosPrivate.delete(`/api/admin/seller/delete_bundle/${bundleId}`);
  return response;
};

export {
  getTagAPI,
  getTagsAPI,
  getAllFramesAPI,
  addTagAPI,
  editTagAPI,
  toggleTagStatusAPI,
  assignFramesToTagAPI,
  deleteFrameFromTagAPI,
};
