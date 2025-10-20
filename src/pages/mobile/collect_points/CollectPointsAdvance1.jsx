import React, { useEffect, useState, useContext, useRef } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { Input, DatePicker, message } from "antd";
import DynamicButton from "../../../components/button/DynamicButton";
import BackButton from "../../../components/mobile/button/BackButton";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";

// ❗ ใช้ service แบบอ็อบเจ็กต์ (ไม่เรียกเป็นฟังก์ชัน)
import api from "../../../services/corsService"; // ปรับ path/casing ให้ตรงไฟล์จริงของคุณ

import { paths } from "../../../services/CorsPath";
import dayjs from "dayjs";

/* ===================== Utilities ===================== */
const dataUrlToFile = async (dataUrl, fileName = "photo.jpg") => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type || "image/jpeg" });
};

async function compressDataUrl(
  dataUrl,
  { maxWidth = 1280, maxHeight = 1280, quality = 0.8 } = {}
) {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();

  let { width, height } = img;
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  const outW = Math.round(width * scale);
  const outH = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, outW, outH);

  return canvas.toDataURL("image/jpeg", quality);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressFile(
  file,
  opts = { maxWidth: 1280, maxHeight: 1280, quality: 0.8 }
) {
  const dataUrl = await fileToDataUrl(file);
  const compressedDataUrl = await compressDataUrl(dataUrl, opts);
  const res = await fetch(compressedDataUrl);
  const blob = await res.blob();
  const name =
    (file.name?.replace(/\.(jpg|jpeg|png)$/i, "") || "photo") + "_min.jpg";
  return new File([blob], name, { type: "image/jpeg" });
}

/** อัปโหลดรายการรูปให้เป็น URL/ID จริง */
async function ensureUploadedUrls(
  apiObj,
  uploadEndpoint,
  items = [],
  extra = {},
  modeUpload = "activity"
) {
  const uploadedResults = [];

  for (const it of items) {
    // URL จริงอยู่แล้ว
    if (typeof it.uploadedUrl === "string" && /^https?:\/\//i.test(it.uploadedUrl)) {
      uploadedResults.push(it.uploadedUrl);
      continue;
    }
    if (typeof it.previewUrl === "string" && /^https?:\/\//i.test(it.previewUrl)) {
      uploadedResults.push(it.previewUrl);
      continue;
    }

    // เตรียมไฟล์จาก stream/file/blob/dataURL
    let fileObj = it.file;
    if (!fileObj && typeof it.previewUrl === "string" && it.previewUrl.startsWith("data:")) {
      fileObj = await dataUrlToFile(it.previewUrl, "photo.jpg");
    } else if (!fileObj && typeof it.previewUrl === "string" && it.previewUrl.startsWith("blob:")) {
      const resp = await fetch(it.previewUrl);
      const blob = await resp.blob();
      fileObj = new File([blob], "photo.jpg", { type: blob.type || "image/jpeg" });
    }
    if (!fileObj) continue;

    // บีบอัดซ้ำก่อนอัปโหลด ถ้ายังใหญ่
    if (fileObj.size > 1_500_000) {
      try {
        fileObj = await compressFile(fileObj, {
          maxWidth: 1280,
          maxHeight: 1280,
          quality: 0.8,
        });
      } catch (err) {
        console.warn("Compress before upload failed, continue with original file.", err);
      }
    }

    // อัปโหลด
    const form = new FormData();
    form.append("file", fileObj);
    form.append("mode", modeUpload); // ✅ สำคัญ: API ฝั่งคุณต้องการ
    Object.entries(extra || {}).forEach(([k, v]) => form.append(k, v));

    try {
      const res = await apiObj.post(uploadEndpoint, form); // ✅ สองพารามิเตอร์เท่านั้น
      console.log("[UPLOAD RESPONSE]", res);

      // พยายามดึง URL/ID ตามหลายรูปแบบที่พบบ่อย
      const urlCandidate =
        res?.data?.url ||
        res?.url ||
        res?.data?.data?.url ||
        res?.data?.result?.url ||
        res?.data?.file_url ||
        res?.data?.path ||
        res?.file_url;

      if (urlCandidate) {
        uploadedResults.push(urlCandidate);
      } else if (res?.data?.id) {
        uploadedResults.push(String(res.data.id)); // fallback เก็บเป็น id
      } else {
        console.warn("Upload success but URL/ID not found. Response:", res);
      }
    } catch (e) {
      console.error("Upload failed:", e);
      message.error("อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่");
      throw e;
    }
  }
  return uploadedResults;
}

/* ===================== Dual-path Camera Component ===================== */
function CameraDualPath({
  label = "ถ่ายรูป",
  maxCount = 10,
  defaultFacing = "environment", // "environment" | "user"
  onChange,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [items, setItems] = useState([]); // { previewUrl, source: 'stream'|'file', file?, uploadedUrl? }
  const [error, setError] = useState("");
  const [useFallback, setUseFallback] = useState(false);

  const emit = (next) => {
    setItems(next);
    onChange?.(next);
  };

  const softConstraints = {
    video: { facingMode: defaultFacing },
    audio: false,
  };
  const midConstraints = {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: { ideal: defaultFacing },
    },
    audio: false,
  };
  const hardConstraints = {
    video: {
      width: 1280,
      height: 720,
      facingMode: { ideal: defaultFacing },
    },
    audio: false,
  };

  async function tryOpenCamera() {
    setError("");
    setUseFallback(false);
    const variants = [softConstraints, midConstraints, hardConstraints];
    for (const c of variants) {
      try {
        const s = await navigator.mediaDevices.getUserMedia(c);
        return s;
      } catch (e) {
        // ลองตัวถัดไป
      }
    }
    throw new Error("no-camera");
  }

  const openCamera = async () => {
    try {
      const stream = await tryOpenCamera();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play?.();
      }
    } catch (e) {
      console.log("openCamera failed → fallback to input capture:", e);
      setUseFallback(true);
      setError("เปิดกล้องสดไม่ได้ สลับเป็นโหมดอัปโหลด/ถ่ายด้วยแอปกล้องของเครื่อง");
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

  const takePhoto = async () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const w = v.videoWidth || 1280;
    const h = v.videoHeight || 720;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(v, 0, 0, w, h);

    const rawDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    // บีบอัดก่อนเก็บลง state
    const compressedDataUrl = await compressDataUrl(rawDataUrl, {
      maxWidth: 1280,
      maxHeight: 1280,
      quality: 0.8,
    });

    const next = [
      ...items,
      { previewUrl: compressedDataUrl, source: "stream", uploadedUrl: null },
    ].slice(0, maxCount);
    emit(next);
  };

  const onFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const processed = [];
    for (const f of files) {
      const shouldCompress =
        (f.size || 0) > 1_000_000 || /image\/(jpeg|jpg)/i.test(f.type);
      const cfile = shouldCompress
        ? await compressFile(f, { maxWidth: 1280, maxHeight: 1280, quality: 0.8 })
        : f;

      const previewUrl = URL.createObjectURL(cfile);
      processed.push({
        previewUrl,
        source: "file",
        file: cfile,
        uploadedUrl: null,
      });
    }

    const next = [...items, ...processed].slice(0, maxCount);
    emit(next);
  };

  const removeAt = (idx) => {
    const next = items.filter((_, i) => i !== idx);
    emit(next);
  };

  useEffect(() => () => stopCamera(), []); // cleanup

  return (
    <div className="mt-3">
      <label className="block text-sm text-gray-700 sarabun-font mb-1">
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={openCamera}
          className="px-3 py-2 rounded bg-black text-white"
        >
          เปิดกล้อง
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

      {/* live video */}
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
            borderRadius: 8,
          }}
        />
      )}

      {/* fallback input capture */}
      {useFallback && (
        <div className="space-y-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <input
            type="file"
            accept="image/*;capture=camera"
            capture={defaultFacing === "environment" ? "environment" : "user"}
            multiple
            onChange={onFileChange}
          />
          <p className="text-xs text-gray-600">
            โหมดนี้จะเปิดแอปกล้องของเครื่อง ถ่ายแล้วอัปโหลดกลับมา
          </p>
        </div>
      )}

      {/* preview */}
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
    </div>
  );
}

/* ===================== Page ===================== */
export default function CollectPointsAdvance1() {
  const [loading, setLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  const documentNumber =
    typeof location !== "undefined" ? location.state?.document_number : null;

  const [historydetail, setHistorydetail] = useState(null);
  const [productBills, setProductBills] = useState([]); // [{ previewUrl, uploadedUrl?, file? }]
  const [productPhotos, setProductPhotos] = useState([]); // same shape
  const [user, setUser] = useState(null);
  const [receiveShop, setReceiveShop] = useState("");
  const [isPointModalVisible, setIsPointModalVisible] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [receiveDate, setReceiveDate] = useState(dayjs().format("YYYY-MM-DD"));

  // ✅ ใช้ endpoint อัปโหลดตัวเดียวกับโค้ดที่เวิร์ก
  const UPLOAD_ENDPOINT = paths.pathUpload;

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get(paths.pathProfileDetail, { id: userInfo.id });
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

    return () => {
      // cleanup blob url
      productBills.forEach(
        (f) =>
          f.previewUrl &&
          f.previewUrl.startsWith("blob:") &&
          URL.revokeObjectURL(f.previewUrl)
      );
      productPhotos.forEach(
        (f) =>
          f.previewUrl &&
          f.previewUrl.startsWith("blob:") &&
          URL.revokeObjectURL(f.previewUrl)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    try {
      if (productBills.length === 0 || productPhotos.length === 0) {
        message.error("กรุณากรอกข้อมูลให้ครบในช่องที่มีเครื่องหมาย *");
        return;
      }
      setLoading(true);

      const extra = { document_number: historydetail?.document_number ?? documentNumber };

      // ✅ ส่ง mode แยกสองชุดให้ตรงกับงาน
      const billUrls = await ensureUploadedUrls(api, UPLOAD_ENDPOINT, productBills, extra, "bill");
      const productUrls = await ensureUploadedUrls(api, UPLOAD_ENDPOINT, productPhotos, extra, "product");

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

      const payload = {
        product: productUrls,
        bill: billUrls,
        receive_date: receiveDate,
        receive_shop: receiveShop,
      };

      const res = await api.post(paths.pathSalePointReceive, payload);
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

          {/* Dual-path: getUserMedia -> input capture */}
          <CameraDualPath
            label="ถ่ายรูปบิลเงินสดหรือใบสั่งสินค้า"
            maxCount={20}
            defaultFacing="environment"
            onChange={setProductBills}
          />

          <CameraDualPath
            label="ถ่ายรูปบิลเงินสดและสินค้าที่ได้รับ (อย่างละ 1 รูป)"
            maxCount={20}
            defaultFacing="environment"
            onChange={setProductPhotos}
          />

          <DynamicButton
            text="บันทึก"
            className="w-full bg-green-700 text-white py-3 rounded-md mt-6 sarabun-font"
            onClick={handleSubmit}
          />
        </div>

        <BackButton url="/mobile/main" />

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
