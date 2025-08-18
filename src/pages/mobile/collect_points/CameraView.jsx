import React, { useRef, useState } from "react";

function CameraView() {
  const videoRef = useRef(null);
  const [err, setErr] = useState("");

  const isLine = /Line/i.test(navigator.userAgent);
  const isiOS = /iP(hone|od|ad)/i.test(navigator.userAgent);

  const startCamera = async () => {
    setErr("");

    // 1) ต้องเป็น HTTPS
    if (location.protocol !== "https:") {
      setErr("ต้องใช้งานผ่าน HTTPS เท่านั้น");
      return;
    }

    // 2) LINE + iOS: แนะนำเปิดภายนอกหรือใช้ LIFF QR แทน
    if (isLine && isiOS) {
      if (window.liff && window.liff.isInClient()) {
        // เปิดหน้าเดิมในเบราว์เซอร์ภายนอก
        window.liff.openWindow({ url: window.location.href, external: true });
      } else {
        setErr("LINE บน iOS มักไม่อนุญาตกล้องใน in-app browser — โปรดเปิดด้วย Safari/Chrome");
      }
      return;
    }

    // 3) ทดสอบว่าระบบรองรับไหม
    if (!navigator.mediaDevices?.getUserMedia) {
      setErr("อุปกรณ์/เบราว์เซอร์ไม่รองรับกล้อง");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      // fallback: input file
      setErr("เปิดกล้องไม่สำเร็จ ลองอัปโหลดรูปแทนด้านล่าง");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div>
      <button onClick={startCamera}>เปิดกล้อง</button>
      <button onClick={stopCamera} style={{ marginLeft: 8 }}>ปิดกล้อง</button>

      <div style={{ marginTop: 12 }}>
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{ width: "100%", background: "#000" }}
        />
      </div>

      {err && (
        <div style={{ color: "crimson", marginTop: 12 }}>{err}</div>
      )}

      {/* Fallback: ใช้ไฟล์จากกล้อง */}
      <div style={{ marginTop: 12 }}>
        <input type="file" accept="image/*" capture="environment" />
      </div>
    </div>
  );
}

export default CameraView;
