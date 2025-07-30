import React, { useEffect, useState } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { Input, Upload, DatePicker } from "antd";
import DynamicButton from "../../../components/button/DynamicButton";
import BackButton from "../../../components/mobile/button/BackButton";
import { useNavigate } from "react-router-dom";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";

export default function CollectPointsAdvance() {
  const [loading, setLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSubmit = () => {
    // สมมุติว่าบันทึกสำเร็จทันที
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

          <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">
              ถ่ายรูปหน้าบิลเงินสดหรือใบสั่งสินค้า
              <span className="text-red-500">*</span>
            </label>
            <Upload.Dragger
              multiple
              className="rounded-md"
              height={100}
              listType="picture"
              beforeUpload={() => false}
            >
              <p className="text-gray-500 sarabun-font">ลากหรือคลิกเพื่ออัปโหลด</p>
            </Upload.Dragger>
          </div>

          <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">
              ถ่ายรูปสินค้าที่ได้รับ<span className="text-red-500">*</span>
            </label>
            <Upload.Dragger
              multiple
              className="rounded-md"
              height={100}
              listType="picture"
              beforeUpload={() => false}
            >
              <p className="text-gray-500 sarabun-font">ลากหรือคลิกเพื่ออัปโหลด</p>
            </Upload.Dragger>
          </div>

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
          text={
            `<div class='text-center'>
              <p class='text-[#4A4A4A] text-[18px] mt-1 sarabun-font'>ส่งข้อมูลสำเร็จ</p>
              <p class='text-[#A1A1A1] text-[14px] mt-1 sarabun-font'>รอดำเนินการจากทางเจ้าหน้าที่</p>
            </div>`
          }
          cancelText="ยกเลิก"
          confirmText="ยืนยัน"
        />
      </div>
    </MobileLayout>
  );
}
