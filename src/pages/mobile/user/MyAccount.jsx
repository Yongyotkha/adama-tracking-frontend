import React, { useState } from "react";
import { Card } from "antd";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";

export default function MobileAccount() {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center">
        <div className="w-full p-6">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
            <h2 className="text-lg font-semibold mt-2">คุณ Krairoek Ruangkol</h2>
            <p className="text-gray-500">รหัสสมาชิก : 123455</p>
            <p className="text-gray-500">คะแนนหมดอายุ : 15 คะแนน | 31 ธ.ค.67</p>
          </div>
          <div className="mt-6">
            <h3 className="text-gray-700 font-semibold">ข้อมูลส่วนตัว</h3>
            <div className="border rounded-lg p-4 mt-2">
              <p className="text-gray-600">ข้อมูลส่วนตัว</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-gray-700 font-semibold">การตั้งค่า</h3>
            <div className="border rounded-lg p-4 mt-2 space-y-2">
              <p className="text-gray-600">ข้อตกลงและเงื่อนไข</p>
              <p className="text-gray-600">นโยบายความเป็นส่วนตัว</p>
              <p className="text-gray-600">คำถามที่พบบ่อย</p>
              <p className="text-gray-600">ติดต่อเรา</p>
              <p className="text-gray-600 text-red-500">ออกจากระบบ</p>
            </div>
          </div>
          <div className="mt-6">
            <button className="w-full py-2 bg-gray-300 rounded-lg text-gray-700">
              ย้อนกลับ
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
