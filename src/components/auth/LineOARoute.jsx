import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import liff from "@line/liff";
import MessageLayout from "../../layouts/MessageLayout";

const LineOARoute = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initLIFF = async () => {
      try {
        await liff.init({
          liffId: "2007054859-ln0D549D",
          withLoginOnExternalBrowser: true,
        });

        if (liff.isLoggedIn()) {
          setIsLoggedIn(true);
        } else {
          liff.login();
        }
      } catch (error) {
        console.error("LIFF Initialization Failed:", error);
      }
    };

    initLIFF();
  }, []);

  if (!isLoggedIn) {
    return <MessageLayout loading={true}></MessageLayout>;
  }

  return <Outlet />;
};

export { LineOARoute };
