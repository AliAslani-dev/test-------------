import { axiosPrivate } from '@/api/axios';
import { FramesFilters, FrameAdditionalFields } from './dto';

const getFramesByBucketAPI = (bucket_id: number, params: FramesFilters) => {
  const route = `/api/frames/${bucket_id}`;
  const response = axiosPrivate.get(route, { params });
  return response;
};

const getArchivedFramesByBucketAPI = (bucket_id: number, params: FramesFilters) => {
  const route = `/api/archived_frames/${bucket_id}`;
  const response = axiosPrivate.get(route, { params });
  return response;
};

const addFrameAPI = (bucket_id: number, fd: FormData) => {
  const response = axiosPrivate.post(`/api/frame/${bucket_id}`, fd, {
    headers: { 'Content-Type': undefined },
  });
  return response;
};

const editFrameAPI = (bucket_id: number, frame_id: number, fd: FormData) => {
  const response = axiosPrivate.put(`/api/frame/${bucket_id}/${frame_id}`, fd, {
    headers: { 'Content-Type': undefined },
  });
  return response;
};

const getFrameCategoriesAPI = () => {
  const route = `/api/categories`;
  const response = axiosPrivate.get(route);
  return response;
};

const getFrameGenderCategoriesAPI = () => {
  const route = `/api/gender_categories`;
  const response = axiosPrivate.get(route);
  return response;
};

const getFrameCaratsAPI = () => {
  const route = `/api/carats`;
  const response = axiosPrivate.get(route);
  return response;
};

const frameToggleArchiveAPI = (bucket_id: number, frame_id: number) => {
  const response = axiosPrivate.put(`/api/archive/frame/${bucket_id}/${frame_id}`);
  return response;
};

const frameToggleUnarchiveAPI = (bucket_id: number, frame_id: number) => {
  const response = axiosPrivate.put(`/api/unarchive/frame/${bucket_id}/${frame_id}`);
  return response;
};

export {
  getFramesByBucketAPI,
  getArchivedFramesByBucketAPI,
  addFrameAPI,
  editFrameAPI,
  getFrameCategoriesAPI,
  getFrameGenderCategoriesAPI,
  getFrameCaratsAPI,
  frameToggleArchiveAPI,
  frameToggleUnarchiveAPI,
};
