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

    // setFormData({
    //   ...formData,
    //   line_id_token: lineProfile.userId,
    //   line_name: lineProfile.displayName,
    // });
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
              <label className="text-gray-600 font-medium sarabun-font">
                ชื่อร้าน<span className="text-red-500">*</span>
              </label>
              <Input
                className="mt-1 rounded-md h-10 sarabun-font"
                value={formData.shop_name}
                onChange={handleInputChange}
                name="shop_name"
                placeholder="ชื่อร้าน"
              />
            </div>

            {/* ชื่อ */}
            <div>
              <label className="text-gray-600 font-medium sarabun-font">
                ชื่อ<span className="text-red-500">*</span>
              </label>
              <Input
                className="mt-1 rounded-md h-10 sarabun-font"
                value={formData.first_name}
                onChange={handleInputChange}
                name="first_name"
                placeholder="ชื่อ"
              />
            </div>

            {/* นามสกุล */}
            <div>
              <label className="text-gray-600 font-medium sarabun-font">
                นามสกุล<span className="text-red-500">*</span>
              </label>
              <Input
                className="mt-1 rounded-md h-10 sarabun-font"
                value={formData.last_name}
                name="last_name"
                onChange={handleInputChange}
                placeholder="นามสกุล"
              />
            </div>

            {/* วันเดือนปีเกิด */}
            <div>
              <label className="text-gray-600 font-medium sarabun-font">
                วันเกิด<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mt-1">
                <Select
                  className="rounded-md flex-1 text-center h-10 sarabun-font"
                  placeholder="วัน"
                  value={formData.birth_date_day || ""}
                  onChange={(value) => handleDateChange("birth_date_day", value)}
                >
                  {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => (
                    <Option key={i + 1} value={i + 1} className="sarabun-font">
                      {i + 1}
                    </Option>
                  ))}
                </Select>

                <Select
                  className="rounded-md flex-1 text-center h-10 sarabun-font"
                  placeholder="เดือน"
                  value={formData.birth_date_month || ""}
                  onChange={(value) => handleDateChange("birth_date_month", value)}
                >
                  {[
                    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
                    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
                  ].map((m, i) => (
                    <Option key={i + 1} value={i + 1} className="sarabun-font">
                      {m}
                    </Option>
                  ))}
                </Select>

                <Input
                  className="rounded-md flex-1 text-center h-10 sarabun-font"
                  type="number"
                  placeholder="ปี"
                  value={formData.birth_date_year || ""}
                  onChange={(e) => handleDateChange("birth_date_year", e.target.value)}
                />
              </div>
            </div>

            {/* เบอร์โทรศัพท์มือถือ */}
            <div>
              <label className="text-gray-600 font-medium sarabun-font">
                เบอร์โทรศัพท์มือถือ<span className="text-red-500">*</span>
              </label>
              <Input
                className="mt-1 rounded-md h-10 sarabun-font"
                value={formData.phone_number}
                name="phone_number"
                onChange={handleInputChange}
                placeholder="เบอร์มือถือ"
              />
            </div>

            {/* ไลน์ไอดี */}
            <div>
              <label className="text-gray-600 font-medium sarabun-font">ไลน์ไอดี</label>
              <Input
                className="mt-1 rounded-md h-10 sarabun-font"
                value={formData.line_id}
                name="line_id"
                onChange={handleInputChange}
                placeholder="ระบุ"
              />
            </div>

            {/* ที่อยู่ */}
            <div>
              <label className="text-gray-600 font-medium sarabun-font">
                ที่อยู่<span className="text-red-500">*</span>
              </label>
              <Input.TextArea
                className="mt-1 rounded-md sarabun-font"
                rows={2}
                value={formData.address}
                name="address"
                onChange={handleInputChange}
                placeholder="ระบุที่อยู่"
              />
            </div>

            {/* จังหวัด / อำเภอ */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-gray-600 font-medium sarabun-font">
                  จังหวัด<span className="text-red-500">*</span>
                </label>
                <Select
                  className="w-full rounded-md h-10 sarabun-font"
                  value={formData.province}
                  onChange={(value) => handleDateChange("province", value)}
                  placeholder="เลือกจังหวัด"
                >
                  <Option value="จันทบุรี" className="sarabun-font">จันทบุรี</Option>
                </Select>
              </div>
              <div>
                <label className="text-gray-600 font-medium sarabun-font">
                  เขต/อำเภอ<span className="text-red-500">*</span>
                </label>
                <Select
                  className="w-full rounded-md h-10 sarabun-font"
                  value={formData.district}
                  onChange={(value) => handleDateChange("district", value)}
                  placeholder="เลือกอำเภอ"
                >
                  <Option value="มะขาม" className="sarabun-font">มะขาม</Option>
                </Select>
              </div>
            </div>

            {/* ตำบล / รหัสไปรษณีย์ */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-gray-600 font-medium sarabun-font">
                  แขวง/ตำบล<span className="text-red-500">*</span>
                </label>
                <Select
                  className="w-full rounded-md h-10 sarabun-font"
                  value={formData.sub_district}
                  onChange={(value) => handleDateChange("sub_district", value)}
                  placeholder="เลือกตำบล"
                >
                  <Option value="มะขาม" className="sarabun-font">มะขาม</Option>
                </Select>
              </div>
              <div>
                <label className="text-gray-600 font-medium sarabun-font">
                  รหัสไปรษณีย์<span className="text-red-500">*</span>
                </label>
                <Input
                  className="w-full rounded-md h-10 sarabun-font"
                  value={formData.zip_code}
                  name="zip_code"
                  onChange={handleInputChange}
                  placeholder="รหัสไปรษณีย์"
                />
              </div>
            </div>

            {/* Checkbox */}
            <div>
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
        onConfirm={() => {
          setIsSuccessModalVisible(false);
          navigate("/mobile/main"); // ไปหน้าใช้งาน
        }}
        src="/img/icons/check-circle.png"
        text={`<p class='text-[#8A8A8A] text-center sarabun-font'>ยินดีด้วย<br/>คุณลงทะเบียนสำเร็จ ได้รับ Welcome Point</p>
         <p class='text-[#009845] text-center text-[24px] font-bold sarabun-font'>100 Point</p>`}
        confirmText="เริ่มใช้งานกันเลย !"
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
