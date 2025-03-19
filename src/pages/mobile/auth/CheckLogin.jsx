import React, { useEffect } from "react";
import MessageLayout from "../../../layouts/MessageLayout";
import liff from "@line/liff"; // ตรวจสอบให้แน่ใจว่ามีการติดตั้ง `@line/liff`
import { useNavigate } from "react-router-dom";

export default function CheckLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectPath = localStorage.getItem("redirectPath");
    if (redirectPath) {
      sessionStorage.removeItem("redirectPath");
      navigate(redirectPath, { replace: true });
    } else {
      navigate("/mobile/main");
    }
  }, []);

  return <MessageLayout loading={true} />;
}
