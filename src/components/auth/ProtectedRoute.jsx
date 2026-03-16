import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useContext, useMemo } from "react";

const normalizePath = (path) => {
  if (!path) return null;
  return path.startsWith("/") ? path : `/${path}`;
};

const hasDashboardPermission = (menuPermissions = []) => {
  return menuPermissions.some((menu) => menu.url === "/" || menu.url === "/dashboard" || menu.url === "dashboard");
};

const getFirstAccessiblePath = (menuPermissions = []) => {
  for (const menu of menuPermissions) {
    if (menu.url && menu.url !== "/") {
      return normalizePath(menu.url);
    }

    if (menu.dropdownItems?.length) {
      const firstDropdown = menu.dropdownItems.find((item) => item.url);
      if (firstDropdown?.url) {
        return normalizePath(firstDropdown.url);
      }
    }
  }

  return null;
};

const ProtectedRoute = () => {
  const { userInfo } = useContext(AuthContext);
  const location = useLocation();

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (userInfo?.is_otp || userInfo?.is_change_password) {
    return <Navigate to="/verify-otp" replace />;
  }

  const menuPermissions = userInfo?.menu_permissions || [];
  const canUseDashboard = hasDashboardPermission(menuPermissions);
  const firstAccessiblePath = getFirstAccessiblePath(menuPermissions);

  // ถ้าเข้า root path "/" แล้ว role นี้ไม่มี dashboard
  // ให้ redirect ไปเมนูแรกที่มีสิทธิ์แทน
  if (location.pathname === "/" && !canUseDashboard) {
    if (firstAccessiblePath) {
      return <Navigate to={firstAccessiblePath} replace />;
    }
    return <Navigate to="/error/403" replace />;
  }

  return <Outlet />;
};

const PublicRoute = () => {
  const { userInfo } = useContext(AuthContext);

  if (userInfo && !userInfo?.is_otp && !userInfo?.is_change_password) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export { ProtectedRoute, PublicRoute };