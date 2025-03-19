import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import MessageLayout from "../../../layouts/MessageLayout";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/CorsService";
import liff from "@line/liff";

export default function CheckLogin() {
  const navigate = useNavigate();
  const { userProfile } = useOutletContext();
  const [lineProfile, setLineProfile] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        // ตรวจสอบว่า LIFF ถูก init แล้ว
        if (!liff.isLoggedIn()) {
          liff.login(); // บังคับให้ login ถ้ายังไม่ได้ login
          return;
        }

        // ดึงข้อมูลจาก LIFF Token
        const idToken = liff.getDecodedIDToken();
        if (!idToken) {
          console.error("Failed to retrieve ID Token.");
          navigate("/mobile/verify", { replace: true });
          return;
        }

        // ตั้งค่าข้อมูลโปรไฟล์จาก LIFF
        const profileData = {
          name: idToken.name,
          picture: idToken.picture,
          user_id: idToken.sub, // `sub` คือ Line User ID
        };
        setLineProfile(profileData);

        // เรียก API ส่ง user_id ไปตรวจสอบ
        const response = await useServiceAPI.post(paths.pathCheckLoginShop, {
          user_id: profileData.user_id,
        });

        // ตรวจสอบผลลัพธ์ API
        if (response.status === 200 && response.result) {
          navigate("/mobile/main", { replace: true });
        } else {
          navigate("/mobile/verify", { replace: true });
        }
      } catch (error) {
        console.error("Error checking login:", error);
        navigate("/mobile/verify", { replace: true });
      }
    };

    checkLogin();
    console.log(userProfile);
    console.log(lineProfile);
  }, [navigate]);

  return <MessageLayout loading={true} />;
}
