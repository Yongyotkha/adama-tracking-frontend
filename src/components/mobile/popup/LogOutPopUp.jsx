import React from "react";
import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";

export default function LogOutPopUp({ isOpen, onCancel }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // ลบ Token หรือข้อมูลผู้ใช้
    localStorage.removeItem("authToken"); // ถ้ามีการใช้ Token
    sessionStorage.removeItem("authSession"); // ถ้ามีการใช้ Session

    // ไปที่หน้า Login
    navigate("/mobile/verify");
  };

  return (
    <Modal open={isOpen} footer={null} centered closable={false}>
      <div className="flex flex-col justify-between items-center min-h-[250px]">
        {/* Placeholder for Image */}
        <div className="w-24 h-24 bg-gray-300 rounded-lg mb-4"></div>

        {/* Confirmation Text */}
        <div className="text-[#978B87] text-sm text-center mb-4 sarabun-font">
          คุณต้องการออกจากระบบใช่หรือไม่ ?
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          <Button
            onClick={onCancel}
            className="w-1/2 bg-[#E5E5E5] text-[#7D7D7D] py-3 rounded-md"
          >
            <span className="sarabun-font">ยกเลิก</span>
          </Button>
          <Button
            onClick={handleLogout}
            className="w-1/2 bg-[#009845] text-white py-3 rounded-md"
          >
            <span className="sarabun-font">ยืนยัน</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
