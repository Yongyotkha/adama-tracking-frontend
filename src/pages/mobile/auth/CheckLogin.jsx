import React, { useEffect } from "react";
import MessageLayout from "../../../layouts/MessageLayout";
import liff from "@line/liff"; // ตรวจสอบให้แน่ใจว่ามีการติดตั้ง `@line/liff`
import { useNavigate, useOutletContext } from "react-router-dom";

export default function CheckLogin() {
  const navigate = useNavigate();
  const { userProfile } = useOutletContext();

  useEffect(() => {
    const redirectPath = localStorage.getItem("redirectPath");
    if (redirectPath) {
      sessionStorage.removeItem("redirectPath");

      // navigate(redirectPath, { replace: true });
    }
    console.log(userProfile);
  }, []);

  return <MessageLayout loading={true} />;
}
