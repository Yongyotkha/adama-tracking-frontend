import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useContext, useEffect } from "react";

const ProtectedRoute = () => {
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  // ถ้ายังไม่ได้ล็อกอิน ให้เปลี่ยนเส้นทางไปหน้า Login
  if (!userInfo) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    if (userInfo?.is_otp) {
      navigate("/verify-otp");
    } else if (userInfo?.is_change_password) {
      navigate("/change-password");
    }
  });
  return <Outlet />;
};

const PublicRoute = () => {
  const { userInfo } = useContext(AuthContext);

  // if (!userInfo?.is_otp && !userInfo?.is_change_password) {
  if (userInfo && !userInfo?.is_otp && !userInfo?.is_change_password) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export { ProtectedRoute, PublicRoute };
