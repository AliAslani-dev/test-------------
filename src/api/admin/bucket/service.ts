import { adminBucketApi } from '@/api';
import { getAdminBucketDTO } from './dto';

export const getAdminBucket = async () => {
  try {
    const response = await adminBucketApi.getAdminBucketAPI();
    if (response && response.status === 200) {
      return getAdminBucketDTO(response.data);
    }
  } catch (err) {
    console.error('Getting buckets failed.', err);
    return getAdminBucketDTO([]);
  }
};

export const addAdminBucket = async (userId: number, name: string, showName: number) => {
  try {
    const response = await adminBucketApi.addAdminBucketAPI(userId, name, showName);
    return response.data;
  } catch (err) {
    console.error('Adding bucket failed.', err);
    throw err;
  }
};

export const adminBucketToggleEnabled = async (bucket_id: number) => {
  try {
    const response = await adminBucketApi.adminBucketToggleEnabledAPI(bucket_id);
    return response.data;
  } catch (err) {
    console.error('Enabling bucket failed.', err);
    throw err;
  }
};

export const editAdminBucket = async (
  bucket_id: number,
  name: string | null,
  showName: number | null,
) => {
  try {
    const response = await adminBucketApi.editAdminBucketAPI(bucket_id, name, showName);
    return response.data;
  } catch (err) {
    console.error('Editing bucket failed.', err);
    throw err;
  }
};
