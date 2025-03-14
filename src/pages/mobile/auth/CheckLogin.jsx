import React, { useEffect } from "react";
import MessageLayout from "../../../layouts/MessageLayout";
import liff from "@line/liff"; // ตรวจสอบให้แน่ใจว่ามีการติดตั้ง `@line/liff`

export default function CheckLogin() {
  useEffect(() => {
    const initLIFF = async () => {
      try {
        await liff.init({
          liffId: "2007054859-ln0D549D",
          withLoginOnExternalBrowser: true,
        });

        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          console.log("LINE Profile:", profile);
        }
      } catch (error) {
        console.error("LIFF Initialization Failed:", error);
      }
    };

    initLIFF();
  }, []);

  return <MessageLayout loading={true}></MessageLayout>;
}
