import { axiosPrivate } from '@/api/axios';

const getFollowRequestsAPI = (zarhub_user_id: number) => {
  const route = `/api/zarhub_view_requests/${zarhub_user_id}`;
  const response = axiosPrivate.get(route);
  return response;
};

const getZarplusUsersAPI = () => {
  const route = `/api/zarplus_users`;
  const response = axiosPrivate.get(route);
  return response;
};

const followRequestChangeStatusAPI = (view_request_id: number, status: -1 | 0 | 1) => {
  const response = axiosPrivate.put(`/api/view_request_change_status/${view_request_id}`, {
    status,
  });
  return response;
};

export { getFollowRequestsAPI, getZarplusUsersAPI, followRequestChangeStatusAPI };
