import { Navigate, useNavigate, useLocation } from "react-router-dom";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";

import { endPoint, paths } from "../services/CorsPath.jsx";
import { axiosInstance } from "../services/CorsService.jsx";
import { message } from "antd";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage(); // เพิ่ม messageApi
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("users") ? true : false
  );
  const [userInfo, setUserInfo] = useState(localStorage.getItem("users"));

  let loading = false;

  const notifyLoadingState = (callback, state) => {
    loading = state;
    if (callback) callback(loading);
  };

  const showMsg = (type, content, duration = 2) => {
    return new Promise((resolve) => {
      messageApi.open({
        type,
        content,
        onClose: resolve, // เรียก resolve เมื่อข้อความปิด
        duration: duration, // กำหนดระยะเวลาแสดงข้อความ (2 วินาที)
      });
    });
  };

  // ตรวจสอบ Local Storage เมื่อเริ่มต้น
  useEffect(() => {
    const storedUser = localStorage.getItem("users");
    const storedToken = localStorage.getItem("accessToken");
    if (storedUser && storedToken) {
      setUserInfo(JSON.parse(storedUser));
      setIsLoggedIn(true);
    } else {
      logout();
    }
  }, []);

  const login = async (username, password, onLoadingChange = null) => {
    try {
      notifyLoadingState(onLoadingChange, true);
      const response = await axiosInstance.post(`${endPoint}/login`, {
        username,
        password,
      });

      if (response) {
        const userData = response.data.data.user;
        const accessToken = response.data.data.token;
        setIsLoggedIn(true);
        setUserInfo(userData);

        localStorage.setItem("users", JSON.stringify(userData));
        localStorage.setItem("accessToken", accessToken);

        return response.data;
      }
    } catch (error) {
      throw error;
    } finally {
      notifyLoadingState(onLoadingChange, false); // แจ้งว่า loading เสร็จแล้ว
    }
  };

  const logout = () => {
    // if (isLoggedIn) {
    setIsLoggedIn(false);
    setUserInfo(null);

    localStorage.removeItem("users");
    localStorage.removeItem("accessToken");
    console.log("เข้าฟังก์ชัน logout");
    navigate("/login");

    // }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userInfo,
        login,
        logout,
        showMsg,
      }}
    >
      {contextHolder}
      {children}
    </AuthContext.Provider>
  );
};
