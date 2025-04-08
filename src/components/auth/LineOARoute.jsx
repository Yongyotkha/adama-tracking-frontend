import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import liff from "@line/liff";
import MessageLayout from "../../layouts/MessageLayout";
import { AuthContext } from "../../contexts/AuthContext";

const LineOARoute = () => {
  const location = useLocation();
  const [isLineLoggedIn, setIsLineLoggedIn] = useState(false);
  const [lineProfile, setLineProfile] = useState(null);
  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    const initLIFF = async () => {
      try {
        await liff.init({
          liffId: "2007054859-ln0D549D",
          withLoginOnExternalBrowser: true,
        });

        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          const accessToken = liff.getAccessToken();
          if (!accessToken) {
            liff.login();
            return;
          }

          try {
            const profile = await liff.getProfile();
            setLineProfile(profile);
            setIsLineLoggedIn(false);
          } catch (profileError) {
            liff.logout();
          }
        }
      } catch (error) {
        console.error("LIFF Initialization Failed:", error);
      }
    };

    if (queryParams.get("richMenu")) {
      localStorage.setItem("redirectPath", location.pathname);
    }

    initLIFF();
  }, []);



  if (!isLineLoggedIn) {
    return <MessageLayout loading={!isLineLoggedIn} />;
  }

  return <Outlet context={{ lineProfile }} />;
};

const LinePrivateRoute = () => {
  const { userInfo } = useContext(AuthContext);

  if (userInfo) {
    return <Outlet />;
  } else {
    return <Navigate to="/mobile/verify" />;
  }
};

export { LineOARoute, LinePrivateRoute };
