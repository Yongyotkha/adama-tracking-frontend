import React, { useEffect, useState, useContext } from "react";
import dayjs from "dayjs";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { Input, DatePicker, message } from "antd";
import DynamicButton from "../../../components/button/DynamicButton";
import BackButton from "../../../components/mobile/button/BackButton";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import CameraMobile from "../../../components/mobile/camera/CameraMobile";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function CollectPointsAdvanceUpdate() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  const receive_id = location.state?.receive_id;

  const [productPhotos, setProductPhotos] = useState([]); // * สินค้าที่ได้รับ
  const [productBills, setProductBills] = useState([]); // * หน้าบิล/ใบสั่งสินค้า
  const [user, setUser] = useState(null);
  const [receiveDate, setReceiveDate] = useState("");   // "YYYY-MM-DD"
  const [receiveShop, setReceiveShop] = useState("");

  // โหลดโปรไฟล์ผู้ใช้ (ข้อมูลแสดงผล)
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathProfileDetail, { id: userInfo.id });
        if (response.status === 200 && response.result) {
          setUser(response.data);
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
  }, []);

  // โหลดรายละเอียดเดิมจาก receive_id แล้วใส่ลงฟอร์ม (UPDATE MODE)
  useEffect(() => {
    const fetchReceiveDetail = async () => {
      if (!receive_id) return;
      setLoading(true);
      try {
        const body = { platform: "web", id: String(receive_id), page: "all" };
        const res = await useServiceAPI.get(paths.pathSalePointReceiveDetail, body);
        if (res?.status === 200 && res?.result && res?.data) {
          const { receive, bill = [], product = [] } = res.data;

          // receive_date: "2025-08-09 00:00:00.0000000" -> "2025-08-09"
          const d = (receive?.receive_date || "").toString().slice(0, 10);
          setReceiveDate(d || "");
          setReceiveShop(receive?.receive_shop ?? "");

          // ให้ CameraMobile แสดงรูปเดิมได้ โดยต้องมี url เป็นลิงก์จริง
          setProductBills(bill.map((b) => ({ id: b.id, url: b.part })));
          setProductPhotos(product.map((p) => ({ id: p.id, url: p.part })));
        } else {
          message.error(res?.message || "ไม่พบข้อมูลสำหรับแก้ไข");
        }
      } catch (err) {
        console.error("Fetch receive detail error:", err);
        message.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };
    fetchReceiveDetail();
  }, [receive_id]);

  useEffect(() => {
    return () => {
      productBills.forEach((f) => f.url && URL.revokeObjectURL(f.url));
      productPhotos.forEach((f) => f.url && URL.revokeObjectURL(f.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (productBills.length === 0 || productPhotos.length === 0) {
      message.error("กรุณาแนบรูปให้ครบในช่องที่มีเครื่องหมาย *");
      return;
    }

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

    if (!receiveDate) {
      message.error("กรุณาเลือกวันที่รับสินค้า");
      return;
    }
    if (!receiveShop.trim()) {
      message.error("กรุณาระบุชื่อร้านยี่ปั๊ว");
      return;
    }

    // เพิ่ม id + platform เพื่อให้ backend อัปเดต
    const payload = {
      platform: "web",
      id: String(receive_id),
      product: productUrls,
      bill: billUrls,
      receive_date: receiveDate,            // "YYYY-MM-DD"
      receive_shop: receiveShop.trim(),
    };

    try {
      setLoading(true);
      // หาก backend แยก path update ให้เปลี่ยนบรรทัดนี้
      const res = await useServiceAPI.post(paths.pathSalePointReceiveUpdate, payload);
      if (res?.status === 200) {
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
          แจ้งรับสินค้าล่วงหน้า (แก้ไข)
        </h2>

        {/* Form */}
        <div className="mt-4 space-y-4 sarabun-font">
          <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">
              วันที่แจ้งรับสินค้าล่วงหน้า
            </label>
            <DatePicker
              value={receiveDate ? dayjs(receiveDate, "YYYY-MM-DD") : null}
              format="YYYY-MM-DD"
              className="w-full h-10 rounded-md text-gray-700 sarabun-font"
              placeholder="เลือกวันที่"
              onChange={(_, dateString) => setReceiveDate(dateString)}
            />
          </div>

          {/* <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">
              ชื่อร้านยี่ปั๊ว<span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="ระบุชื่อร้าน"
              className="h-10 rounded-md sarabun-font"
              value={receiveShop}
              onChange={(e) => setReceiveShop(e.target.value)}
            />
          </div> */} 

          <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">
              ชื่อร้านยี่ปั๊ว<span className="text-red-500">*</span>
            </label>
            <Input
              value={user?.dealer.dealer_name_en ?? ""}
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

          <div className="mt-3">
            <CameraMobile
              label="ถ่ายรูปบิลเงินสดหรือใบสั่งสินค้า"
              required
              value={productBills}
              onChange={setProductBills}
              maxCount={20}
              defaultFacing="environment"
              allowTorch={true}
              uploadOnCapture
              uploadMode="activity"
            />
          </div>

          <div className="mt-3">
            <CameraMobile
              label="ถ่ายรูปสินค้าที่ได้รับ"
              required
              value={productPhotos}
              onChange={setProductPhotos}
              maxCount={20}
              defaultFacing="environment"
              allowTorch={true}
              uploadOnCapture
              uploadMode="activity"
            />
          </div>

          {/* ปุ่มบันทึก */}
          <DynamicButton
            text="บันทึก"
            className="w-full bg-green-700 text-white py-3 rounded-md mt-6 sarabun-font"
            onClick={handleSubmit}
          />
        </div>

        <BackButton url="/mobile/collect-points" />

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
