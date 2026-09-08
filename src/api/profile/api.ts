import { axiosPrivate } from '@/api/axios';

const getProfileAPI = () => {
  const route = '/api/profile';
  const response = axiosPrivate.get(route);
  return response;
};

const editProfileAPI = (fd: FormData) => {
  return axiosPrivate.put(`/api/profile`, fd, {
    headers: { 'Content-Type': undefined },
  });
};

export { getProfileAPI, editProfileAPI };
