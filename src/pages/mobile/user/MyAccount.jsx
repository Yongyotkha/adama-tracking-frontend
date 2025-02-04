import React, { useState } from "react";
import { Card } from "antd";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import { UserOutlined, FileTextOutlined, LockOutlined, QuestionCircleOutlined, PhoneOutlined, LogoutOutlined, ArrowLeftOutlined } from "@ant-design/icons";

export default function MobileAccount() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full min-h-screen pb-6">
        {/* Header Section */}
        <div className="w-full rounded-b-[40px] flex justify-center items-center relative gap-2">
          <div className="w-24 h-24 bg-gray-300 rounded-full border-4 border-white overflow-hidden ">
            {/* ใช้รูปภาพถ้ามี */}
            <img src="/path-to-user-image.jpg" alt="Profile" className="w-full h-full object-cover shadow" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold mt-3 text-[#A19793]">คุณ Krairoek Ruangkol</h2>
            <p className="text-[#A19793]">รหัสสมาชิก : 123455</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full max-w-md mt-6 ">
          {/* Personal Info */}
          <Card className="rounded-xl shadow-md">
            <div className="flex items-center space-x-3 cursor-pointer">
              <UserOutlined className="text-lg text-gray-500" />
              <p className="text-gray-700">ข้อมูลส่วนตัว</p>
            </div>
          </Card>

          {/* Settings Section */}
          <div className="mt-4 space-y-2">
            <div className="sarabun-font pt-2">การตั้งค่า</div>
            <Card className="rounded-xl shadow-md cursor-pointer">
              <div className="flex items-center space-x-3">
                <FileTextOutlined className="text-lg text-gray-500" />
                <p className="text-gray-700">ข้อตกลงและเงื่อนไข</p>
              </div>
            </Card>
            <Card className="rounded-xl shadow-md cursor-pointer">
              <div className="flex items-center space-x-3">
                <LockOutlined className="text-lg text-gray-500" />
                <p className="text-gray-700">นโยบายความเป็นส่วนตัว</p>
              </div>
            </Card>
            <Card className="rounded-xl shadow-md cursor-pointer">
              <div className="flex items-center space-x-3">
                <QuestionCircleOutlined className="text-lg text-gray-500" />
                <p className="text-gray-700">คำถามที่พบบ่อย</p>
              </div>
            </Card>
            <Card className="rounded-xl shadow-md cursor-pointer">
              <div className="flex items-center space-x-3">
                <PhoneOutlined className="text-lg text-gray-500" />
                <p className="text-gray-700">ติดต่อเรา</p>
              </div>
            </Card>
            <Card className="rounded-xl shadow-md cursor-pointer bg-red-100">
              <div className="flex items-center space-x-3 text-red-500">
                <LogoutOutlined className="text-lg" />
                <p>ออกจากระบบ</p>
              </div>
            </Card>
          </div>
        </div>
        {/* Back Button */}
        <div className="mt-auto w-full">
          <button className="w-full py-3 bg-gray-300 rounded-lg text-gray-700 flex items-center justify-center space-x-2">
            <ArrowLeftOutlined />
            <span>ย้อนกลับ</span>
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
