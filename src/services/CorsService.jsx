import axios from "axios";
import { endPoint } from "./CorsPath";

// Set config defaults
export const axiosInstance = axios.create({
  baseURL: endPoint,
  headers: {
    "Content-Type": "application/json",
  },
  limit: "50mb",
  timeout: 30000,
});

// Add Interceptor for Authorization
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("users");
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

let loading = false;

const notifyLoadingState = (callback, state) => {
  loading = state;
  if (callback) callback(loading);
};

const handleRequest = async (method, url, dataOrParams, onLoadingChange) => {
  try {
    notifyLoadingState(onLoadingChange, true);
    const response = await axiosInstance({
      method,
      url,
      ...(method === "get" ? { params: dataOrParams } : { data: dataOrParams }),
    });
    return response.data;
  } catch (error) {
    throw error;
  } finally {
    notifyLoadingState(onLoadingChange, false);
  }
};

const useServiceAPI = {
  get: (url, params = {}, onLoadingChange = null) =>
    handleRequest("get", url, params, onLoadingChange),
  post: (url, data, onLoadingChange = null) =>
    handleRequest("post", url, data, onLoadingChange),
  put: (url, data, onLoadingChange = null) =>
    handleRequest("put", url, data, onLoadingChange),
  delete: (url, onLoadingChange = null) =>
    handleRequest("delete", url, null, onLoadingChange),
  isLoading: () => loading,
};

export default useServiceAPI;
