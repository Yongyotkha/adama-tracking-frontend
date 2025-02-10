import React, { useState } from "react";
import { Card, Button, Input, Select, Checkbox } from "antd";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import { EditOutlined } from "@ant-design/icons";
import BackButton from "../../../components/mobile/button/BackButton";
import ModalRegisterPopup from "../../../components/mobile/popup/ModalRegisterPopup";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";

const { Option } = Select;

export default function RegisterOA() {
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const navigate = useNavigate();

  const handleCheckboxClick = () => {
    setIsModalVisible(true);
  };

  const handleModalConfirm = () => {
    setIsChecked(true);
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2568);

  // Function to check if a year is a leap year
  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  // Function to determine the number of days in the selected month
  const getDaysInMonth = (month, year) => {
    const monthsWith31Days = ["January", "March", "May", "July", "August", "October", "December"];
    const monthsWith30Days = ["April", "June", "September", "November"];

    if (monthsWith31Days.includes(month)) return 31;
    if (monthsWith30Days.includes(month)) return 30;
    return isLeapYear(year) ? 29 : 28; // February logic
  };

  // Handle month change
  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    adjustDaySelection(month, selectedYear);
  };

  // Handle year change
  const handleYearChange = (e) => {
    const year = parseInt(e.target.value, 10);
    setSelectedYear(year);
    adjustDaySelection(selectedMonth, year);
  };

  // Adjust selected day if it exceeds the new month's max days
  const adjustDaySelection = (month, year) => {
    const maxDays = getDaysInMonth(month, year);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  };

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header Section */}
        <div className="w-full max-w-md py-4 flex justify-between items-center">
          <h2 className="text-[#009845] text-lg font-semibold sarabun-font">ลงทะเบียน</h2>
        </div>

        {/* Profile Info Section */}
        <div className="w-full max-w-md mt-4">
          <div className="flex justify-start items-center relative">
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
              <Input className="mt-1 sarabun-font text-[#A19793]" value="จุฬารักษ์ทันตะ" disabled />
            </div>

            {/* ชื่อ */}
            <div>
              <label className="text-gray-500 sarabun-font">ชื่อ<span className="text-red-500">*</span></label>
              <Input className="mt-1 sarabun-font text-[#A19793]" value="Krairoek" />
            </div>

            {/* นามสกุล */}
            <div>
              <label className="text-gray-500 sarabun-font">นามสกุล<span className="text-red-500">*</span></label>
              <Input className="mt-1 sarabun-font text-[#A19793]" value="Ruangkol" />
            </div>

            {/* วันเดือนปีเกิด */}
            <div>
              <label className="text-gray-500 sarabun-font">วันเดือนปีเกิด</label>
              <div className="flex gap-2">
                {/* Day Select */}
                <Select
                  className="sarabun-font flex-1 text-center"
                  value={selectedDay}
                  onChange={(value) => setSelectedDay(value)}
                >
                  {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => (
                    <Option key={i + 1} className="sarabun-font" value={i + 1}>
                      {i + 1}
                    </Option>
                  ))}
                </Select>

                {/* Month Select */}
                <Select
                  className="sarabun-font flex-1 text-center"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                >
                  <Option className="sarabun-font" value="January">January</Option>
                  <Option className="sarabun-font" value="February">February</Option>
                  <Option className="sarabun-font" value="March">March</Option>
                  <Option className="sarabun-font" value="April">April</Option>
                  <Option className="sarabun-font" value="May">May</Option>
                  <Option className="sarabun-font" value="June">June</Option>
                  <Option className="sarabun-font" value="July">July</Option>
                  <Option className="sarabun-font" value="August">August</Option>
                  <Option className="sarabun-font" value="September">September</Option>
                  <Option className="sarabun-font" value="October">October</Option>
                  <Option className="sarabun-font" value="November">November</Option>
                  <Option className="sarabun-font" value="December">December</Option>
                </Select>

                {/* Year Input */}
                <Input
                  className="sarabun-font flex-1 text-center"
                  type="number"
                  value={selectedYear}
                  onChange={handleYearChange}
                />
              </div>
            </div>


            {/* เบอร์โทร */}
            <div>
              <label className="text-gray-500 sarabun-font">เบอร์โทร<span className="text-red-500">*</span></label>
              <Input className="mt-1 sarabun-font text-[#A19793]" value="02-9110653" />
            </div>

            {/* ไลน์ไอดี */}
            <div>
              <label className="text-gray-500 sarabun-font">ไลน์ไอดี</label>
              <Input className="mt-1 sarabun-font text-[#A19793]" value="-" />
            </div>

            {/* ที่อยู่ */}
            <div>
              <label className="text-gray-500 sarabun-font">ที่อยู่</label>
              <Input.TextArea
                className="mt-1 sarabun-font text-[#A19793]"
                rows={2}
                value="54 ซ.วัชรพล ซ.5 รัตนโกสินทร์สมโภชกรุงเทพฯ เขตบางเขน กทม. 10150"
              />
            </div>

            {/* Terms & Conditions */}
            <div className="mt-4">
              <Checkbox
                className={`sarabun-font ${isChecked ? "text-[#00783F]" : "text-[#A19793]"}`}
                checked={isChecked}
                onClick={handleCheckboxClick}
              >
                <span className="sarabun-font">ตกลงยินยอมตามรายละเอียดข้อตกลงและเงื่อนไข</span>
              </Checkbox>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md flex justify-between align-bottom mt-auto space-x-2">

          <BackButton />

          <div className="w-full max-w-md mt-auto py-2">
            <button
              onClick={() => setIsSuccessModalVisible(true)}
              className="w-full py-3 bg-[#009845] rounded-lg text-white sarabun-font flex items-center justify-center space-x-2"
            >
              <span className="sarabun-font">ลงทะเบียน</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal RegisterPopup */}
      <ModalRegisterPopup visible={isModalVisible} onConfirm={handleModalConfirm} onCancel={handleModalCancel} />
      {/* Success DynamicPopUp */}
      <DynamicPopUp
        visible={isSuccessModalVisible}
        onConfirm={() => setIsSuccessModalVisible(false)}
        src="/logo/Logo-Adama-Smile-2-New 1.png" // Replace with actual image path
        text="<p class='text-[#978B87] text-center sarabun-font'>คุณได้ลงทะเบียนเรียบร้อยแล้ว</p>"
        confirmText="ตกลง"
      />
    </MobileLayout>
  );
}
