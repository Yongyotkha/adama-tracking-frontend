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
import { message, notification } from "antd";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage(); // เพิ่ม messageApi
  const [api, contextNotiHolder] = notification.useNotification();

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("users") ? true : false
  );
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("users"))
  );

  let loading = false;

  const notifyLoadingState = (callback, state) => {
    loading = state;
    if (callback) callback(loading);
  };

  const showMsg = (type, content, duration = 1) => {
    return new Promise((resolve) => {
      messageApi.open({
        type,
        content,
        onClose: resolve, // เรียก resolve เมื่อข้อความปิด
        duration: duration, // กำหนดระยะเวลาแสดงข้อความ (2 วินาที)
      });
    });
  };

  const showNotification = (type, title, line, duration = 1) => {
    // type 'success' | 'info' | 'warning' | 'error';

    const description = Array.isArray(line)
      ? line.map((text) => `<span>${text}</span>`).join("<br>") // ใช้ HTML <br> เพื่อเว้นบรรทัด
      : line;

    return new Promise((resolve) => {
      api[type]({
        message: title,
        description: <div dangerouslySetInnerHTML={{ __html: description }} />,
        duration: duration,
        showProgress: true,
        pauseOnHover: false,
        onClose: resolve,
      });
    });
  };

  // ตรวจสอบ Local Storage เมื่อเริ่มต้น
  useEffect(() => {
    const storedUser = localStorage.getItem("users");
    const storedToken = localStorage.getItem("accessToken");
    if (storedUser && storedToken) {
      const userInfo = JSON.parse(storedUser);
    
      setUserInfo(userInfo);
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
        const expiredToken = response.data.data.token_expired_date;
        setIsLoggedIn(true);
        setUserInfo(userData);

        console.log(response.data.data);

        localStorage.setItem("users", JSON.stringify(userData));
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("expiredToken", expiredToken);

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
    localStorage.removeItem("expiredToken");

    console.log("เข้าฟังก์ชัน logout");
    navigate("/login");

    // }
  };

  const formatNumber = (number) => {
    if (isNaN(number) || number == null) return "0.00";
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userInfo,
        login,
        logout,
        showMsg,
        showNotification,
        formatNumber,
      }}
    >
      {contextHolder}
      {contextNotiHolder}
      {children}
    </AuthContext.Provider>
  );
};
