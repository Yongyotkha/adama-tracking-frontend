import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, Tooltip, message } from "antd";
import { CameraOutlined, DeleteOutlined } from "@ant-design/icons";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

/**
 * CameraButtonUploader
 *
 * A single button that:
 * 1) Uses LINE LIFF in-app browser's camera via a hidden <input type="file" capture>
 *    when LIFF is available.
 * 2) Falls back to the standard browser camera via `<input type="file" capture>` as well.
 * 3) Uploads immediately to `paths.pathUpload` with FormData (mode + extra fields)
 * 4) Shows a grid preview with remove capability
 *
 * NOTE:
 * - This approach is the most reliable for LINE in-app browser.
 * - If you need a full-screen live camera preview, keep using your CameraMobile component
 *   as another fallback branch.
 */

const fileToUploadItem = async (file) => {
  const url = URL.createObjectURL(file);
  return {
    uid: `${Date.now()}_${Math.random()}`,
    name: file.name || `camera_${Date.now()}.jpg`,
    status: "done",
    url,
    originFileObj: file,
  };
};

export default function CameraButtonUploader({
  label = "ถ่ายรูป/อัปโหลดรูป",
  required = false,
  value = [],
  onChange,
  maxCount = 20,
  capture = "environment", // "user" | "environment"
  accept = "image/*",
  uploadMode = "activity",
  uploadExtra, // Record<string, string | number | boolean>
  triggerClassName =
    "w-full h-10 rounded-md border border-gray-300 hover:bg-gray-50 transition sarabun-font flex items-center justify-center gap-2",
  triggerLabel = "เปิดกล้องถ่ายรูป",
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Detect LIFF presence (no need to call APIs to use camera input)
  const isLiffEnv = useMemo(
    () => typeof window !== "undefined" && !!window.liff,
    []
  );

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    // Only take up to remaining slots
    const remaining = Math.max(0, maxCount - (value?.length || 0));
    const take = Array.from(files).slice(0, remaining);

    // Add previews immediately
    const items = await Promise.all(take.map((f) => fileToUploadItem(f)));
    const newList = [...(value || []), ...items];
    onChange?.(newList);

    // Upload sequentially (simple + robust)
    for (const it of items) {
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", it.originFileObj);
        formData.append("mode", uploadMode);
        if (uploadExtra && typeof uploadExtra === "object") {
          Object.entries(uploadExtra).forEach(([k, v]) =>
            formData.append(k, String(v))
          );
        }
        const res = await useServiceAPI.post(paths.pathUpload, formData);
        const remoteUrl =
          res?.data?.url ||
          res?.data?.file_url ||
          res?.data?.path ||
          res?.url ||
          null;

        if (remoteUrl) {
          // replace the local blob URL with the server URL
          onChange?.((curr) =>
            (curr || []).map((f) =>
              f.uid === it.uid
                ? { ...f, url: remoteUrl, uploaded: true }
                : f
            )
          );
        }
      } catch (e) {
        console.error("Upload error:", e);
        message.error("อัปโหลดรูปไม่สำเร็จ");
      } finally {
        setUploading(false);
      }
    }

    message.success("อัปโหลดรูปสำเร็จ");
  };

  const onInputChange = async (e) => {
    const files = e.target.files;
    await handleFiles(files);
    // Reset the input so the same file can be selected again if needed
    e.target.value = "";
  };

  const removeItem = (uid) => {
    const target = value.find((f) => f.uid === uid);
    if (target?.url?.startsWith("blob:")) URL.revokeObjectURL(target.url);
    onChange?.(value.filter((f) => f.uid !== uid));
  };

  useEffect(() => {
    return () => {
      // Cleanup blob URLs
      (value || []).forEach((f) =>
        f?.url && f.url.startsWith("blob:") && URL.revokeObjectURL(f.url)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm text-gray-700 sarabun-font mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Hidden input works well in LINE in-app browser */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture={capture}
        multiple
        className="hidden"
        onChange={onInputChange}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={openPicker}
        className={triggerClassName}
      >
        <CameraOutlined />
        {triggerLabel}
        {isLiffEnv && (
          <span className="text-xs text-gray-500">(LINE)</span>
        )}
      </button>

      {/* Preview grid */}
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
              <Tooltip title="ลบรูป">
                <button
                  className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                  onClick={() => removeItem(file.uid)}
                  aria-label="ลบรูป"
                  type="button"
                >
                  <DeleteOutlined />
                </button>
              </Tooltip>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
