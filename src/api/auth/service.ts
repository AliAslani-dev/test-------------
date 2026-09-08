import { mapToCurrentUser, CurrentUser } from './dto';
import { removeToken, setToken } from '@/utils/auth';
import { login as loginApi, get2FStatus as get2FStatusAPI } from '@/api/auth/auth.api';

export const login = async (username: string, password: string): Promise<{ token: string }> => {
  const response = await loginApi({ username, password });
  const token = response?.data?.token;
  if (!token) throw new Error('Missing token');

  setToken(token);

  try {
    // فقط برای اطمینان از معتبر و فعال بودن حساب قبل از هدایت به داشبورد
    await get2FStatus();
  } catch (err) {
    removeToken();
    throw err;
  }

  return { token };
};

export const get2FStatus = async (): Promise<CurrentUser> => {
  const response = await get2FStatusAPI();
  if (!response || response.status !== 200) {
    throw new Error('Failed to fetch current user status.');
  }

  const user = mapToCurrentUser(response.data);
  if (!user) {
    throw new Error('Invalid user data received from server.');
  }

  return user;
};