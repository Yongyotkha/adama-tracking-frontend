import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import liff from "@line/liff";
import MessageLayout from "../../layouts/MessageLayout";
import { AuthContext } from "../../contexts/AuthContext";

const LineOARoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLineLoggedIn, setIsLineLoggedIn] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const { loginLineUid, userInfo } = useContext(AuthContext);
  const [lineProfile, setLineProfile] = useState(null);

  useEffect(() => {
    const initLIFF = async () => {
      try {
        await liff.init({
          liffId: "2007054859-ln0D549D",
          withLoginOnExternalBrowser: true,
        });

        if (liff.isLoggedIn()) {
          const lineProfile = await liff.getProfile();

          setLineProfile(lineProfile);
          setIsLineLoggedIn(true);
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
        // const results = await loginLineUid("admin");
        if (results.status === 200) {
          const redirectPath = localStorage.getItem("redirectPath");
          if (redirectPath) {
            sessionStorage.removeItem("redirectPath");
            navigate(redirectPath, { replace: true });
          }
        }
        console.log(results);
      } catch (error) {
        console.error("Error fetching user profile:", error);

        if (error?.response?.status === 401) {
          navigate("/mobile/verify");
        }
      }
    };
    if (lineProfile && !userInfo) {
      fetchUserProfile();
    } else {
      console.log(userInfo);
    }
  }, [lineProfile]);

  if (!isLineLoggedIn && !isLoggedIn) {
    return <MessageLayout loading={true}></MessageLayout>;
  }

  return <Outlet context={{ lineProfile }} />;
};

export { LineOARoute };
