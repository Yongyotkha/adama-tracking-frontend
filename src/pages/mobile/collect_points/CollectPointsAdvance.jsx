// src/pages/mobile/collect_points/CollectPointsAdvance.jsx
import React, { useEffect, useState, useContext } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { Input, DatePicker, message } from "antd";
import DynamicButton from "../../../components/button/DynamicButton";
import BackButton from "../../../components/mobile/button/BackButton";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import MobileCameraAuto from "../../../components/mobile/camera/MobileCameraAuto";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import dayjs from "dayjs";

export default function CollectPointsAdvance() {
  const [loading, setLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isPointModalVisible, setIsPointModalVisible] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useContext(AuthContext);

  // ====== โหมดอัปเดต / อ่าน document_number จาก state ======
  const documentNumber = location.state?.document_number || null;
  const isUpdate = Boolean(documentNumber);

  const [historydetail, setHistorydetail] = useState(null);
  const [billPhotos, setBillPhotos] = useState([]);       // (ไม่ได้ใช้ใน payload ตอนนี้)
  const [productPhotos, setProductPhotos] = useState([]); // เก็บไฟล์จากกล้อง (มี originFileObj)
  const [productBills, setProductBills] = useState([]);   // (ถ้ามี)
  const [user, setUser] = useState(null);
  const [receiveShop, setReceiveShop] = useState("");
  const [receiveDate, setReceiveDate] = useState(dayjs().format("YYYY-MM-DD"));

  // โหลดข้อมูลโปรไฟล์
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathProfileDetail, { id: userInfo.id });
        if (response.status === 200 && response.result) {
          setUser(response.data);
          const dealerShopName =
            response.data?.dealer_name_en ||
            response.data?.dealer_name ||
            response.data?.dealer?.dealer_name_th ||
            response.data?.dealer?.dealer_name_en ||
            "";
          if (dealerShopName) {
            setReceiveShop(dealerShopName);
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
    if (userInfo?.id) fetchUserProfile();
  }, [userInfo?.id]);

  // ===== preload รายละเอียดเอกสารตอนแก้ไข =====
  useEffect(() => {
    const loadDetailForUpdate = async () => {
      if (!isUpdate || !documentNumber) return;
      setLoading(true);

      const mapToFiles = (arr = [], prefix) =>
        arr
          .filter((x) => x?.part && /^https?:\/\//i.test(x.part))
          .map((x, i) => ({
            uid: `${prefix}-${x.id ?? i}`,
            url: x.part,
            name: (x.part.split("/").pop() || `${prefix}-${i}`).slice(-80),
            status: "done",
            // หมายเหตุ: รูปเก่าจากเซิร์ฟเวอร์จะ "ไม่มี" originFileObj ให้บีบอัดอีก (ข้าม)
          }));

      try {
        const res = await useServiceAPI.get(paths.pathSalePointReceiveDetail, {
          document_number: documentNumber,
        });

        if (res?.status === 200 && res?.result && res?.data) {
          const d = res.data;
          setHistorydetail(d);

          setReceiveDate(
            (d.receive_date && dayjs(d.receive_date).format("YYYY-MM-DD")) ||
              (d.document_date && dayjs(d.document_date).format("YYYY-MM-DD")) ||
              dayjs().format("YYYY-MM-DD")
          );

          setProductBills(mapToFiles(d.bill, "bill"));
          setProductPhotos(mapToFiles(d.picture, "prod")); // จะเป็น URL ล้วน (ไม่มีไฟล์)
        }
      } catch (e) {
        console.error("Load detail error:", e);
        message.error("โหลดข้อมูลเดิมไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    loadDetailForUpdate();
  }, [isUpdate, documentNumber]);

  useEffect(() => {
    setLoading(false);
    return () => {
      productBills.forEach((f) => f.url && URL.revokeObjectURL?.(f.url));
      productPhotos.forEach((f) => f.url && URL.revokeObjectURL?.(f.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- utils: บีบอัดรูปให้ <= ~1MB ----------
  const readImage = (fileOrBlob) =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(fileOrBlob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });

  const canvasToBlob = (canvas, type = "image/jpeg", quality = 0.9) =>
    new Promise((resolve) => canvas.toBlob(resolve, type, quality));

  /**
   * บีบอัด/ย่อไฟล์ภาพจนกว่าจะ <= maxBytes (ดีฟอลต์ ~1MB)
   * - ลด quality ทีละนิด และย่อขนาดยาวสุดลงด้วย สัดส่วนคงเดิม
   */
  const compressImageToUnder1MB = async (file, {
    maxBytes = 1000 * 1000,
    maxSide = 1920,
    minQuality = 0.5,
  } = {}) => {
    const originalType = file.type || "image/jpeg";
    const useType = originalType.includes("png") ? "image/jpeg" : "image/jpeg"; // บังคับเป็น jpeg เพื่อลดขนาด
    const img = await readImage(file);

    // ตั้งค่าเริ่มต้น
    let quality = 0.9;
    let { width, height } = img;

    // จำกัดด้านยาวสุดครั้งแรก
    const largestSide = Math.max(width, height);
    if (largestSide > maxSide) {
      const scale = maxSide / largestSide;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    // loop ลดขนาดจนกว่าจะ <= maxBytes หรือ quality ต่ำสุด
    // มี safety counter กันลูปยาวเกิน
    let attempts = 0;
    let blob;

    while (attempts < 12) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      blob = await canvasToBlob(canvas, useType, quality);
      if (!blob) break;

      if (blob.size <= maxBytes) break;

      // ยังใหญ่ไป -> ลดคุณภาพก่อน
      if (quality > minQuality) {
        quality = Math.max(minQuality, quality - 0.1);
      } else {
        // คุณภาพถึงขั้นต่ำแล้ว -> ค่อยๆ ย่อขนาดลงอีกรอบ
        width = Math.round(width * 0.9);
        height = Math.round(height * 0.9);
      }

      attempts += 1;
    }

    // แปลงกลับเป็นไฟล์ใหม่ (คงชื่อเดิมแต่ .jpg)
    const newName = file.name?.replace(/\.(png|jpeg|jpg)$/i, ".jpg") || `image_${Date.now()}.jpg`;
    const outFile = new File([blob || file], newName, { type: "image/jpeg" });
    return outFile;
  };

  // ---------- อัปโหลดไฟล์ => ได้ URL จริง ----------
  const uploadFileAndGetUrl = async (file, extra = {}) => {
    const form = new FormData();
    form.append("file", file);
    form.append("mode", "activity");
    Object.entries(extra).forEach(([k, v]) => form.append(k, String(v)));

    const response = await useServiceAPI.post(paths.pathUpload, form);
    const remoteUrl =
      response?.data?.url ||
      response?.data?.file_url ||
      response?.data?.path ||
      response?.url ||
      null;

    if (!remoteUrl) throw new Error("Upload succeeded but URL missing");
    return remoteUrl;
  };

  const handleSubmit = async () => {
    try {
      // 1) ตรวจรูป
      if (productPhotos.length === 0) {
        message.error("กรุณากรอกข้อมูลให้ครบในช่องที่มีเครื่องหมาย *");
        return;
      }

      setLoading(true);

      // 2) เตรียมอัปโหลดรูป: กรณีมีทั้งรูปเก่าที่เป็น URL แล้ว และรูปใหม่ที่เป็นไฟล์
      const urls = [];

      // 2.1 loop ทุกรายการใน productPhotos
      for (const f of productPhotos) {
        // กรณีมีไฟล์จริง (จากกล้องรอบนี้) -> บีบอัดก่อนอัปโหลด
        if (f?.originFileObj instanceof File || f?.originFileObj instanceof Blob) {
          const compressed = await compressImageToUnder1MB(f.originFileObj, {
            maxBytes: 1000 * 1000, // ~1MB
            maxSide: 1920,
            minQuality: 0.5,
          });

          // อัปโหลดไฟล์บีบอัด
          const u = await uploadFileAndGetUrl(compressed, {
            document_number: historydetail?.document_number ?? documentNumber ?? "",
          });
          urls.push(u);
          continue;
        }

        // กรณีเป็น URL จากเซิร์ฟเวอร์อยู่แล้ว -> ใช้ได้เลย
        if (typeof f?.url === "string" && /^https?:\/\//i.test(f.url)) {
          urls.push(f.url);
          continue;
        }

        // กรณีเป็น blob: URL (ถ้ามี) พยายาม fetch แล้วบีบอัด
        if (typeof f?.url === "string" && f.url.startsWith("blob:")) {
          try {
            const blob = await fetch(f.url).then((r) => r.blob());
            const compressed = await compressImageToUnder1MB(blob, {
              maxBytes: 1000 * 1000,
              maxSide: 1920,
              minQuality: 0.5,
            });
            const u = await uploadFileAndGetUrl(compressed, {
              document_number: historydetail?.document_number ?? documentNumber ?? "",
            });
            urls.push(u);
          } catch {
            // ถ้าดึง blob ไม่ได้ ให้ข้ามรูปนี้
          }
        }
      }

      if (urls.length === 0) {
        message.error("กรุณาถ่ายและอัปโหลดรูปสินค้าที่ได้รับอย่างน้อย 1 รูป");
        setLoading(false);
        return;
      }

      // 3) สร้าง payload แล้วยิง API สร้าง/อัปเดต
      const basePayload = {
        product: urls,   // ใช้ลิสต์ URL ที่ได้หลังบีบอัด+อัปโหลด
        bill: [],
        receive_date: receiveDate,
        receive_shop: receiveShop,
      };

      const payload = isUpdate
        ? { ...basePayload, document_number: documentNumber }
        : basePayload;

      const url = isUpdate
        ? paths.pathSalePointReceiveUpdateRequest
        : paths.pathSalePointReceive;

      const res = await useServiceAPI.post(url, payload);

      if (res?.status === 200) {
        const pts = Number(res?.data?.point ?? 0);
        setEarnedPoints(pts);
        setIsPointModalVisible(true);
        setIsSuccessModalVisible(true);
      } else {
        message.error(res?.data?.message || (isUpdate ? "อัปเดตไม่สำเร็จ" : "บันทึกไม่สำเร็จ"));
      }
    } catch (err) {
      console.error("Submit error:", err);
      message.error(isUpdate ? "เกิดข้อผิดพลาดในการอัปเดต" : "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout loading={loading}>
      <div className="w-full max-w-md mx-auto px-4 pb-8">
        <h2 className="text-green-700 text-lg font-bold mt-4 sarabun-font">
          {isUpdate ? "แก้ไขการแจ้งรับสินค้าล่วงหน้า" : "แจ้งรับสินค้าล่วงหน้า"}
        </h2>

        <div className="mt-4 space-y-4 sarabun-font">
          {isUpdate && (
            <div>
              <label className="block text-sm text-gray-700 sarabun-font mb-1">
                เลขที่เอกสาร (Document Number)
              </label>
              <Input value={documentNumber} disabled className="h-10 rounded-md sarabun-font bg-gray-100" />
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
              ชื่อร้านยี่ปั๊ว<span className="text-red-500"></span>
            </label>
            <Input
              value={
                receiveShop ||
                user?.dealer_name_en ||
                user?.dealer_name ||
                user?.dealer?.dealer_name_th ||
                user?.dealer?.dealer_name_en ||
                ""
              }
              disabled
              className="h-10 rounded-md sarabun-font bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">ชื่อร้านค้า</label>
            <Input value={user?.shop_name ?? ""} disabled className="h-10 rounded-md sarabun-font bg-gray-100" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">เบอร์โทรศัพท์มือถือ</label>
            <Input value={user?.phone_number ?? ""} disabled className="h-10 rounded-md sarabun-font bg-gray-100" />
          </div>

          <div className="mt-3">
            <MobileCameraAuto
              label="ถ่ายรูปบิลเงินสดและสินค้าที่ได้รับ (อย่างละ 1 รูป)"
              required
              value={productPhotos}
              onChange={setProductPhotos}
              maxCount={20}
              defaultFacing="environment"
              allowTorch={true}
              // ปรับ: ยังไม่อัปโหลดตอนถ่าย เพื่อมาบีบอัดก่อนใน handleSubmit
              uploadOnCapture={false}
              uploadMode="activity"
              uploadExtra={{ document_number: historydetail?.document_number ?? documentNumber }}
              onUploadSuccess={() => {}}
            />
          </div>

          <DynamicButton
            text={isUpdate ? "อัปเดตข้อมูล" : "บันทึก"}
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
              <p class='text-[#4A4A4A] text-[18px] mt-1 sarabun-font'>${isUpdate ? "อัปเดตข้อมูลสำเร็จ" : "ส่งข้อมูลสำเร็จ"}</p>
              <p class='text-[#A1A1A1] text-[14px] mt-1 sarabun-font'>รอดำเนินการจากทางเจ้าหน้าที่</p>
            </div>`}
          cancelText="ยกเลิก"
          confirmText="ยืนยัน"
        />
      </div>
    </MobileLayout>
  );
}
