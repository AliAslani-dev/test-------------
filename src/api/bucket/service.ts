import { bucketApi } from '@/api';
import { getBucketDTO } from './dto';

export const getBucket = async () => {
  try {
    const response = await bucketApi.getBucketAPI();
    if (response && response.status === 200) {
      return getBucketDTO(response.data);
    }
  } catch (err) {
    console.error('Getting buckets failed.', err);
    return getBucketDTO([]);
  }
};

export const addBucket = async (name: string) => {
  try {
    const response = await bucketApi.addBucketAPI(name);
    return response.data;
  } catch (err) {
    console.error('Adding bucket failed.', err);
    throw err;
  }
};

export const bucketToggleEnabled = async (bucket_id: number) => {
  try {
    const response = await bucketApi.bucketToggleEnabledAPI(bucket_id);
    return response.data;
  } catch (err) {
    console.error('Enableing bucket failed.', err);
    throw err;
  }
};

export const editBucket = async (bucket_id: number, name: string) => {
  try {
    const response = await bucketApi.editBucketAPI(bucket_id, name);
    return response.data;
  } catch (err) {
    console.error('Editing bucket failed.', err);
    throw err;
  }
};
