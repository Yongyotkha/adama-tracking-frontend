import { Navigate, useNavigate, useLocation } from "react-router-dom";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";

import { endPoint, paths } from "../services/CorsPath";
import { axiosInstance } from "../services/corsService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [token, setToken] = useState(null);

  // ตรวจสอบ Local Storage เมื่อเริ่มต้น
  useEffect(() => {
    const storedUser = localStorage.getItem("users");
    const storedToken = localStorage.getItem("accessToken");
    if (storedUser && storedToken) {
      setUserInfo(JSON.parse(storedUser));
      setToken(storedToken);
      setIsLoggedIn(true);
    } else {
      logout();
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post(`${endPoint}/login`, {
        username,
        password,
      });
      const userData = response.data.data;
      const accessToken = response.data.data.token;
      setIsLoggedIn(true);
      setUserInfo(userData);
      setToken(accessToken);
      localStorage.setItem("users", JSON.stringify(userData)); // เก็บข้อมูลผู้ใช้ใน Local Storage
      localStorage.setItem("accessToken", accessToken); // เก็บข้อมูลผู้ใช้ใน Local Storage
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    setToken(null);
    localStorage.removeItem("users"); // ลบข้อมูลผู้ใช้จาก Local Storage
    localStorage.removeItem("accessToken"); // ลบข้อมูลผู้ใช้จาก Local Storage

    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
