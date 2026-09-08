import { axiosPrivate } from '@/api/axios';

const getBucketAPI = () => {
  const route = '/api/buckets';
  const response = axiosPrivate.get(route);
  return response;
};

const addBucketAPI = (name: string) => {
  const response = axiosPrivate.post('/api/bucket', {
    name,
  });
  return response;
};

const bucketToggleEnabledAPI = (bucket_id: number) => {
  const response = axiosPrivate.put(`/api/bucket/toggle_enabled/${bucket_id}`);
  return response;
};

const editBucketAPI = (bucket_id: number, name: string) => {
  const response = axiosPrivate.put(`/api/bucket/edit/${bucket_id}`, {
    name,
  });
  return response;
};

export { getBucketAPI, addBucketAPI, bucketToggleEnabledAPI, editBucketAPI };
