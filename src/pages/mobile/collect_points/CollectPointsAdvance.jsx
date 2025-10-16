import React, { useEffect, useState, useContext } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { Input, DatePicker, message } from "antd";
import DynamicButton from "../../../components/button/DynamicButton";
import BackButton from "../../../components/mobile/button/BackButton";
import { useNavigate, useLocation } from "react-router-dom"; // NEW
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
  const location = useLocation();               // NEW
  const { userInfo } = useContext(AuthContext);

  // ====== โหมดอัปเดต / อ่าน document_number จาก state ======
  const documentNumber = location.state?.document_number || null; // NEW
  console.log('location.state? : ', location.state)
  console.log('documentNumber : ', documentNumber)
  const isUpdate = Boolean(documentNumber);                       // NEW

  const [historydetail, setHistorydetail] = useState(null);
  const [billPhotos, setBillPhotos] = useState([]);       // * หน้าบิล/ใบสั่งสินค้า (รูปที่อัปโหลดแล้ว -> เก็บเป็น {uid,url})
  const [productPhotos, setProductPhotos] = useState([]); // * สินค้าที่ได้รับ
  const [productBills, setProductBills] = useState([]);   // * ไฟล์บิล (storage URL แล้ว)
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
          if (response.data?.dealer?.dealer_name_th) {
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
    if (userInfo?.id) fetchUserProfile();
  }, [userInfo?.id]);

  // ===== preload รายละเอียดเอกสารตอนแก้ไข =====
  useEffect(() => {
    const loadDetailForUpdate = async () => {
      if (!isUpdate || !documentNumber) return;
      setLoading(true);

      // helper แปลง array ของ API → ไฟล์ที่พรีวิวได้
      const mapToFiles = (arr = [], prefix) =>
        arr
          .filter((x) => x?.part && /^https?:\/\//i.test(x.part))
          .map((x, i) => ({
            uid: `${prefix}-${x.id ?? i}`,
            url: x.part,
            name: (x.part.split("/").pop() || `${prefix}-${i}`).slice(-80),
            status: "done",
          }));

      try {
        const res = await useServiceAPI.get(paths.pathSalePointReceiveDetail, {
          document_number: documentNumber,
        });

        if (res?.status === 200 && res?.result && res?.data) {
          const d = res.data;
          setHistorydetail(d);

          // วันที่ (ถ้า API ไม่มี receive_date ใช้ document_date แทน)
          setReceiveDate(
            (d.receive_date && dayjs(d.receive_date).format("YYYY-MM-DD")) ||
            (d.document_date && dayjs(d.document_date).format("YYYY-MM-DD")) ||
            dayjs().format("YYYY-MM-DD")
          );

          // *** รูปเก่า ***
          // bill[].part  => บิล/ใบสั่งสินค้า
          setProductBills(mapToFiles(d.bill, "bill"));

          // picture[].part => รูปสินค้า
          setProductPhotos(mapToFiles(d.picture, "prod"));
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

  const handleSubmit = async () => {
    if (productBills.length === 0 || productPhotos.length === 0) {
      message.error("กรุณากรอกข้อมูลให้ครบในช่องที่มีเครื่องหมาย *");
      return;
    }

    // เก็บเฉพาะ URL จริง (ตัด blob:)
    const productUrls = productPhotos
      .map((f) => f?.url)
      .filter((u) => typeof u === "string" && /^https?:\/\//i.test(u));
    if (productUrls.length === 0) {
      message.error("กรุณาถ่ายและอัปโหลดรูปสินค้าที่ได้รับอย่างน้อย 1 รูป");
      return;
    }

    const billUrls = productBills
      .map((f) => f?.url)
      .filter((u) => typeof u === "string" && /^https?:\/\//i.test(u));
    if (billUrls.length === 0) {
      message.error("กรุณาถ่ายและอัปโหลดรูปบิล/ใบสั่งสินค้าอย่างน้อย 1 รูป");
      return;
    }

    // ====== payload ======
    const basePayload = {
      product: productUrls,
      bill: billUrls,
      receive_date: receiveDate, // YYYY-MM-DD
      receive_shop: receiveShop,
    };

    const payload = isUpdate
      ? { ...basePayload, document_number: documentNumber } // NEW: ส่ง document_number ตอนอัปเดต
      : basePayload;

    try {
      setLoading(true);
      const url = isUpdate
        ? paths.pathSalePointReceiveUpdateRequest // NEW: endpoint อัปเดต
        : paths.pathSalePointReceive;             // เดิม: create

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
          {isUpdate ? "แก้ไขการแจ้งรับสินค้าล่วงหน้า" : "แจ้งรับสินค้าล่วงหน้า"} {/* NEW */}
        </h2>

        {/* Form */}
        <div className="mt-4 space-y-4 sarabun-font">
          {/* แสดงเลขเอกสารตอนโหมดอัปเดต */}
          {isUpdate && ( // NEW
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
              ชื่อร้านยี่ปั๊ว<span className="text-red-500">*</span>
            </label>
            <Input
              value={user?.dealer?.dealer_name_en ?? ""}
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
              label="ถ่ายรูปบิลเงินสดหรือใบสั่งสินค้า"
              required
              value={productBills}
              onChange={setProductBills}
              maxCount={20}
              defaultFacing="environment"
              allowTorch={true}
              uploadOnCapture
              uploadMode="activity"
              uploadExtra={{ document_number: historydetail?.document_number ?? documentNumber }} // NEW
              onUploadSuccess={() => { }}
            />
          </div>

          <div className="mt-3">
            <MobileCameraAuto
              label="ถ่ายรูปสินค้าที่ได้รับ"
              required
              value={productPhotos}
              onChange={setProductPhotos}
              maxCount={20}
              defaultFacing="environment"
              allowTorch={true}
              uploadOnCapture
              uploadMode="activity"
              uploadExtra={{ document_number: historydetail?.document_number ?? documentNumber }} // NEW
              onUploadSuccess={() => { }}
            />
          </div>

          {/* ปุ่มบันทึก / อัปเดต */}
          <DynamicButton
            text={isUpdate ? "อัปเดตข้อมูล" : "บันทึก"} // NEW
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
