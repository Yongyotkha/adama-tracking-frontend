import React, { useMemo } from "react";
import { Image, message } from "antd";
import { CameraOutlined, DeleteOutlined } from "@ant-design/icons";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";

/**
 * AndroidInputCapture
 * - ใช้ input[type=file] accept="image/*" capture="environment"
 * - เหมาะกับ LIFF Android (LINE WebView) ที่ getUserMedia มีข้อจำกัด
 */
export default function AndroidInputCapture({
  label,
  required = false,
  value = [],
  onChange,
  maxCount = 10,
  renderTrigger,
  triggerLabel = "ถ่ายรูป/อัปโหลดรูป",
  triggerClassName = "w-full h-10 rounded-md border border-gray-300 hover:bg-gray-50 transition sarabun-font flex items-center justify-center gap-2",

  // อัปโหลด
  uploadOnCapture = true,
  uploadMode = "activity",
  uploadExtra,
  onUploadSuccess,
}) {
  const fileInputId = useMemo(() => `android-input-capture-${Math.random().toString(36).slice(2)}`, []);

  const handlePick = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // จำกัดจำนวนรวม
    const remain = Math.max(0, maxCount - value.length);
    const picked = files.slice(0, remain);

    // แสดงพรีวิวทันทีด้วย blob URL
    const previews = picked.map((file) => ({
      uid: `${Date.now()}_${Math.random()}`,
      name: file.name || `photo_${Date.now()}.jpg`,
      status: "uploading",
      url: URL.createObjectURL(file),
      originFileObj: file,
    }));

    const newList = [...value, ...previews];
    onChange?.(newList);

    if (uploadOnCapture) {
      // อัปโหลดทีละรูป (หรือจะปรับเป็น Promise.all ก็ได้)
      for (const p of previews) {
        try {
          const formData = new FormData();
          formData.append("file", p.originFileObj);
          formData.append("mode", uploadMode);
          if (uploadExtra && typeof uploadExtra === "object") {
            Object.entries(uploadExtra).forEach(([k, v]) => formData.append(k, String(v)));
          }
          const response = await useServiceAPI.post(paths.pathUpload, formData);
          const remoteUrl =
            response?.data?.url ||
            response?.data?.file_url ||
            response?.data?.path ||
            response?.url ||
            null;

          if (remoteUrl) {
            const replaced = (list) =>
              list.map((f) => (f.uid === p.uid ? { ...f, status: "done", url: remoteUrl } : f));
            onChange?.(replaced(newList));
          }
          onUploadSuccess?.(response);
        } catch (e) {
          console.error("Upload error:", e);
          message.error("อัปโหลดรูปไม่สำเร็จ");
          const replaced = (list) => list.map((f) => (f.uid === p.uid ? { ...f, status: "error" } : f));
          onChange?.(replaced(newList));
        }
      }
      message.success("อัปโหลดรูปสำเร็จ");
    }
    // เคลียร์ค่า input เพื่อให้เลือกไฟล์เดิมซ้ำได้
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
    if (typeof renderTrigger === "function") {
      return renderTrigger(() => document.getElementById(fileInputId)?.click());
    }
    return (
      <button
        type="button"
        onClick={() => document.getElementById(fileInputId)?.click()}
        className={triggerClassName}
      >
        <CameraOutlined />
        {triggerLabel}
      </button>
    );
  }, [renderTrigger, triggerClassName, triggerLabel, fileInputId]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm text-gray-700 sarabun-font mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {Trigger}

      <input
        id={fileInputId}
        type="file"
        accept="image/*"
        capture="environment"
        multiple={maxCount > 1}
        className="hidden"
        onChange={handlePick}
      />

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
