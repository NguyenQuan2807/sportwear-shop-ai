import axios from "axios";
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  saveAuthSession,
  setAccessToken,
} from "../utils/tokenStorage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const shouldSkipRefresh =
      originalRequest?._retry ||
      originalRequest?.url?.includes("/api/auth/login") ||
      originalRequest?.url?.includes("/api/auth/register") ||
      originalRequest?.url?.includes("/api/auth/refresh");

    if (error?.response?.status !== 401 || shouldSkipRefresh) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await refreshClient.post("/api/auth/refresh", {
        refreshToken,
      });

      saveAuthSession(response.data);

      const nextAccessToken = response?.data?.accessToken || response?.data?.token;
      if (nextAccessToken) {
        setAccessToken(nextAccessToken);
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      }

      return axiosClient(originalRequest);
    } catch (refreshError) {
      clearAuthSession();

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    }
  }
);

export default axiosClient;
