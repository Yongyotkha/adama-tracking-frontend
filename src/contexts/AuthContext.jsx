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

  let loading = false;

  const notifyLoadingState = (callback, state) => {
    loading = state;
    if (callback) callback(loading);
  };

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

  const login = async (username, password, onLoadingChange = null) => {
    try {
      notifyLoadingState(onLoadingChange, true);
      const response = await axiosInstance.post(`${endPoint}/login`, {
        username,
        password,
      });
      if (response) {
        const userData = response.data.data;
        const accessToken = response.data.data.token;
        setIsLoggedIn(true);
        setUserInfo(userData);
        setToken(accessToken);
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
    if (isLoggedIn) {
      setIsLoggedIn(false);
      setUserInfo(null);
      setToken(null);
      localStorage.removeItem("users");
      localStorage.removeItem("accessToken");

      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
