import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Image, Tooltip, message } from "antd";
import {
  CameraOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CloseOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

/**
 * CameraMobile: กล้องเต็มหน้า + ถ่ายหลายรูป + พรีวิว + ลบรูป + flash + อัปโหลดหลังถ่าย
 *
 * Props เพิ่มสำหรับอัปโหลด:
 * - uploadOnCapture?: boolean   // ถ่ายแล้วอัปโหลดเลย (default: true)
 * - uploadMode?: string        // ค่าที่ส่งไปเป็น formData.append('mode', uploadMode) (default: "activity")
 * - uploadExtra?: Record<string,string|number|boolean> // field เสริมใน FormData (optional)
 * - onUploadSuccess?: (response) => void // callback หลังอัปโหลดสำเร็จ (optional)
 *
 * อื่น ๆ เหมือนเดิม
 */

const blobToUploadFile = async (blob, filename) => {
  const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
  return {
    uid: `${Date.now()}_${Math.random()}`,
    name: filename,
    status: "done",
    url: URL.createObjectURL(file),
    originFileObj: file,
  };
};

export default function CameraMobile({
  label,
  required = false,
  value = [],
  onChange,
  maxCount = 10,
  defaultFacing = "environment",
  allowTorch = true,
  renderTrigger,
  triggerLabel = "เปิดกล้องถ่ายรูป",
  triggerClassName = "w-full h-10 rounded-md border border-gray-300 hover:bg-gray-50 transition sarabun-font flex items-center justify-center gap-2",
  quality = 0.9,
  imageType = "image/jpeg",

  // อัปโหลด
  uploadOnCapture = true,
  uploadMode = "activity",
  uploadExtra,
  onUploadSuccess,
}) {
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [facing, setFacing] = useState(defaultFacing);
  const [torchOn, setTorchOn] = useState(false);

  // flash effect
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashOpacity, setFlashOpacity] = useState(0);

  const videoRef = useRef(null);
  const trackRef = useRef(null);

  const startCamera = async (mode = facing) => {
    try {
      stopCamera();
      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      const track = s.getVideoTracks()[0];
      trackRef.current = track;

      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }

      if (allowTorch && torchOn) {
        try {
          await track.applyConstraints({ advanced: [{ torch: true }] });
        } catch { /* ไม่รองรับไฟฉายก็ข้าม */ }
      }
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง");
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch {}
    }
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    trackRef.current = null;
  };

  const openCamera = async () => {
    setOpen(true);
    await startCamera();
  };

  const closeCamera = () => {
    stopCamera();
    setOpen(false);
  };

  const toggleFacing = async () => {
    const next = facing === "environment" ? "user" : "environment";
    setFacing(next);
    await startCamera(next);
  };

  const toggleTorch = async () => {
    if (!allowTorch) return;
    const track = trackRef.current;
    if (!track) {
      setTorchOn((v) => !v);
      return;
    }
    try {
      const next = !torchOn;
      await track.applyConstraints({ advanced: [{ torch: next }] });
      setTorchOn(next);
    } catch {
      message.warning("อุปกรณ์นี้ไม่รองรับไฟฉายจากเบราว์เซอร์");
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;

    // flash
    setIsFlashing(true);
    setFlashOpacity(1);

    // capture
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((res) => canvas.toBlob(res, imageType, quality));
    const uf = await blobToUploadFile(
      blob,
      `camera_${Date.now()}.${imageType === "image/png" ? "png" : "jpg"}`
    );

    // เพิ่มเข้า list เพื่อให้เห็นพรีวิวทันที
    const newList = [...value, uf].slice(0, maxCount);
    onChange?.(newList);

    // อัปโหลดไป API ทันที
    if (uploadOnCapture) {
      try {
        const formData = new FormData();
        formData.append("file", uf.originFileObj);
        formData.append("mode", uploadMode);
        if (uploadExtra && typeof uploadExtra === "object") {
          Object.entries(uploadExtra).forEach(([k, v]) =>
            formData.append(k, String(v))
          );
        }

        const response = await useServiceAPI.post(paths.pathUpload, formData);
        // พยายามอ่าน url ที่ตอบกลับ (เผื่อ backend ตั้งชื่อ field ต่างกัน)
        const remoteUrl =
          response?.data?.url ||
          response?.data?.file_url ||
          response?.data?.path ||
          response?.url ||
          null;

        if (remoteUrl) {
          // แทนที่รายการที่เพิ่งถ่ายให้ใช้ URL จริงจากเซิร์ฟเวอร์
          const replaced = newList.map((f) =>
            f.uid === uf.uid ? { ...f, url: remoteUrl } : f
          );
          onChange?.(replaced);
        }

        onUploadSuccess?.(response);
        message.success("อัปโหลดรูปสำเร็จ");
      } catch (e) {
        console.error("Upload error:", e);
        message.error("อัปโหลดรูปไม่สำเร็จ");
      }
    }

    // fade out flash แล้วปิดกล้อง
    setTimeout(() => setFlashOpacity(0), 10);
    setTimeout(() => {
      setIsFlashing(false);
      closeCamera();
    }, 160);
  };

  const removeItem = (uid) => {
    const target = value.find((f) => f.uid === uid);
    if (target?.url && target.url.startsWith("blob:")) {
      URL.revokeObjectURL(target.url);
    }
    onChange?.(value.filter((f) => f.uid !== uid));
  };

  useEffect(() => {
    return () => {
      value.forEach((f) => f?.url && f.url.startsWith("blob:") && URL.revokeObjectURL(f.url));
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Trigger = useMemo(() => {
    if (typeof renderTrigger === "function") return renderTrigger(openCamera);
    return (
      <button type="button" onClick={openCamera} className={triggerClassName}>
        <CameraOutlined />
        {triggerLabel}
      </button>
    );
  }, [renderTrigger, triggerClassName, triggerLabel]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm text-gray-700 sarabun-font mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* ปุ่ม Trigger เปิดกล้อง */}
      {Trigger}

      {/* พรีวิวรูปแบบกริด */}
      {value?.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
          {value.map((file) => (
            <div key={file.uid} className="relative group">
              <Image
                src={file.url}
                alt={file.name}
                className="rounded-md object-cover"
                width="100%"
                height={100}
                style={{ objectFit: "cover" }}
                preview={{ mask: "คลิกเพื่อขยาย" }}
              />
              <button
                className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                onClick={() => removeItem(file.uid)}
                aria-label="ลบรูป"
                type="button"
              >
                <DeleteOutlined />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal กล้องเต็มหน้า */}
      <Modal
        open={open}
        footer={null}
        closable={false}
        onCancel={closeCamera}
        width="100vw"
        style={{ top: 0, padding: 0, marginTop: 0 , marginBottom: 0}}
        zIndex={5000}
        rootClassName="camera-fullscreen-modal"
        styles={{
          body: { padding: 0 },
          content: { padding: 0, height: "100vh", maxHeight: "100vh" },
        }}
      >
        <div className="w-full h-screen bg-black rounded-b-lg relative" style={{ height: "calc(100vh - 10px)" }}>
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-contain"
          />

          {/* Flash overlay */}
          {isFlashing && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "white",
                opacity: flashOpacity,
                transition: "opacity 150ms ease-out",
              }}
            />
          )}

          {/* แถบปุ่มด้านบน */}
          <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between">
            <Tooltip title="ปิด">
              <button
                onClick={closeCamera}
                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center"
              >
                <CloseOutlined />
              </button>
            </Tooltip>

            <div className="flex gap-2">
              <Tooltip title="สลับกล้อง หน้า/หลัง">
                <button
                  onClick={toggleFacing}
                  className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center"
                >
                  <ReloadOutlined />
                </button>
              </Tooltip>

              {allowTorch && (
                <Tooltip title="ไฟฉาย (ถ้ารองรับ)">
                  <button
                    onClick={toggleTorch}
                    className={`w-10 h-10 rounded-full ${
                      torchOn ? "bg-yellow-300" : "bg-white/80"
                    } backdrop-blur flex items-center justify-center`}
                  >
                    <ThunderboltOutlined />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>

          {/* ปุ่มชัตเตอร์ล่าง */}
          <div className="absolute bottom-0 left-0 right-0 pb-8 pt-4 flex items-center justify-center">
            <button
              onClick={handleCapture}
              className="w-20 h-20 rounded-full bg-white border-8 border-white/30 shadow-xl active:scale-95"
              aria-label="ถ่ายภาพ"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
