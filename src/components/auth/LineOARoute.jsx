import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import liff from "@line/liff";
import MessageLayout from "../../layouts/MessageLayout";
import { AuthContext } from "../../contexts/AuthContext";

const LineOARoute = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLineLoggedIn, setIsLineLoggedIn] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const { loginLineUid } = useContext(AuthContext);
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
    if (lineProfile) {
      try {
        const userProfile = loginLineUid(lineProfile.userId);
        console.log(userProfile);
      } catch (error) {
        console.log(error);
      }
    }
  }, [lineProfile]);

  if (!isLineLoggedIn && !isLoggedIn) {
    return <MessageLayout loading={true}></MessageLayout>;
  }

  return <Outlet context={{ lineProfile }} />;
};

export { LineOARoute };
