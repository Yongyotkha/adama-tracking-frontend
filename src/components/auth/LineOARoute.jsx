import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import liff from "@line/liff"; // ตรวจสอบให้แน่ใจว่ามีการติดตั้ง `@line/liff`

const LineOARoute = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const initLIFF = async () => {
      try {
        await liff.init({ liffId: "2007054859-ln0D549D", withLoginOnExternalBrowser: true });

        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          console.log("LINE Profile:", profile);
          setUserName(profile.displayName);
        } else {
          liff.login();
        }
      } catch (error) {
        console.error("LIFF Initialization Failed:", error);
      }
    };

    initLIFF();
  }, []);

  return <Outlet />;
};

export { LineOARoute };
