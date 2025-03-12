import React, { useState } from "react";
import { Modal, Button } from "antd";
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
  HomeOutlined,
} from "@ant-design/icons";
import BackButton from "../../../components/mobile/button/BackButton";
import MainButton from "../../../components/mobile/button/MainButton";
import LogOutPopUp from "../../../components/mobile/popup/LogOutPopUp";
import liff from "@line/liff";

export default function MyAccount() {
  const [loading, setLoading] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLogoutModalOpen(true); // Open the modal
  };

  const confirmLogout = async () => {
    setIsLogoutModalOpen(false);
  
    try {
      if (liff.isLoggedIn()) {
        await liff.logout(); // ออกจาก LIFF
        console.log("User logged out from LIFF");
      }
    } catch (error) {
      console.error("LIFF Logout Error:", error);
    }
  
    // ลบ Token หรือข้อมูลผู้ใช้ใน LocalStorage
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authSession");
  
    // Redirect ไปหน้า Login
    navigate("/mobile/login");
  };

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header Section */}
        <div className="w-full rounded-b-[40px] flex items-center relative gap-2 max-w-md">
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

          <div className="mt-4 space-y-2">
            {/* Personal Info */}
            <MainButton
              type="link"
              to="/mobile/main"
              icon={<HomeOutlined className="text-lg text-gray-500" />}
              label="หน้าหลัก"
            />
            <MainButton
              type="link"
              to="/mobile/user/detail"
              icon={<UserOutlined className="text-lg text-gray-500" />}
              label="ข้อมูลส่วนตัว"
            />

            {/* Settings Section */}
            <div className="sarabun-font pt-2">การตั้งค่า</div>
            <MainButton type="link" to="/mobile/terms-conditions" icon={<FileTextOutlined className="text-lg text-gray-500" />} label="ข้อตกลงและเงื่อนไข" />
            <MainButton type="link" to="/mobile/privacy-policy" icon={<LockOutlined className="text-lg text-gray-500" />} label="นโยบายความเป็นส่วนตัว" />
            <MainButton type="link" to="/mobile/faq" icon={<QuestionCircleOutlined className="text-lg text-gray-500" />} label="คำถามที่พบบ่อย" />
            <MainButton type="link" to="/mobile/contact-us" icon={<PhoneOutlined className="text-lg text-gray-500" />} label="ติดต่อเรา" />

            {/* Logout Button */}
            <MainButton
              type="button"
              icon={<LogoutOutlined className="text-lg text-red-500" />}
              label="ออกจากระบบ"
              onClick={handleLogout}
              className="text-red-500"
            />
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        <LogOutPopUp
          isOpen={isLogoutModalOpen}
          onCancel={() => setIsLogoutModalOpen(false)}
          onConfirm={confirmLogout}
        />

        {/* Back Button */}
        <BackButton />
      </div>
    </MobileLayout>
  );
}
