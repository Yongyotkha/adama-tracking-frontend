// src/pages/mobile/TakePhoto.jsx
import React, { useEffect, useRef, useState } from "react";
import { Image, message } from "antd";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/CorsService";

export default function TakePhoto() {
  const params = new URLSearchParams(window.location.search);
  const liffId = params.get("liffId");                         // เช่น 2007785075-3Yjw7OdO
  const returnPath = params.get("returnPath") || "/";
  const returnUrlParam = params.get("returnUrl");              // ✅ absolute URL ที่อยากกลับไป
  const liffReferrer = params.get("liff.referrer");
  const uploadMode = params.get("mode") || "activity";
  const kind = params.get("kind") || "generic";
  const documentNumber = params.get("document_number") || "";

  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const [files, setFiles] = useState([]); // เก็บรูปที่อัปโหลดแล้ว (สำหรับพรีวิว)
  const [uploadedUrls, setUploadedUrls] = useState([]);

  useEffect(() => {
    const start = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
        }
      } catch (e) {
        console.error(e);
        message.error("ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง");
      }
    };
    start();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capture = async () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg", 0.9));
    const file = new File([blob], `camera_${Date.now()}.jpg`, { type: "image/jpeg" });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", uploadMode);
      formData.append("kind", kind);
      if (documentNumber) formData.append("document_number", documentNumber);

      const resp = await useServiceAPI.post(paths.pathUpload, formData);
      const remoteUrl =
        resp?.data?.url || resp?.data?.file_url || resp?.data?.path || resp?.url || null;

      if (remoteUrl) {
        setFiles(prev => [...prev, { url: remoteUrl, name: file.name }]);
        setUploadedUrls(prev => [...prev, remoteUrl]);
        message.success("อัปโหลดรูปสำเร็จ");
      } else {
        message.warning("อัปโหลดสำเร็จ แต่ไม่ได้รับ URL");
      }
    } catch (e) {
      console.error("upload error", e);
      message.error("อัปโหลดรูปไม่สำเร็จ");
    }
  };

  // const goBackToLIFF = () => {
  //   // กลับเข้า LIFF พร้อม path เดิม
  //   const liffUrl = `https://liff.line.me/${encodeURIComponent(liffId)}${returnPath.startsWith("/") ? returnPath : `/${returnPath}`}`;
  //   window.location.replace(liffUrl);
  // };

  const goBackToLIFF = () => {
    const payload = {
      photos: uploadedUrls,
      kind,
      document_number: documentNumber,
      returnPath
    };

    // 1) ถ้ามี absolute returnUrl → กลับไป URL นั้น
    if (returnUrlParam && /^https?:\/\//i.test(returnUrlParam)) {
      try {
        // ถ้าเปิดมาจาก window.open (ไม่มี noopener) → ส่ง data ให้ opener แล้วปิดหน้าต่าง
        if (window.opener) {
          try { window.opener.postMessage({ __from_external: true, data: payload }, new URL(returnUrlParam).origin); } catch { }
          window.close();
          return;
        }
      } catch { }
      // ถ้าไม่มี opener → แนบ data ผ่าน query แล้ว redirect
      const u = new URL(returnUrlParam);
      u.searchParams.set("__from_external", "1");
      u.searchParams.set("data", JSON.stringify(payload));  // URLSearchParams จะ encode ให้เอง
      window.location.replace(u.toString());
      return;
    }

    // 2) ถ้ามี liff.referrer → กลับไปที่ referrer + returnPath (เช่น http://localhost:5173/... ใน dev)
    if (liffReferrer) {
      const origin = decodeURIComponent(liffReferrer).replace(/\/+$/, ""); // ตัดท้าย /
      const u = new URL(returnPath.startsWith("/") ? returnPath : `/${returnPath}`, origin);
      // ส่ง data กลับเหมือนข้อ 1
      if (window.opener) {
        try { window.opener.postMessage({ __from_external: true, data: payload }, new URL(origin).origin); } catch { }
        window.close();
        return;
      }
      u.searchParams.set("__from_external", "1");
      u.searchParams.set("data", JSON.stringify(payload));
      window.location.replace(u.toString());
      return;
    }

    // 3) fallback: กลับเข้า LIFF ด้วย deep link
    if (liffId) {
      const query = new URLSearchParams({
        __from_external: "1",
        data: JSON.stringify(payload),
      }).toString();
      const deepLink = `line://app/${liffId}?${query}`;
      window.location.href = deepLink;
      setTimeout(() => window.close(), 400);
      return;
    }
    // ถ้าไม่มีอะไรเลย ก็กลับ root
    window.location.replace(returnPath || "/");
  };

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col">
      <div className="p-4 text-center font-semibold">ถ่ายรูป (โหมดเบราว์เซอร์ภายนอก)</div>

      <div className="relative flex-1">
        <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-contain" />
      </div>

      <div className="p-4 grid grid-cols-2 gap-3">
        <button
          onClick={capture}
          className="h-12 rounded-md bg-white text-black font-semibold active:scale-95"
        >
          ถ่ายแล้วอัปโหลด
        </button>
        <button
          onClick={goBackToLIFF}
          className="h-12 rounded-md bg-emerald-500 text-white font-semibold active:scale-95"
        >
          เสร็จแล้ว กลับหน้าเดิม
        </button>
      </div>

      {files.length > 0 && (
        <div className="p-4">
          <div className="text-sm text-gray-300 mb-2">อัปโหลดแล้ว</div>
          <div className="grid grid-cols-3 gap-2">
            {files.map((f, i) => (
              <Image key={i} src={f.url} alt={f.name} width="100%" height={100} style={{ objectFit: "cover" }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
