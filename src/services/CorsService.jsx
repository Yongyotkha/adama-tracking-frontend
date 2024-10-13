import axios from "axios";
import { endPoint, paths } from "./CorsPath";
import { AuthContext } from "../contexts/AuthContext";

// Set config defaults when creating the instance
const storedToken = localStorage.getItem("accessToken");
export const axiosInstance = axios.create({
  baseURL: endPoint,
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + storedToken,
  },
  limit: "50mb",
  timeout: 30000,
});

let loading = false; // สร้างตัวแปร loading ภายใน service

// สร้างฟังก์ชันสำหรับแจ้งการเปลี่ยนสถานะ loading ไปที่ component
const notifyLoadingState = (callback, state) => {
  loading = state;
  if (callback) callback(loading); // เรียก callback เพื่ออัปเดต state ใน component
};

const useServiceAPI = {
  get: async (url, params = {}, onLoadingChange = null) => {
    try {
      notifyLoadingState(onLoadingChange, true); // แจ้งว่าเริ่ม loading
      const response = await axiosInstance.get(url, { params });
      return response; // คืนค่า response กลับไปที่ component
    } catch (error) {
      // 401 Unauthorized
      if (error.status == 401) {
        const { logout } = useContext(AuthContext);
        logout();
      }
      throw error;
    } finally {
      notifyLoadingState(onLoadingChange, false); // แจ้งว่า loading เสร็จแล้ว
    }
  },

  post: async (url, data, onLoadingChange = null) => {
    try {
      notifyLoadingState(onLoadingChange, true);
      const response = await axiosInstance.post(url, data);
      return response;
    } catch (error) {
      // 401 Unauthorized
      if (error.status == 401) {
        const { logout } = useContext(AuthContext);
        logout();
      }
      throw error;
    } finally {
      notifyLoadingState(onLoadingChange, false);
    }
  },

  put: async (url, data, onLoadingChange = null) => {
    try {
      notifyLoadingState(onLoadingChange, true);
      const response = await axiosInstance.put(url, data);
      return response;
    } catch (error) {
      // 401 Unauthorized
      if (error.status == 401) {
        const { logout } = useContext(AuthContext);
        logout();
      }
      throw error;
    } finally {
      notifyLoadingState(onLoadingChange, false);
    }
  },

  delete: async (url, onLoadingChange = null) => {
    try {
      notifyLoadingState(onLoadingChange, true);
      const response = await axiosInstance.delete(url);
      return response;
    } catch (error) {
      // 401 Unauthorized
      if (error.status == 401) {
        const { logout } = useContext(AuthContext);
        logout();
      }
      throw error;
    } finally {
      notifyLoadingState(onLoadingChange, false);
    }
  },

  // สร้าง method สำหรับตรวจสอบสถานะ loading
  isLoading: () => loading,
};

export default useServiceAPI;
