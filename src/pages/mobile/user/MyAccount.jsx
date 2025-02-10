import React, { useState } from "react";
import { Card } from "antd";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  FileTextOutlined,
  LockOutlined,
  QuestionCircleOutlined,
  PhoneOutlined,
  LogoutOutlined,
  RightOutlined,
} from "@ant-design/icons";
import BackButton from "../../../components/mobile/button/BackButton";

export default function MyAccount() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header Section */}
        <div className="w-full rounded-b-[40px] flex items-center relative gap-2 max-w-md ">
          <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden shadow">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsynwv-5qtogtOwJbIjaPFJUmHpzhxgqIAug&s"
              alt="Profile"
              className="w-full h-full object-cover shadow"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold mt-3 text-[#A19793] sarabun-font">
              คุณ Krairoek Ruangkol
            </h2>
            <p className="text-[#A19793] sarabun-font">รหัสสมาชิก : 123455</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full max-w-md mt-6 flex flex-col flex-grow">
          {/* Personal Info */}
          <a href="/mobile/user/detail" className="flex items-center space-x-3 cursor-pointer border p-4 rounded-[6px]">
            <UserOutlined className="text-lg text-gray-500" />
            <span className="text-gray-700 sarabun-font flex-1">ข้อมูลส่วนตัว</span>
            <RightOutlined className="text-lg text-gray-500" />
          </a>

          {/* Settings Section */}
          <div className="mt-4 space-y-2">
            <div className="sarabun-font pt-2">การตั้งค่า</div>

            <a href="" className="flex items-center space-x-3 cursor-pointer border p-4 rounded-[6px]">
              <FileTextOutlined className="text-lg text-gray-500" />
              <span className="text-gray-700 sarabun-font flex-1">ข้อตกลงและเงื่อนไข</span>
              <RightOutlined className="text-lg text-gray-500" />
            </a>

            <a href="" className="flex items-center space-x-3 cursor-pointer border p-4 rounded-[6px]">
              <LockOutlined className="text-lg text-gray-500" />
              <span className="text-gray-700 sarabun-font flex-1">นโยบายความเป็นส่วนตัว</span>
              <RightOutlined className="text-lg text-gray-500" />
            </a>

            <a href="" className="flex items-center space-x-3 cursor-pointer border p-4 rounded-[6px]">
              <QuestionCircleOutlined className="text-lg text-gray-500" />
              <span className="text-gray-700 sarabun-font flex-1">คำถามที่พบบ่อย</span>
              <RightOutlined className="text-lg text-gray-500" />
            </a>

            <a href="" className="flex items-center space-x-3 cursor-pointer border p-4 rounded-[6px]">
              <PhoneOutlined className="text-lg text-gray-500" />
              <span className="text-gray-700 sarabun-font flex-1">ติดต่อเรา</span>
              <RightOutlined className="text-lg text-gray-500" />
            </a>

            <a href="" className="flex items-center space-x-3 cursor-pointer border p-4 rounded-[6px]">
              <LogoutOutlined className="text-lg text-red-500" />
              <span className="text-red-500 sarabun-font flex-1">ออกจากระบบ</span>
              <RightOutlined className="text-lg text-red-500" />
            </a>
          </div>
        </div>

        {/* Back Button - Stays at the Bottom */}
        <BackButton />
      </div>
    </MobileLayout>
  );
}
