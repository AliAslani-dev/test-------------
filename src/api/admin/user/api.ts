import { UserRole } from '@/constants';
import { axiosPrivate } from '@/api/axios';

const getUsersAPI = (role?: UserRole) => {
  const baseRoute = `/api/admin/users`;

  const route = role ? `${baseRoute}?role=${role}` : baseRoute;

  return axiosPrivate.get(route);
};

const getProvincesAPI = () => {
  return axiosPrivate.get('/api/admin/provinces');
};

const getCitiesAPI = (province_id: number) => {
  return axiosPrivate.get(`/api/admin/cities/${province_id}`);
};

const getRegionAPI = () => {
  return axiosPrivate.get('/api/public/region');
};

const addAdminUserAPI = (
  email: string,
  password: string,
  role: 'banking-admin' | 'banking-seller',
  bucketName?: string,
) => {
  const payload: any = {
    email,
    password,
    role,
  };

  if (role === 'banking-seller' && bucketName) {
    payload.bucket_name = bucketName;
  }

  const response = axiosPrivate.post('/api/admin/user', payload);
  return response;
};

const editAdminUserAPI = (user_id: number, email: string | null, password: string | null) => {
  let params: any = {};
  if (email) params.email = email;
  if (password) params.password = password;
  const response = axiosPrivate.put(`/api/admin/user/edit/${user_id}`, params);
  return response;
};

const addProviderUserAPI = (fd: FormData) => {
  return axiosPrivate.post('/api/admin/user', fd, {
    headers: { 'Content-Type': undefined },
  });
};

const editProviderUserAPI = (user_id: number, fd: FormData) => {
  return axiosPrivate.put(`/api/admin/user/edit/${user_id}`, fd, {
    headers: { 'Content-Type': undefined },
  });
};

const userToggleEnabledAPI = (user_id: number) => {
  const response = axiosPrivate.put(`/api/admin/user/toggle_enabled/${user_id}`);
  return response;
};

const userCheckDomainAPI = (domain: string) => {
  const response = axiosPrivate.post('/api/admin/check_domain', { domain });
  return response;
};

export {
  getUsersAPI,
  getProvincesAPI,
  getCitiesAPI,
  getRegionAPI,
  addAdminUserAPI,
  editAdminUserAPI,
  addProviderUserAPI,
  editProviderUserAPI,
  userToggleEnabledAPI,
  userCheckDomainAPI,
};
