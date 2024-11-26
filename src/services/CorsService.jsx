import axios from "axios";
import { endPoint } from "./CorsPath";
import { useLocation } from "react-router-dom";

// Set config defaults
export const axiosInstance = axios.create({
  baseURL: endPoint,
  headers: {
    "Content-Type": "application/json",
  },
  limit: "50mb",
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

const handleUnauthorized = (pathname) => {
  if (pathname !== "/login") {
    localStorage.removeItem("users");
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  }
};

export const useAxiosWithInterceptor = () => {
  const location = useLocation();

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        handleUnauthorized(location.pathname);
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

let loading = false;

const notifyLoadingState = (callback, state) => {
  loading = state;
  if (callback) callback(loading);
};

const handleRequest = async (method, url, dataOrParams, onLoadingChange) => {
  try {
    notifyLoadingState(onLoadingChange, true);

    let requestData = dataOrParams;
    let config = {
      method,
      url,
    };

    // Check if the payload is FormData
    if (dataOrParams instanceof FormData) {
      requestData.append("platform", "web"); // Add platform field directly to FormData
      config.data = requestData;
      config.headers = { "Content-Type": "multipart/form-data" }; // Override default Content-Type
    } else if (method === "get") {
      config.params = { ...dataOrParams, platform: "web" }; // For GET requests
    } else {
      config.data = { ...dataOrParams, platform: "web" };
    }

    const response = await axiosInstance(config);

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      handleUnauthorized(location.pathname);
    } 

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
  delete: (url, data = null, onLoadingChange = null) =>
    handleRequest("delete", url, data, onLoadingChange),
  
  isLoading: () => loading,
};

export default useServiceAPI;
