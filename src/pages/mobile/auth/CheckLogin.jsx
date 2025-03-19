import React, { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import MessageLayout from "../../../layouts/MessageLayout";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/CorsService";

export default function CheckLogin() {
  const navigate = useNavigate();
  const { userProfile } = useOutletContext();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await useServiceAPI.post(paths.pathCheckLoginShop);

        if (response.status === 200 && response.result) {
          // ถ้าเข้าสู่ระบบสำเร็จ
          navigate("/mobile/main", { replace: true });
        } else {
          // ถ้าการเข้าสู่ระบบล้มเหลว
          navigate("/mobile/verify", { replace: true });
        }
      } catch (error) {
        console.error("Error checking login:", error);
        navigate("/mobile/verify", { replace: true });
      }
    };

    checkLogin();
    console.log(userProfile);
  }, [navigate]);

  return <MessageLayout loading={true} />;
}
