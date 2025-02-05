import React, { useState } from "react";
import { Card, Button, Input, Select, Checkbox } from "antd";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import { EditOutlined } from "@ant-design/icons";
import BackButton from "../../../components/mobile/button/BackButton";

const { Option } = Select;

export default function RegisterOA() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header Section */}
        <div className="w-full max-w-md py-4 flex justify-between items-center">
          <h2 className="text-[#009845] text-lg font-semibold sarabun-font">ลงทะเบียน</h2>
        </div>

        {/* Profile Info Section */}
        <div className="w-full max-w-md mt-4">
          <div className="flex justify-center items-center relative">
            <div className="w-20 h-20 bg-gray-300 rounded-full overflow-hidden shadow">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsynwv-5qtogtOwJbIjaPFJUmHpzhxgqIAug&s"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              className="absolute bottom-0 bg-[#009845] ms-12"
            />
          </div>
        </div>

        {/* User Details Form */}
        <div className="w-full max-w-md mt-4">
          <form className="space-y-4 sarabun-font">
            {/* ชื่อร้าน */}
            <div>
              <label className="text-gray-500 sarabun-font">ชื่อร้าน</label>
              <Input className="mt-1 sarabun-font" value="จุฬารักษ์ทันตะ" disabled />
            </div>

            {/* ชื่อ */}
            <div>
              <label className="text-gray-500 sarabun-font">ชื่อ<span className="text-red-500">*</span></label>
              <Input className="mt-1 sarabun-font" value="Krairoek" />
            </div>

            {/* นามสกุล */}
            <div>
              <label className="text-gray-500 sarabun-font">นามสกุล<span className="text-red-500">*</span></label>
              <Input className="mt-1 sarabun-font" value="Ruangkol" />
            </div>

            {/* วันเดือนปีเกิด */}
            <div>
              <label className="text-gray-500 sarabun-font">วันเดือนปีเกิด</label>
              <div className="flex space-x-2">
                <Input className="w-16 sarabun-font" value="1" />
                <Select className="w-32 sarabun-font" defaultValue="January">
                  <Option className="sarabun-font" value="January">January</Option>
                  <Option className="sarabun-font" value="February">February</Option>
                  <Option className="sarabun-font" value="March">March</Option>
                </Select>
                <Input className="w-20 sarabun-font" value="2568" />
              </div>
            </div>

            {/* เบอร์โทร */}
            <div>
              <label className="text-gray-500 sarabun-font">เบอร์โทร<span className="text-red-500">*</span></label>
              <Input className="mt-1 sarabun-font" value="02-9110653" />
            </div>

            {/* ไลน์ไอดี */}
            <div>
              <label className="text-gray-500 sarabun-font">ไลน์ไอดี</label>
              <Input className="mt-1 sarabun-font" value="-" />
            </div>

            {/* ที่อยู่ */}
            <div>
              <label className="text-gray-500 sarabun-font">ที่อยู่</label>
              <Input.TextArea
                className="mt-1 sarabun-font"
                rows={2}
                value="54 ซ.วัชรพล ซ.5 รัตนโกสินทร์สมโภชกรุงเทพฯ เขตบางเขน กทม. 10150"
              />
            </div>

            {/* Terms & Conditions */}
            <div className="mt-4">
              <Checkbox className="sarabun-font text-gray-700">
                <span className="sarabun-font">ตกลงยินยอมตามรายละเอียดข้อตกลงและเงื่อนไข</span>
              </Checkbox>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md flex justify-between align-bottom mt-auto space-x-2">

          <BackButton className="w-full bg-gray-300 sarabun-font" />
          
          <div className="w-full max-w-md mt-auto py-3">
            <button
              onClick={{}}
              className="w-full py-3 bg-[#009845] rounded-lg text-white sarabun-font flex items-center justify-center space-x-2"
            >
              <span className="sarabun-font">ลงทะเบียน</span>
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
