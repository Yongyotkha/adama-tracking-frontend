import React, { useEffect, useState } from "react";
import { Card, Button, Input, Select, Checkbox } from "antd";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import BackButton from "../../../components/mobile/button/BackButton";
import ModalRegisterPopup from "../../../components/mobile/popup/ModalRegisterPopup";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

const { Option } = Select;

export default function RegisterOA() {
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isFailModalVisible, setIsFailModalVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { lineProfile } = useOutletContext() || {};
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    console.log("lineProfile", lineProfile);

    setFormData({
      ...formData,
      line_id_token: lineProfile.userId,
      line_name: lineProfile.displayName,
    });
  }, [lineProfile]);

  // const [formData, setFormData] = useState(location.state || {});
  const [formData, setFormData] = useState(location.state || {
    shop_name: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    line_id: "",
    address: "",
    email: "",
    shop_code: "",
    birth_date_day: "",
    birth_date_month: "",
    birth_date_year: "",
    shop_type: "",
  });

  console.log("formData", formData);

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
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  // Function to determine the number of days in the selected month
  const getDaysInMonth = (month, year) => {
    const monthsWith31Days = [
      "January",
      "March",
      "May",
      "July",
      "August",
      "October",
      "December",
    ];
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



  const handleRegister = () => {

    if (!isChecked) return;

    const formattedData = {
      shop_name: formData.shop_name,
      shop_code: formData.shop_code,
      phone_number: formData.phone_number,
      first_name: formData.first_name, // ต้องแก้
      last_name: formData.last_name, // ต้องแก้
      birth_date_day: formData.birth_date_day,
      birth_date_month: formData.birth_date_month,
      birth_date_year: formData.birth_date_year,
      line_id: formData.line_id,
      address: formData.address,
      email: formData.email,
      is_condition: isChecked,
      shop_type: formData.shop_type,
      image_url: imagePreview,
      line_id_token: formData.line_id_token,
      line_name: formData.line_name,
    };
    setLoading(true);
    useServiceAPI
      .post(paths.pathRegisterShop, formattedData)
      .then((response) => {
        if (response.status === 200) {
          localStorage.setItem("redirectPath", "/mobile/main");
          setIsSuccessModalVisible(true);
          navigate("/mobile/main", { state: formattedData });
        }
      })
      .catch((error) => {
        setIsFailModalVisible(true);
        console.error("API Error:", error);
      })
      .finally(() => setLoading(false));
  };

  const [imagePreview, setImagePreview] = useState("/img/icons/profile.png");

  // const handleImageChange = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     console.log(reader);

  //     reader.onload = (e) => {
  //       setImagePreview(e.target.result);
  //       console.log(e.target.result);

  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setImagePreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "profile");
    try {
      const response = await useServiceAPI.post(
        paths.pathUpload,
        formData,
        setLoading
      );
      setImagePreview(response.data.file_url);
    } catch (error) {
      console.error("Error uploading form data:", error);
      showMsg("error", "เกิดข้อผิดพลาด");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(name,);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };



  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header Section */}
        <div className="w-full max-w-md py-4 flex justify-between items-center">
          <h2 className="text-[#009845] text-lg font-semibold sarabun-font">
            ลงทะเบียน
          </h2>
        </div>

        {/* Profile Info Section */}
        <div className="w-full max-w-md mt-4">
          <div className="flex justify-start items-center relative">
            <img
              src={imagePreview}
              alt="Profile"
              onClick={() => document.getElementById("imageUpload").click()}
              className="w-24 h-24 rounded-full object-cover mb-2 cursor-pointer shadow-lg"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
              id="imageUpload"
            />
            <Button
              icon={
                imagePreview !== "/img/icons/profile.png" ? (
                  <EditOutlined />
                ) : (
                  <PlusOutlined />
                )
              }
              onClick={() => document.getElementById("imageUpload").click()}
              className="text-white absolute bottom-0 bg-[#009845] ms-[65px] rounded-full"
            ></Button>
          </div>
        </div>
        {/* User Details Form */}
        <div className="w-full max-w-md mt-4">
          <form className="space-y-4 sarabun-font">
            {/* ชื่อร้าน */}
            <div>
              <label className="text-gray-500 sarabun-font">ชื่อร้าน</label>
              <Input
                className="mt-1 sarabun-font text-[#A19793]"
                value={formData.shop_name}
                onChange={handleInputChange}
                name="shop_name"
              />
            </div>

            {/* รหัสร้าน */}
            <div>
              <label className="text-gray-500 sarabun-font">รหัสร้าน</label>
              <Input
                className="mt-1 sarabun-font text-[#A19793]"
                value={formData.shop_code}
                onChange={handleInputChange}
                name="shop_code"
              />
            </div>

            {/* ชื่อ */}
            <div>
              <label className="text-gray-500 sarabun-font">ชื่อ<span className="text-red-500">*</span></label>
              <Input
                className="mt-1 sarabun-font text-[#A19793]"
                value={formData.first_name}
                onChange={handleInputChange}
                name="first_name"
              />
            </div>

            {/* นามสกุล */}
            <div>
              <label className="text-gray-500 sarabun-font">นามสกุล<span className="text-red-500">*</span></label>
              <Input
                className="mt-1 sarabun-font text-[#A19793]"
                value={formData.last_name}
                name="last_name"
                onChange={handleInputChange}

              />
            </div>

            {/* วันเดือนปีเกิด */}
            <div>
              <label className="text-gray-500 sarabun-font">วันเดือนปีเกิด</label>
              <div className="flex gap-2">
                {/* Day Select */}
                <Select
                  className="sarabun-font flex-1 text-center"
                  value={formData.birth_date_day || ""}
                  onChange={(value) => handleDateChange("birth_date_day", value)}
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
                  value={formData.birth_date_month || ""}
                  onChange={(value) => handleDateChange("birth_date_month", value)}
                >
                  <Option className="sarabun-font" value="1">January</Option>
                  <Option className="sarabun-font" value="2">February</Option>
                  <Option className="sarabun-font" value="3">March</Option>
                  <Option className="sarabun-font" value="4">April</Option>
                  <Option className="sarabun-font" value="5">May</Option>
                  <Option className="sarabun-font" value="6">June</Option>
                  <Option className="sarabun-font" value="7">July</Option>
                  <Option className="sarabun-font" value="8">August</Option>
                  <Option className="sarabun-font" value="9">September</Option>
                  <Option className="sarabun-font" value="10">October</Option>
                  <Option className="sarabun-font" value="11">November</Option>
                  <Option className="sarabun-font" value="12">December</Option>
                </Select>

                {/* Year Input */}
                <Input
                  className="sarabun-font flex-1 text-center"
                  type="number"
                  value={formData.birth_date_year || ""}
                  onChange={(e) => handleDateChange("birth_date_year", e.target.value)}
                />
              </div>
            </div>

            {/* เบอร์โทร */}
            <div>
              <label className="text-gray-500 sarabun-font">เบอร์โทร<span className="text-red-500">*</span></label>
              <Input
                className="mt-1 sarabun-font text-[#A19793]"
                value={formData.phone_number}
                name="phone_number"
                onChange={handleInputChange}
              />
            </div>

            {/* อีเมล */}
            <div>
              <label className="text-gray-500 sarabun-font">อีเมล</label>
              <Input
                className="mt-1 sarabun-font text-[#A19793]"
                value={formData.email}
                name="email"
                onChange={handleInputChange}
              />
            </div>

            {/* ไลน์ไอดี */}
            <div>
              <label className="text-gray-500 sarabun-font">ไลน์ไอดี</label>
              <Input
                className="mt-1 sarabun-font text-[#A19793]"
                value={formData.line_id}
                name="line_id"
                onChange={handleInputChange}

              />
            </div>

            {/* ที่อยู่ */}
            <div>
              <label className="text-gray-500 sarabun-font">ที่อยู่</label>
              <Input.TextArea
                className="mt-1 sarabun-font text-[#A19793]"
                rows={2}
                value={formData.address}
                name="address"
                onChange={handleInputChange}
              />
            </div>

            {/* ประเภทของร้านค้า */}
            <div>
              <label className="text-gray-500 sarabun-font">ประเภทของร้านค้า</label>
              <Select
                className="mt-1 sarabun-font text-[#A19793] w-full"
                value={formData.shop_type || ""}
                onChange={(value) => handleDateChange("shop_type", value)}
              >
                <Option value="sub_dealer">Sub Dealer</Option>
                <Option value="retail">Retail</Option>
                <Option value="wholesale">Wholesale</Option>
              </Select>
            </div>

            {/* Terms & Conditions */}
            <div className="mt-4">
              <Checkbox
                className={`sarabun-font ${isChecked ? "text-[#00783F]" : "text-[#A19793]"}`}
                checked={isChecked}
                onClick={handleCheckboxClick}
              >
                <span className="sarabun-font">
                  ตกลงยินยอมตามรายละเอียดข้อตกลงและเงื่อนไข
                </span>
              </Checkbox>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md flex justify-between align-bottom mt-auto space-x-2">
          <BackButton url="/mobile/login" />

          <div className="w-full max-w-md mt-auto py-2">
            <button
              // onClick={() => setIsSuccessModalVisible(true)}
              onClick={handleRegister}
              disabled={!isChecked}
              className="w-full py-3 bg-[#009845] rounded-lg text-white sarabun-font flex items-center justify-center space-x-2"
            >
              <span className="sarabun-font">ลงทะเบียน</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal RegisterPopup */}
      <ModalRegisterPopup
        visible={isModalVisible}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
      {/* Success DynamicPopUp */}
      <DynamicPopUp
        visible={isSuccessModalVisible}
        onConfirm={() => setIsSuccessModalVisible(false)}
        src="/logo/Logo-Adama-Smile-2-New 1.png"
        text={`<p class='text-[#978B87] text-center sarabun-font'>คุณได้ลงทะเบียนเรียบร้อยแล้ว</p>
         <p class='text-[#009845] text-center sarabun-font font-semibold'>${formData.registrationCode || ""}</p>`}
        confirmText="ตกลง"
      />

      <DynamicPopUp
        visible={isFailModalVisible}
        onConfirm={() => setIsFailModalVisible(false)}
        src="/logo/Logo-Adama-Smile-2-New 1.png" // Replace with actual image path
        text="<p class='text-[#978B87] text-center sarabun-font'>ไม่สารมารถลงทะเบียนได้กรุณาตรวจสอบข้อมูล</p>"
        confirmText="ตกลง"
      />
    </MobileLayout>
  );
}
