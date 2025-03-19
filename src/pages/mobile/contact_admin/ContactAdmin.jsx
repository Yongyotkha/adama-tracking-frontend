import React, { useState } from "react";
import { Input, Select } from "antd";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import BackButton from "../../../components/mobile/button/BackButton";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";

const { Option } = Select;

export default function ContactAdmin() {
  const [loading, setLoading] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const navigate = useNavigate();

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header Section */}
        <div className="w-full max-w-md py-4 flex justify-between items-center">
          <h2 className="text-[#009845] text-lg font-semibold sarabun-font">ติดต่อเจ้าหน้าที่</h2>
        </div>

        {/* User Details Form */}
        <div className="w-full max-w-md mt-4">
          <form className="space-y-4 sarabun-font">
            {/* ชื่อร้าน */}
            <div>
              <label className="text-gray-500 sarabun-font">ชื่อร้าน</label>
              <Input className="mt-1 sarabun-font text-[#A19793]" value="จุฬารักษ์ทันตะ" disabled />
            </div>

            {/* ประเภทการแจ้งติดต่อ */}
            <div>
              <label className="text-gray-500 sarabun-font">
                ประเภทการแจ้งติดต่อ<span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <Select className="sarabun-font flex-1" placeholder="เลือก">
                  <Option className="sarabun-font" value="เปลี่ยนหมายเลขโทรศัพท์">
                    เปลี่ยนหมายเลขโทรศัพท์
                  </Option>
                  <Option className="sarabun-font" value="ลืมหมายเลขโทรศัพท์">ลืมหมายเลขโทรศัพท์</Option>
                </Select>
              </div>
            </div>

            {/* ชื่อ */}
            <div>
              <label className="text-gray-500 sarabun-font">
                ชื่อ<span className="text-red-500">*</span>
              </label>
              <Input className="mt-1 sarabun-font text-[#A19793]" value="Krairoek" />
            </div>

            {/* นามสกุล */}
            <div>
              <label className="text-gray-500 sarabun-font">
                นามสกุล<span className="text-red-500">*</span>
              </label>
              <Input className="mt-1 sarabun-font text-[#A19793]" value="Ruangkol" />
            </div>

            {/* เบอร์ติดต่อ */}
            <div>
              <label className="text-gray-500 sarabun-font">
                เบอร์ติดต่อ<span className="text-red-500">*</span>
              </label>
              <Input className="mt-1 sarabun-font text-[#A19793]" value="02-9110653" />
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md flex justify-between align-bottom mt-auto space-x-2">
          <BackButton url="/mobile/verify" />

          <div className="w-full max-w-md mt-auto py-2">
            <button
              onClick={() => setIsConfirmationVisible(true)}
              className="w-full py-3 bg-[#009845] rounded-lg text-white sarabun-font flex items-center justify-center space-x-2"
            >
              <span className="sarabun-font">แจ้งเจ้าหน้าที่</span>
            </button>
          </div>
        </div>
      </div>

      {/* DynamicPopUp - Confirmation Popup */}
      <DynamicPopUp
        visible={isConfirmationVisible}
        onConfirm={() => {
          setIsConfirmationVisible(false);
          navigate("/mobile/verify"); // Navigate to "ยืนยันตัวตนของคุณ" page
        }}
        src="/logo/Logo-Adama-Smile-2-New 1.png" // Replace with actual image path
        text="<p class='text-[#978B87] text-center sarabun-font'>ส่งข้อมูลแจ้งเจ้าหน้าที่เรียบร้อยแล้ว กรุณารอการติดต่อกลับ</p>"
        confirmText="ตกลง"
      />
    </MobileLayout>
  );
}
