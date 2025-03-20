import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import liff from "@line/liff";
import MessageLayout from "../../layouts/MessageLayout";
import { AuthContext } from "../../contexts/AuthContext";

const LineOARoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLineLoggedIn, setIsLineLoggedIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lineProfile, setLineProfile] = useState(null);
  const [redirectPath, setRedirectPath] = useState(null);
  const queryParams = new URLSearchParams(location.search);
  const { loginLineUid, userInfo } = useContext(AuthContext);

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
            setIsLineLoggedIn(true);
          } catch (profileError) {
            liff.logout();
            window.location.reload(); // รีโหลดหน้าเพื่อให้ผู้ใช้ล็อกอินใหม่
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const results = await loginLineUid(lineProfile.userId);
        if (results.status === 200) {
          const storedRedirectPath =
            localStorage.getItem("redirectPath") || "/mobile/main";
          setRedirectPath(storedRedirectPath);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (error?.response?.status === 401) {
          setRedirectPath("/mobile/verify");
        }
      }
    };

    if (lineProfile && !userInfo) {
      fetchUserProfile();
    }
  }, [lineProfile]);

  useEffect(() => {
    if (redirectPath) {
      navigate(redirectPath, { replace: true });
    }
  }, [redirectPath]);

  if (!isLineLoggedIn && !isLoggedIn) {
    return <MessageLayout loading={true} />;
  }

  return <Outlet context={{ lineProfile }} />;
};

export { LineOARoute };
