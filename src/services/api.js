import axios from 'axios';
import { useAuthStore } from '@/src/store/useAuthStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Queue of requests waiting for a token refresh to complete
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const { refreshToken, setToken, logout } = useAuthStore.getState();

    // No refresh token stored → logout immediately
    if (!refreshToken) {
      logout();
      return Promise.reject(error);
    }

    // If a refresh is already in flight, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        { refresh_token: refreshToken },
      );

      const { access_token, refresh_token: newRefreshToken } = response.data;

      setToken(access_token, newRefreshToken);

      processQueue(null, access_token);
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
