import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useContext, useEffect } from "react";

const ProtectedRoute = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!userInfo) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    if (userInfo?.is_otp) {
      navigate("/verify-otp");
    } else if (userInfo?.is_change_password) {
      navigate("/change-password");
    }
  }, [userInfo, navigate]);

  

  return <Outlet />;
};
export default ProtectedRoute;
