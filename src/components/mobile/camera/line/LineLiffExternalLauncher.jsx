// src/components/mobile/camera/line/LineLiffExternalLauncher.jsx
import React, { useEffect } from "react";

/**
* LINE LIFF (Android) launcher: เปิดลิงก์ภายนอกไป Chrome เพื่อใช้งานกล้องเต็มรูปแบบ
* - ใช้ได้ 2 วิธี: liff.openWindow({ external: true }) และ Android intent ไป com.android.chrome
* - แนะนำให้ใช้คอมโพเนนต์นี้เฉพาะตอนเปิดจาก LINE บน Android
*/
export default function LineLiffExternalLauncher({
  message = "เปิดด้วย Chrome เพื่อใช้งานกล้องได้เต็มรูปแบบ",
  buttonText = "เปิดด้วย Chrome",
  targetUrl,
  auto = false,
  children,
}) {
  const url = targetUrl || (typeof window !== "undefined" ? window.location.href : "");


  const openExternal = () => {
    const liff = typeof window !== "undefined" ? window.liff : undefined;
    // 1) ถ้ามี LIFF API และพร้อมใช้งาน ให้เปิด external ทันที
    try {
      if (liff && typeof liff.openWindow === "function") {
        liff.openWindow({ url, external: true });
        return;
      }
    } catch { }


    // 2) Fallback: Android intent เพื่อบังคับเปิด Chrome
    try {
      const { protocol, host, pathname, search, hash } = new URL(url);
      const scheme = protocol.replace(":", "");
      const intent = `intent://${host}${pathname}${search}${hash}#Intent;scheme=${scheme};package=com.android.chrome;end`;
      window.location.href = intent;
      return;
    } catch { }


    // 3) Last resort: แค่เปิดลิงก์เดิม เผื่อผู้ใช้เลือก "เปิดด้วยเบราว์เซอร์" เอง
    window.open(url, "_blank");
  };


  useEffect(() => {
    if (auto) openExternal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);


  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-700 sarabun-font">{message}</div>
      <button
        type="button"
        onClick={openExternal}
        className="w-full h-10 rounded-md border border-gray-300 hover:bg-gray-50 transition sarabun-font flex items-center justify-center gap-2"
      >
        {buttonText}
      </button>
      {/* เผื่ออยากแสดงคำอธิบายอื่น ๆ */}
      {children}
    </div>
  );
}