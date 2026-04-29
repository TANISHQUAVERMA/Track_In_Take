// src/api/axiosInstance.js
import axios from "axios";
import { refreshToken as refreshTokenAPI } from "./auth";
import { getToken, setToken } from "../services/tokenService";
import { forceLogout } from "./logoutHelper";


const BASE_URL =
  import.meta.env.VITE_API_URL ;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 200000,

});

// REQUEST INTERCEPTOR: Attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------
// Refresh Token Logic
// --------------------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refresh = localStorage.getItem("refreshToken");
        const res = await refreshTokenAPI(refresh);

        const newAccessToken = res.data.access;
        setToken(newAccessToken);
        axiosInstance.defaults.headers.common["Authorization"] = "Bearer " + newAccessToken;

        processQueue(null, newAccessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error("🔴 Refresh token failed. Logging out...");
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
