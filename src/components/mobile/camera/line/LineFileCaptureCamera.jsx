// src/components/mobile/camera/line/LineFileCaptureCamera.jsx
import React, { useMemo } from "react";
import { Image, message } from "antd";
import { CameraOutlined, DeleteOutlined } from "@ant-design/icons";
import { paths } from "../../../../services/CorsPath";
import useServiceAPI from "../../../../services/CorsService";

/**
 * LINE LIFF (Android) fallback camera using <input type="file" capture>
 * - Works in in-app browsers that block getUserMedia permission prompts.
 * - Uses native camera/file picker without showing the browser permission modal.
 *
 * Props: same surface as other camera components
 */
export default function LineFileCaptureCamera({
  label,
  required = false,
  value = [],
  onChange,
  maxCount = 10,
  renderTrigger,
  triggerLabel = "เปิดกล้องถ่ายรูป",
  triggerClassName =
    "w-full h-10 rounded-md border border-gray-300 hover:bg-gray-50 transition sarabun-font flex items-center justify-center gap-2",

  // upload
  uploadOnCapture = true,
  uploadMode = "activity",
  uploadExtra,
  onUploadSuccess,
}) {
  const onPick = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const mapped = files.slice(0, Math.max(0, maxCount - value.length)).map((file) => ({
      uid: `${Date.now()}_${Math.random()}`,
      name: file.name || `camera_${Date.now()}.jpg`,
      status: "done",
      url: URL.createObjectURL(file),
      originFileObj: file,
    }));

    const next = [...value, ...mapped].slice(0, maxCount);
    onChange?.(next);

    if (uploadOnCapture) {
      for (const uf of mapped) {
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
            const replaced = (curr) =>
              curr.map((f) => (f.uid === uf.uid ? { ...f, url: remoteUrl } : f));
            onChange?.(replaced(next));
          }

          onUploadSuccess?.(response);
        } catch (err) {
          console.error("Upload error:", err);
          message.error("อัปโหลดรูปไม่สำเร็จ");
        }
      }
      message.success("อัปโหลดรูปสำเร็จ");
    }

    // reset input so the same file can be selected again if needed
    e.target.value = "";
  };

  const removeItem = (uid) => {
    const target = value.find((f) => f.uid === uid);
    if (target?.url && target.url.startsWith("blob:")) {
      URL.revokeObjectURL(target.url);
    }
    onChange?.(value.filter((f) => f.uid !== uid));
  };

  const Trigger = useMemo(() => {
    if (typeof renderTrigger === "function") return renderTrigger(() => inputRef.current?.click());
    return (
      <button type="button" onClick={() => inputRef.current?.click()} className={triggerClassName}>
        <CameraOutlined />
        {triggerLabel}
      </button>
    );
  }, [renderTrigger, triggerClassName, triggerLabel]);

  const inputRef = React.useRef(null);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm text-gray-700 sarabun-font mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Hidden file input that invokes native camera in LIFF */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment" // hint to open the back camera
        multiple
        className="hidden"
        onChange={onPick}
      />

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
    </div>
  );
}


