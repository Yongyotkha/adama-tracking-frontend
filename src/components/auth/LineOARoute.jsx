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
      //
      try {
        await liff.init({
          liffId: "2007785344-oN4zkdDM",
          withLoginOnExternalBrowser: true,
        });
        console.log("LIFF Init success");

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
            console.log('profile line liff : ', profile)
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



  if (isLineLoggedIn) {
    return <MessageLayout loading={isLineLoggedIn} />;
  }

  return <Outlet context={{ lineProfile }} />;
};

const LinePrivateRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLineLogin = async () => {
      try {
        await liff.init({
          liffId: "2007785075-3Yjw7OdO",
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

          const lineProfile = await liff.getProfile();
          if (lineProfile) {
            setProfile(lineProfile);
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        }
      } catch (err) {
        console.error("LIFF error:", err);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkLineLogin();
  }, []);

  if (loading) {
    return <MessageLayout loading={true} />;
  }
  console.log('profile : ', profile)
  console.log('isLoggedIn : ', isLoggedIn)
  if (isLoggedIn && profile) {
    return <Outlet context={{ lineProfile: profile }} />;
  } else {
    return <Navigate to="/mobile/verify" />;
  }
};


export { LineOARoute, LinePrivateRoute };
