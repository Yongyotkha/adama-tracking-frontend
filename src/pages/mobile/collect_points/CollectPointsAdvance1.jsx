import React, { useEffect, useState, useContext, useRef } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { Input, DatePicker, message } from "antd";
import DynamicButton from "../../../components/button/DynamicButton";
import BackButton from "../../../components/mobile/button/BackButton";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import dayjs from "dayjs";

/** ---------- Utilities ---------- */
function useIsLine() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Line\/|LINE\//i.test(ua);
}
const dataUrlToFile = async (dataUrl, fileName = "photo.jpg") => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type || "image/jpeg" });
};

/** ---------- Reusable Camera Component ---------- */
function CameraCapture({
  label = "ถ่ายรูป",
  maxCount = 10,
  onChange,
  defaultFacing = "environment",
  allowTorch = true
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [items, setItems] = useState([]); // { previewUrl, source: 'stream'|'file', uploadedUrl? }
  const [error, setError] = useState("");
  const [useFallback, setUseFallback] = useState(false);
  const isLine = useIsLine();

  const emit = (next) => {
    setItems(next);
    onChange?.(next); // ให้ parent ได้ข้อมูลไปอัปโหลด/submit ต่อ
  };

  const openCamera = async () => {
    setError("");
    const constraints = {
      video: {
        facingMode: { ideal: defaultFacing }, // "environment" | "user"
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      console.log("getUserMedia error:", e);
      setUseFallback(true);
      setError(
        (e && e.name) === "NotAllowedError"
          ? "ผู้ใช้ไม่อนุญาต/เบราว์เซอร์บล็อกสิทธิ์กล้อง"
          : "เปิดกล้องสดไม่ได้ สลับเป็นโหมดอัปโหลด/ถ่ายด้วยแอปกล้อง"
      );
    }
  };

  const stopCamera = () => {
    setUseFallback(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    const next = [
      ...items,
      { previewUrl: dataUrl, source: "stream", uploadedUrl: null }
    ].slice(0, maxCount);
    emit(next);
  };

  const onFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const mapped = files.map((f) => ({
      previewUrl: URL.createObjectURL(f),
      source: "file",
      file: f,
      uploadedUrl: null
    }));
    const next = [...items, ...mapped].slice(0, maxCount);
    emit(next);
  };

  const removeAt = (idx) => {
    const next = items.filter((_, i) => i !== idx);
    emit(next);
  };

  useEffect(() => () => stopCamera(), []); // cleanup on unmount

  return (
    <div className="mt-3">
      <label className="block text-sm text-gray-700 sarabun-font mb-1">
        {label} <span className="text-red-500">*</span>
      </label>

      {/* Controls */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={openCamera}
          className="px-3 py-2 rounded bg-black text-white"
        >
          เปิดกล้อง (rear)
        </button>
        <button
          type="button"
          onClick={stopCamera}
          className="px-3 py-2 rounded bg-gray-200"
        >
          ปิดกล้อง
        </button>
        {!useFallback && (
          <button
            type="button"
            onClick={takePhoto}
            className="px-3 py-2 rounded bg-blue-600 text-white"
          >
            ถ่ายภาพ
          </button>
        )}
      </div>

      {/* Live video (when available) */}
      {!useFallback && (
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            width: "100%",
            maxWidth: 480,
            background: "#000",
            borderRadius: 8
          }}
        />
      )}

      {/* Fallback input capture (best for iOS LINE) */}
      {useFallback && (
        <div className="space-y-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <input
            type="file"
            accept="image/*"
            capture={defaultFacing === "environment" ? "environment" : "user"}
            multiple
            onChange={onFileChange}
          />
          <p className="text-xs text-gray-600">
            โหมดนี้จะเปิดแอปกล้องระบบ ถ่ายแล้วอัปโหลดกลับมา
          </p>
        </div>
      )}

      {/* Preview grid */}
      {items?.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {items.map((it, idx) => (
            <div key={idx} className="relative">
              <img
                src={it.previewUrl || it.uploadedUrl}
                alt={`preview-${idx}`}
                className="w-full h-24 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded"
                aria-label="remove"
              >
                ลบ
              </button>
              {it.uploadedUrl && (
                <span className="absolute bottom-1 left-1 bg-green-600/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                  อัปโหลดแล้ว
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Debug */}
      <div className="text-[11px] text-gray-500 mt-2">
        LINE Browser: {isLine ? "Yes" : "No"}
      </div>
    </div>
  );
}

/** ---------- Page ---------- */
export default function CollectPointsAdvance1() {
  const [loading, setLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  const documentNumber = typeof location !== "undefined" ? location.state?.document_number : null;

  const [historydetail, setHistorydetail] = useState(null);
  const [productBills, setProductBills] = useState([]);  // [{ previewUrl, uploadedUrl?, source, file? }]
  const [productPhotos, setProductPhotos] = useState([]);// same shape
  const [user, setUser] = useState(null);
  const [receiveShop, setReceiveShop] = useState("");
  const [isPointModalVisible, setIsPointModalVisible] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [receiveDate, setReceiveDate] = useState(dayjs().format("YYYY-MM-DD"));

  // ---- ปรับชื่อ endpoint อัปโหลดที่นี่ ----
  const UPLOAD_ENDPOINT =
    paths?.pathUploadActivity ?? paths?.pathUploadFile ?? paths?.pathUpload;

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathProfileDetail, { id: userInfo.id });
        if (response.status === 200 && response.result) {
          setUser(response.data);
          if (response?.data?.dealer?.dealer_name_th) {
            setReceiveShop(response.data.dealer.dealer_name_th);
          }
        } else {
          console.error("Failed to fetch user profile:", response);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      productBills.forEach((f) => f.previewUrl && f.previewUrl.startsWith("blob:") && URL.revokeObjectURL(f.previewUrl));
      productPhotos.forEach((f) => f.previewUrl && f.previewUrl.startsWith("blob:") && URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** อัปโหลดรายการรูปให้กลายเป็น URL จริง (http/https) */
  const ensureUploadedUrls = async (items = [], extra = {}) => {
    const uploadedUrls = [];

    for (const it of items) {
      // ถ้ามี URL จริงอยู่แล้วก็ข้าม
      if (typeof it.uploadedUrl === "string" && /^https?:\/\//i.test(it.uploadedUrl)) {
        uploadedUrls.push(it.uploadedUrl);
        continue;
      }
      // ถ้า preview เป็น http จริง (เช่น อัปโหลดไปแล้ว) ก็ใช้ได้
      if (typeof it.previewUrl === "string" && /^https?:\/\//i.test(it.previewUrl)) {
        uploadedUrls.push(it.previewUrl);
        continue;
      }

      // เตรียมไฟล์
      let fileObj = it.file;
      if (!fileObj && typeof it.previewUrl === "string" && it.previewUrl.startsWith("data:")) {
        fileObj = await dataUrlToFile(it.previewUrl, "photo.jpg");
      } else if (!fileObj && typeof it.previewUrl === "string" && it.previewUrl.startsWith("blob:")) {
        // blob URL → fetch แล้วแปลงเป็น File
        const resp = await fetch(it.previewUrl);
        const blob = await resp.blob();
        fileObj = new File([blob], "photo.jpg", { type: blob.type || "image/jpeg" });
      }

      if (!fileObj) continue;

      // อัปโหลด multipart/form-data
      const form = new FormData();
      form.append("file", fileObj);
      // แนบค่าเพิ่มเติม เช่น document_number
      Object.entries(extra || {}).forEach(([k, v]) => form.append(k, v));

      try {
        const res = await useServiceAPI.post(UPLOAD_ENDPOINT, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // รองรับได้หลายรูปแบบ response
        const url =
          res?.data?.url ||
          res?.url ||
          res?.data?.data?.url ||
          res?.data?.result?.url;
        if (url && /^https?:\/\//i.test(url)) {
          uploadedUrls.push(url);
        } else {
          console.warn("Upload success but URL not found shape:", res);
        }
      } catch (e) {
        console.error("Upload failed:", e);
        message.error("อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่");
        throw e;
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    try {
      if (productBills.length === 0 || productPhotos.length === 0) {
        message.error("กรุณากรอกข้อมูลให้ครบในช่องที่มีเครื่องหมาย *");
        return;
      }

      setLoading(true);

      // 1) อัปโหลดรูปทั้งหมดให้เป็น URL จริงก่อน
      const extra = { document_number: historydetail?.document_number ?? documentNumber };
      const billUrls = await ensureUploadedUrls(productBills, extra);
      const productUrls = await ensureUploadedUrls(productPhotos, extra);

      if (!billUrls.length) {
        message.error("กรุณาถ่ายและอัปโหลดรูปบิลอย่างน้อย 1 รูป");
        setLoading(false);
        return;
      }
      if (!productUrls.length) {
        message.error("กรุณาถ่ายและอัปโหลดรูปสินค้าที่ได้รับอย่างน้อย 1 รูป");
        setLoading(false);
        return;
      }

      // 2) ส่ง payload ให้ backend
      const payload = {
        product: productUrls,
        bill: billUrls,
        receive_date: receiveDate,
        receive_shop: receiveShop
      };

      const res = await useServiceAPI.post(paths.pathSalePointReceive, payload);
      if (res?.status === 200) {
        const pts = Number(res?.data?.point ?? 0);
        setEarnedPoints(pts);
        setIsPointModalVisible(true);
        setIsSuccessModalVisible(true);
      } else {
        message.error(res?.data?.message || "บันทึกไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Submit error:", err);
      message.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout loading={loading}>
      <div className="w-full max-w-md mx-auto px-4 pb-8">
        <h2 className="text-green-700 text-lg font-bold mt-4 sarabun-font">
          แจ้งรับสินค้าล่วงหน้า
        </h2>

        {/* Form */}
        <div className="mt-4 space-y-4 sarabun-font">
          <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">
              วันที่แจ้งรับสินค้าล่วงหน้า<span className="text-red-500">*</span>
            </label>
            <DatePicker
              required
              format="YYYY-MM-DD"
              className="w-full h-10 rounded-md text-gray-700 sarabun-font"
              placeholder="เลือกวันที่"
              value={dayjs(receiveDate)}
              defaultValue={dayjs()}
              onChange={(_, dateString) => setReceiveDate(dateString)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">
              ชื่อร้านยี่ปั๊ว<span className="text-red-500">*</span>
            </label>
            <Input
              value={user?.dealer?.dealer_name_en ?? ""}
              disabled
              className="h-10 rounded-md sarabun-font bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">
              ชื่อร้านค้า
            </label>
            <Input
              value={user?.shop_name ?? ""}
              disabled
              className="h-10 rounded-md sarabun-font bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">
              เบอร์โทรศัพท์มือถือ
            </label>
            <Input
              value={user?.phone_number ?? ""}
              disabled
              className="h-10 rounded-md sarabun-font bg-gray-100"
            />
          </div>

          {/* กล้อง/อัปโหลดรูปบิล */}
          <CameraCapture
            label="ถ่ายรูปบิลเงินสดหรือใบสั่งสินค้า"
            maxCount={20}
            defaultFacing="environment"
            allowTorch
            onChange={setProductBills}
          />

          {/* กล้อง/อัปโหลดรูปสินค้า */}
          <CameraCapture
            label="ถ่ายรูปสินค้าที่ได้รับ"
            maxCount={20}
            defaultFacing="environment"
            allowTorch
            onChange={setProductPhotos}
          />

          {/* ปุ่มบันทึก */}
          <DynamicButton
            text="บันทึก"
            className="w-full bg-green-700 text-white py-3 rounded-md mt-6 sarabun-font"
            onClick={handleSubmit}
          />
        </div>

        <BackButton url="/mobile/main" />

        {/* Success Modal */}
        <DynamicPopUp
          visible={isSuccessModalVisible}
          onConfirm={() => {
            setIsSuccessModalVisible(false);
            navigate(-1);
          }}
          src="/img/icons/check-circle.png"
          text={`<div class='text-center'>
              <p class='text-[#4A4A4A] text-[18px] mt-1 sarabun-font'>ส่งข้อมูลสำเร็จ</p>
              <p class='text-[#A1A1A1] text-[14px] mt-1 sarabun-font'>รอดำเนินการจากทางเจ้าหน้าที่</p>
            </div>`}
          cancelText="ยกเลิก"
          confirmText="ยืนยัน"
        />
      </div>
    </MobileLayout>
  );
}
