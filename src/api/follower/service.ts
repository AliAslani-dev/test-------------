import { requestApi } from '@/api';
import { getFollowRequestsDTO, getZarplusUsersDTO } from './dto';

export const getFollowRequests = async (zarhubUserId: number) => {
  try {
    const response = await requestApi.getFollowRequestsAPI(zarhubUserId);
    if (response && response.status === 200) {
      return getFollowRequestsDTO(response.data);
    }
  } catch (err) {
    console.error('Getting view requests failed.', err);
    return getFollowRequestsDTO([]);
  }
};

export const getZarplusUsers = async () => {
  try {
    const response = await requestApi.getZarplusUsersAPI();
    if (response && response.status === 200) {
      return getZarplusUsersDTO(response.data);
    }
  } catch (err) {
    console.error('Getting zarplus users failed.', err);
    return getZarplusUsersDTO([]);
  }
};

export const followRequestChangeStatus = async (viewRequestId: number, status: -1 | 0 | 1) => {
  try {
    const response = await requestApi.followRequestChangeStatusAPI(viewRequestId, status);
    return response.data;
  } catch (err) {
    console.error('View request change status failed.', err);
    throw err;
  }
};
