// src/components/mobile/camera/android/AndroidWebcamCamera.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Image, Tooltip, message } from "antd";
import {
  CameraOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import Webcam from "react-webcam";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";

const dataURLtoBlob = (dataurl) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
};

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

export default function AndroidWebcamCamera({
  label,
  required = false,
  value = [],
  onChange,
  maxCount = 10,
  defaultFacing = "environment",
  allowTorch = true, // react-webcam ไม่มี torch API ที่มาตรฐานบน Android Chrome ขอละไว้ก่อน
  renderTrigger,
  triggerLabel = "เปิดกล้องถ่ายรูป",
  triggerClassName = "w-full h-10 rounded-md border border-gray-300 hover:bg-gray-50 transition sarabun-font flex items-center justify-center gap-2",
  quality = 0.9, // ไม่ได้ใช้กับ react-webcam โดยตรง แต่ใช้ตอนแปลง dataURL เป็น jpeg
  imageType = "image/jpeg",

  uploadOnCapture = true,
  uploadMode = "activity",
  uploadExtra,
  onUploadSuccess,
}) {
  const [open, setOpen] = useState(false);
  const [facing, setFacing] = useState(defaultFacing); // "environment" | "user"
  const webcamRef = useRef(null);

  const videoConstraints = useMemo(
    () => ({
      facingMode: facing, // Android Chrome รองรับ "user" / "environment"
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    }),
    [facing]
  );

  const openCamera = async () => {
    setOpen(true);
  };

  const closeCamera = () => {
    setOpen(false);
  };

  const toggleFacing = async () => {
    setFacing((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleCapture = async () => {
    if (!webcamRef.current) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) {
      message.error("ถ่ายรูปไม่สำเร็จ");
      return;
    }
    const blob = dataURLtoBlob(screenshot);
    const uf = await blobToUploadFile(
      blob,
      `camera_${Date.now()}.${imageType === "image/png" ? "png" : "jpg"}`
    );

    const newList = [...value, uf].slice(0, maxCount);
    onChange?.(newList);

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
        const remoteUrl =
          response?.data?.url ||
          response?.data?.file_url ||
          response?.data?.path ||
          response?.url ||
          null;

        if (remoteUrl) {
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

    // ปิด modal หลังถ่ายเสร็จ (เหมือน iOS)
    setTimeout(() => {
      closeCamera();
    }, 120);
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
      value.forEach(
        (f) => f?.url && f.url.startsWith("blob:") && URL.revokeObjectURL(f.url)
      );
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

      {Trigger}

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

      <Modal
        open={open}
        footer={null}
        closable={false}
        onCancel={closeCamera}
        width="100vw"
        style={{ top: 0, padding: 0, marginTop: 0, marginBottom: 0 }}
        zIndex={5000}
        rootClassName="camera-fullscreen-modal"
        styles={{
          body: { padding: 0 },
          content: { padding: 0, height: "100vh", maxHeight: "100vh" },
        }}
      >
        <div
          className="w-full h-screen bg-black rounded-b-lg relative"
          style={{ height: "calc(100vh - 10px)" }}
        >
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg" // ส่งออกเป็น JPEG
            videoConstraints={videoConstraints}
            mirrored={facing === "user"} // กล้องหน้าให้ส่องกระจก
            className="absolute inset-0 w-full h-full object-contain"
          />

          {/* แถบบน */}
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
              {/* หมายเหตุ: react-webcam ไม่รองรับ torch มาตรฐานบน Android Chrome */}
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
