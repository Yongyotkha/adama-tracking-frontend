import React, { useEffect, useState, useContext, useRef } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { Input, DatePicker, message } from "antd";
import DynamicButton from "../../../components/button/DynamicButton";
import BackButton from "../../../components/mobile/button/BackButton";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import api from "../../../services/corsService";
import { paths } from "../../../services/CorsPath";
import dayjs from "dayjs";

/* ===================== Utilities ===================== */
const dataUrlToFile = async (dataUrl, fileName = "photo.jpg") => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type || "image/jpeg" });
};

const mapPartsToItems = (arr = []) =>
  (arr || [])
    .filter(x => typeof x?.part === "string" && x.part.length > 0)
    .map(x => ({
      previewUrl: x.part,   // ให้แสดงรูปได้ทันที
      uploadedUrl: x.part,  // บอกว่าเป็น URL ที่อัปโหลดแล้ว
      source: "url",
      file: null,
      type: x.type ?? undefined,
      id: x.id ?? undefined,
    }));

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

/** อัปโหลดรายการรูป: ถ้าเป็น URL จริงอยู่แล้วจะข้าม, ถ้าเป็น stream/blob จะอัปโหลด */
async function ensureUploadedUrls(
  apiObj,
  uploadEndpoint,
  items = [],
  extra = {},
  modeUpload = "activity"
) {
  const uploadedResults = [];

  for (const it of items) {
    // URL จริงอยู่แล้ว -> ใช้ต่อ
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

    // บีบอัดก่อนอัปโหลด (ถ้าใหญ่)
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
    form.append("mode", modeUpload);
    Object.entries(extra || {}).forEach(([k, v]) => form.append(k, v));

    try {
      const res = await apiObj.post(uploadEndpoint, form); // ใช้ signature เดิม
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
        uploadedResults.push(String(res.data.id)); // fallback เป็น id
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
/* ===================== Dual-path Camera Component (patched) ===================== */
function CameraDualPath({
  label = "ถ่ายรูป",
  maxCount = 10,
  defaultFacing = "environment",
  onChange,
  value,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [items, setItems] = useState(value || []);
  const [error, setError] = useState("");

  // ✅ ตรวจจับ LINE Android แล้วบังคับ fallback
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isLine = /\bLine\//i.test(navigator.userAgent);
  const isLineAndroid = isAndroid && isLine;

  const [useFallback, setUseFallback] = useState(isLineAndroid);

  useEffect(() => {
    if (Array.isArray(value)) setItems(value);
  }, [value]);

  const emit = (next) => {
    setItems(next);
    onChange?.(next);
  };

  // constraints ไล่จากนิ่ม → กลาง → แข็ง → true (ตัด facingMode ทิ้ง)
  const variants = [
    { video: { facingMode: defaultFacing }, audio: false },
    {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: defaultFacing,
      },
      audio: false,
    },
    {
      video: {
        width: 1280,
        height: 720,
        facingMode: { ideal: defaultFacing },
      },
      audio: false,
    },
    { video: true, audio: false },
  ];

  async function tryOpenCamera() {
    setError("");
    setUseFallback(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("no-getUserMedia");
    }
    for (const c of variants) {
      try {
        return await navigator.mediaDevices.getUserMedia(c);
      } catch (e) {
        // ลองตัวถัดไป
      }
    }
    throw new Error("no-camera");
  }

  const openCamera = async () => {
    // ถ้าเป็น LINE Android ให้บังคับ fallback เสมอ
    if (isLineAndroid) {
      setUseFallback(true);
      setError("เปิดกล้องสดใน LINE (Android) ไม่ได้ — ใช้โหมดกล้องของเครื่องแทน");
      return;
    }

    try {
      const stream = await tryOpenCamera();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // บาง WebView ต้อง set attribute ตรง ๆ
        videoRef.current.setAttribute("playsinline", "");
        await videoRef.current.play?.();
      }
    } catch (e) {
      console.log("openCamera failed → fallback:", e);
      setUseFallback(true);
      setError("เปิดกล้องสดไม่ได้ สลับเป็นโหมดอัปโหลด/ถ่ายด้วยแอปกล้องของเครื่อง");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    // หยุดกล้องแล้วคงโหมดเดิมไว้; ถ้าต้องกลับไปสดเองให้กด "เปิดกล้อง"
  };

  const takePhoto = async () => {
    if (!videoRef.current) return;
    const v = videoRef.current;

    // เผื่อบาง WebView ค่าเป็น 0 ให้รอ loadedmetadata
    if (!v.videoWidth || !v.videoHeight) {
      await new Promise((r) =>
        v.addEventListener("loadedmetadata", () => r(), { once: true })
      );
    }

    const w = v.videoWidth || 1280;
    const h = v.videoHeight || 720;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(v, 0, 0, w, h);

    const rawDataUrl = canvas.toDataURL("image/jpeg", 0.92);
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

      {!useFallback && (
        <video
          ref={(el) => {
            videoRef.current = el;
            if (el) el.setAttribute("playsinline", "");
          }}
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

      <div className="flex gap-2 mb-2 mt-2">
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

      {useFallback && (
        <div className="space-y-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {/* ✅ ใช้ accept/capture แบบเข้ากันได้สูงสุด */}
          <input
            id="cameraInput"
            type="file"
            accept="image/*"
            capture={defaultFacing === "environment" ? "environment" : "user"}
            multiple
            onChange={onFileChange}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="px-3 py-2 rounded bg-black text-white"
            onClick={() => document.getElementById("cameraInput")?.click()}
          >
            เปิดกล้อง (โหมดไฟล์)
          </button>
          <p className="text-xs text-gray-600">
            โหมดนี้จะเปิดแอปกล้องของเครื่อง ถ่ายแล้วอัปโหลดกลับมา
          </p>
        </div>
      )}

      {items?.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {items.map((it, idx) => (
            <div key={idx} className="relative">
              <img
                src={it.uploadedUrl || it.previewUrl}
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


/* ===================== Page: Create + Update ===================== */
export default function CollectPointsAdvance2() {
  const [loading, setLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isPointModalVisible, setIsPointModalVisible] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useContext(AuthContext);
  console.log('location.state? : ', location.state)
  // ถ้ามี document_number → โหมด Update
  const documentNumber =
    typeof location !== "undefined" ? location.state?.document_number : null;
  console.log('documentNumber : ', documentNumber)
  const isUpdateMode = Boolean(documentNumber);

  const [user, setUser] = useState(null);
  const [receiveShop, setReceiveShop] = useState("");
  const [receiveDate, setReceiveDate] = useState(dayjs().format("YYYY-MM-DD"));

  const [detail, setDetail] = useState(null); // ข้อมูลเดิมจาก API (ถ้ามี)
  const [productBills, setProductBills] = useState([]);   // [{ previewUrl, uploadedUrl?, file? }]
  const [productPhotos, setProductPhotos] = useState([]); // same shape

  const UPLOAD_ENDPOINT = paths.pathUpload;

  /* ---------- โหลดข้อมูลโปรไฟล์ ---------- */
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- ถ้าเป็นโหมด Update: โหลดรายละเอียดเดิม ---------- */
  useEffect(() => {
    if (!isUpdateMode) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);

        const res = await api.get(paths.pathSalePointReceiveDetail, {
          document_number: documentNumber,
        });

        if (res?.status === 200) {
          // บาง backend จะห่อด้วย data.data
          const d = res?.data?.data ?? res?.data ?? {};
          setDetail(d);

          // วันที่/ร้าน (ถ้ามี)
          if (d.document_date || d.receive_date) {
            setReceiveDate(dayjs(d.document_date || d.receive_date).format("YYYY-MM-DD"));
          }
          if (d.sub_dealer_name || d.receive_shop) {
            setReceiveShop(d.receive_shop || d.sub_dealer_name || "");
          }

          // ✅ พรีฟิลด์รูปเก่าเข้า component ให้ถูกต้อง
          // bill = อาร์เรย์ของ object มี key 'part'
          const billItems = mapPartsToItems(d.bill);
          setProductBills(billItems);

          // product photos = ใช้จาก picture (type:2)
          // *ถ้าหลังบ้านแยก type ให้กรองเฉพาะ type=2 ด้วยก็ได้*
          const pictureItems = mapPartsToItems(
            Array.isArray(d.picture) ? d.picture.filter(x => String(x.type) === "2") : []
          );
          setProductPhotos(pictureItems);

        } else {
          message.error(res?.data?.message || "ไม่พบข้อมูลสำหรับแก้ไข");
        }
      } catch (e) {
        console.error("Load detail error:", e);
        message.error("ไม่สามารถโหลดข้อมูลเดิมได้");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdateMode, documentNumber]);


  /* ---------- Submit สองโหมด ---------- */
  const handleSubmit = async () => {
    try {
      if (productBills.length === 0 || productPhotos.length === 0) {
        message.error("กรุณากรอกข้อมูลให้ครบในช่องที่มีเครื่องหมาย *");
        return;
      }
      setLoading(true);

      const extra = { document_number: detail?.document_number ?? documentNumber };

      // อัปโหลดเฉพาะรายการที่ยังไม่เป็น URL เดิม
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
        document_number: detail?.document_number ?? documentNumber, // สำคัญในโหมดอัปเดต
        product: productUrls,
        bill: billUrls,
        receive_date: receiveDate,
        receive_shop: receiveShop,
      };

      let res;
      if (isUpdateMode) {
        // ⚠️ เปลี่ยน endpoint ให้ตรงของจริง
        res = await api.post(paths.pathSalePointReceiveUpdateRequest, payload);
      } else {
        res = await api.post(paths.pathSalePointReceive, payload);
      }

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
          {isUpdateMode ? "แก้ไขการแจ้งรับสินค้าล่วงหน้า" : "แจ้งรับสินค้าล่วงหน้า"}
        </h2>

        <div className="mt-4 space-y-4 sarabun-font">

          {/* แสดงเลขที่เอกสารเฉพาะโหมดอัปเดต */}
          {isUpdateMode && (
            <div>
              <label className="block text-sm text-gray-700 sarabun-font mb-1">
                เลขที่เอกสาร
              </label>
              <Input
                value={detail?.document_number ?? documentNumber ?? ""}
                disabled
                className="h-10 rounded-md sarabun-font bg-gray-100"
              />
            </div>
          )}

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

          {/* พรีฟิลด์ค่า value สำหรับโหมด Update */}
          <CameraDualPath
            label="ถ่ายรูปบิลเงินสดหรือใบสั่งสินค้า"
            maxCount={20}
            defaultFacing="environment"
            onChange={setProductBills}
            value={productBills}
          />

          <CameraDualPath
            label="ถ่ายรูปสินค้าที่ได้รับ"
            maxCount={20}
            defaultFacing="environment"
            onChange={setProductPhotos}
            value={productPhotos}
          />

          <DynamicButton
            text={isUpdateMode ? "อัปเดตข้อมูล" : "บันทึก"}
            className="w-full bg-green-700 text-white py-3 rounded-md mt-6 sarabun-font"
            onClick={handleSubmit}
          />
        </div>

        <BackButton url="/mobile/collect-points" />

        <DynamicPopUp
          visible={isSuccessModalVisible}
          onConfirm={() => {
            setIsSuccessModalVisible(false);
            navigate(-1);
          }}
          src="/img/icons/check-circle.png"
          text={`<div class='text-center'>
              <p class='text-[#4A4A4A] text-[18px] mt-1 sarabun-font'>${isUpdateMode ? "อัปเดตข้อมูลสำเร็จ" : "ส่งข้อมูลสำเร็จ"}</p>
              <p class='text-[#A1A1A1] text-[14px] mt-1 sarabun-font'>รอดำเนินการจากทางเจ้าหน้าที่</p>
            </div>`}
          cancelText="ยกเลิก"
          confirmText="ยืนยัน"
        />
      </div>
    </MobileLayout>
  );
}
