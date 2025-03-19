import React, { useState } from "react";
import { Card, Button } from "antd";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import { EditOutlined } from "@ant-design/icons";
import BackButton from "../../../components/mobile/button/BackButton";

export default function UserDetail() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header Section */}
        <div className="w-full max-w-md py-4 flex justify-between items-center">
          <h2 className="text-[#009845] text-lg font-semibold sarabun-font">ข้อมูลผู้ใช้</h2>
        </div>

        {/* Profile Info Section */}
        <div className="w-full max-w-md mt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden shadow">
                <img
                  src="/img/icons/profile.png"
                  alt="Profile"
                  className="w-full h-full object-cover shadow"
                />
              </div>
            </div>
            <Button
              type="primary"
              className="bg-[#009845] rounded-lg sarabun-font flex items-center"
              onClick={() => navigate("/mobile/user/edit")} // เพิ่ม onClick เพื่อเปลี่ยนเส้นทาง
            >
              <EditOutlined className="mr-1" />
              <span className="sarabun-font">แก้ไขข้อมูล</span>
            </Button>

          </div>
        </div>

        {/* User Details Section */}
        <div className="w-full max-w-md mt-4">
          <Card className="rounded-xl shadow-md">
            <div className="space-y-4 text-gray-700">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 sarabun-font">ชื่อร้าน</span>
                <span className="sarabun-font">จุฬารักษ์ทันตะ</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 sarabun-font">ชื่อ-นามสกุล</span>
                <span className="sarabun-font">Krairoek Ruangkol</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 sarabun-font">วันเดือนปีเกิด</span>
                <span className="sarabun-font">01/01/2568</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 sarabun-font">เบอร์โทร</span>
                <span className="sarabun-font">02-9110653</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 sarabun-font">ไลน์ไอดี</span>
                <span>-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 sarabun-font">ที่อยู่</span>
                <span className="text-right sarabun-font">
                  54 ซ.วัชรพล ซ.5<br />รัตนโกสินทร์สมโภชกรุงเทพฯ<br />
                  เขตบางเขน กทม. 10150
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Back Button at Bottom */}
        <BackButton />
      </div>
    </MobileLayout>
  );
}
