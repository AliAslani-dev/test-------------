import { axiosPrivate } from '@/api/axios';

const getAdminBucketAPI = () => {
  const route = '/api/admin/buckets';
  const response = axiosPrivate.get(route);
  return response;
};

const addAdminBucketAPI = (userId: number, name: string, show_name: number) => {
  const response = axiosPrivate.post('/api/admin/bucket', {
    user_id: userId,
    name,
    show_name,
  });
  return response;
};

const adminBucketToggleEnabledAPI = (bucket_id: number) => {
  const response = axiosPrivate.put(`/api/admin/bucket/toggle_enabled/${bucket_id}`);
  return response;
};

const editAdminBucketAPI = (bucket_id: number, name: string | null, show_name: number | null) => {
  const data: any = {};
  if (name !== null) data.name = name;
  if (show_name !== null) data.show_name = show_name;
  const response = axiosPrivate.put(`/api/admin/bucket/edit/${bucket_id}`, data);
  return response;
};

export { getAdminBucketAPI, addAdminBucketAPI, adminBucketToggleEnabledAPI, editAdminBucketAPI };
