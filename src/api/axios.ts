import axios, { AxiosError } from 'axios';
import { getToken, removeToken } from '@/utils/auth';

export const axiosPublic = axios.create({
  baseURL: 'https://api.zarhub.net',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosPrivate = axios.create({
  baseURL: 'https://api.zarhub.net',
  withCredentials: true,
});

axiosPrivate.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRedirecting = false;

function redirectToLoginOnce() {
  if (typeof window === 'undefined') return;
  if (isRedirecting) return;
  isRedirecting = true;

  try {
    removeToken();

    const here = window.location.pathname + window.location.search + window.location.hash;

    const target = window.location.pathname.startsWith('/login')
      ? '/login'
      : `/login?next=${encodeURIComponent(here)}`;

    window.location.replace(target);
  } finally {
    setTimeout(() => (isRedirecting = false), 1500);
  }
}

axiosPrivate.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const cfg = error.config as typeof error.config & { skipAuthRedirect?: boolean };

    // if (!cfg?.skipAuthRedirect && (status === 403 || status === 401)) {
    //   redirectToLoginOnce();
    // }

    return Promise.reject(error);
  },
);

axiosPublic.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const cfg = error.config as typeof error.config & { skipAuthRedirect?: boolean };

    if (!cfg?.skipAuthRedirect && (status === 403 || status === 401)) {
      redirectToLoginOnce();
    }

    return Promise.reject(error);
  },
);
