// src/components/mobile/camera/MobileCameraAuto.jsx
import React, { useMemo } from "react";
import CameraMobile from "./CameraMobile";
import AndroidWebcamCamera from "./android/AndroidWebcamCamera";

function detectPlatform() {
  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  // iOS: iPhone/iPad/iPod หรือ iPadOS ที่รายงานเป็น Mac แต่มี touch
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return { isAndroid, isIOS };
}

/**
 * ใช้เหมือน CameraMobile เลย:
 * - label, required, value, onChange, maxCount, defaultFacing, allowTorch, ...
 * - uploadOnCapture, uploadMode, uploadExtra, onUploadSuccess
 */
export default function MobileCameraAuto(props) {
  const { isAndroid, isIOS } = useMemo(detectPlatform, []);

  if (isIOS) {
    // iOS ทำงานดีอยู่แล้ว
    return <CameraMobile {...props} />;
  }

  if (isAndroid) {
    // Android ใช้ react-webcam เพื่อเสถียรภาพ
    return <AndroidWebcamCamera {...props} />;
  }

  // Desktop หรือไม่รู้แพลตฟอร์ม => ให้ใช้ CameraMobile เป็นดีฟอลต์
  return <CameraMobile {...props} />;
}
