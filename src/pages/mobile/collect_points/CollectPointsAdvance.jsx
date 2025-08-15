import React, { useEffect, useState } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { Input, DatePicker, message } from "antd";
import DynamicButton from "../../../components/button/DynamicButton";
import BackButton from "../../../components/mobile/button/BackButton";
import { useNavigate } from "react-router-dom";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import CameraMobile from "../../../components/mobile/camera/CameraMobile";

export default function CollectPointsAdvance() {
  const [loading, setLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const navigate = useNavigate();

  const [billPhotos, setBillPhotos] = useState([]);      // * หน้าบิล/ใบสั่งสินค้า
  const [productPhotos, setProductPhotos] = useState([]); // * สินค้าที่ได้รับ

  useEffect(() => {
    setLoading(false);
    return () => {
      billPhotos.forEach((f) => f.url && URL.revokeObjectURL(f.url));
      productPhotos.forEach((f) => f.url && URL.revokeObjectURL(f.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    if (billPhotos.length === 0 || productPhotos.length === 0) {
      message.error("กรุณาแนบรูปให้ครบในช่องที่มีเครื่องหมาย *");
      return;
    }

    // TODO: ส่ง API (ตัวอย่าง)
    // const formData = new FormData();
    // billPhotos.forEach((f) => formData.append("billPhotos[]", f.originFileObj));
    // productPhotos.forEach((f) => formData.append("productPhotos[]", f.originFileObj));
    // ...แนบฟิลด์อื่นๆ และ fetch/axios ไปยัง backend

    setIsSuccessModalVisible(true);
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
              วันที่แจ้งรับสินค้าล่วงหน้า
            </label>
            <DatePicker
              format="D/M/YYYY"
              className="w-full h-10 rounded-md text-gray-700 sarabun-font"
              placeholder="เลือกวันที่"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">
              ชื่อร้านยี่ปั๊ว<span className="text-red-500">*</span>
            </label>
            <Input placeholder="ระบุชื่อร้าน" className="h-10 rounded-md sarabun-font" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">
              ชื่อร้านค้า
            </label>
            <Input
              value="จรุงรักษ์เกษตร"
              disabled
              className="h-10 rounded-md sarabun-font bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">
              เบอร์โทรศัพท์มือถือ
            </label>
            <Input
              value="0820762989"
              disabled
              className="h-10 rounded-md sarabun-font bg-gray-100"
            />
          </div>

          {/* ใช้ CameraMobile: หน้าบิล/ใบสั่งสินค้า* */}
          <CameraMobile
            label="ถ่ายรูปหน้าบิลเงินสดหรือใบสั่งสินค้า"
            required
            value={billPhotos}
            onChange={setBillPhotos}
            maxCount={12}
            defaultFacing="environment"
            allowTorch={true}
            // ตัวอย่างกำหนดปุ่ม trigger เอง:
            // renderTrigger={(open) => (
            //   <button onClick={open} className="w-full h-10 rounded-md bg-green-50 border border-green-600 text-green-700 sarabun-font">
            //     เปิดกล้องถ่ายหน้าบิล
            //   </button>
            // )}
          />

          {/* ใช้ CameraMobile: สินค้าที่ได้รับ* */}
          <CameraMobile
            label="ถ่ายรูปสินค้าที่ได้รับ"
            required
            value={productPhotos}
            onChange={setProductPhotos}
            maxCount={20}
            defaultFacing="environment"
            allowTorch={true}
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
