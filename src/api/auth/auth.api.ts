import { axiosPrivate, axiosPublic } from '../axios';

export const login = (data: { username: string; password: string }) => {
  return axiosPublic.post('/api/auth/login', { ...data });
};

export const get2FStatus = () => {
  const route = `/api/auth/2f_status`;
  const response = axiosPrivate.get(route);
  return response;
};
