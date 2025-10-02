import React, { useEffect, useState } from "react";
import { Card, Button, Input, Select, Checkbox, Spin } from "antd";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate, useLocation } from "react-router-dom";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import BackButton from "../../../components/mobile/button/BackButton";
import ModalRegisterPopup from "../../../components/mobile/popup/ModalRegisterPopup";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import DynamicPopUpConfirm from "../../../components/mobile/popup/DynamicPopUpConfirm";
const { Option } = Select;

export default function EditUserOA() {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.user || {};
  const [isPointModalVisibleComfirm, setIsPointModalVisibleComfirm] = useState(false);

  const [imagePreview, setImagePreview] = useState(userData.profile_image || "/img/icons/profile.png");
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isFailModalVisible, setIsFailModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    id: location.state.id,
    shop_name: userData.shop_name || "",
    first_name: userData.contact_first_name || "",
    last_name: userData.contact_last_name || "",
    phone_number: userData.phone_number || "",
    line_id: userData.line_id || "",
    address: userData.address || "",
    email: userData.email || "",
    birth_date_day: "",
    birth_date_month: "",
    birth_date_year: "",
  });

  console.log('formData : ', userData)

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      birth_date_day: userData.contact_birth_date_day || "",
      birth_date_month: userData.contact_birth_date_month || "",
      birth_date_year: userData.contact_birth_date_year || "",
    }));
  }, [userData]);




  useEffect(() => {
    if (imagePreview && imagePreview !== userData.profile_image) {
      const updateProfileImage = async () => {
        try {
          const response = await useServiceAPI.put(paths.pathProfileImage, {
            profile_image: imagePreview,
            id: location.state.id, // ส่ง ID ผู้ใช้ไปด้วย
          });

          if (response.status === 200) {
            console.log("Profile image updated successfully:", response.data);
          }
        } catch (error) {
          console.error("Error updating profile image:", error);
        }
      };

      updateProfileImage();
    }
  }, [imagePreview, userData.profile_image, userData.id]);


  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setImagePreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "profile");

    try {
      const response = await useServiceAPI.post(paths.pathUpload, formData, setLoading);
      setImagePreview(response.data.file_url);
    } catch (error) {
      console.error("Error uploading form data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  const before_save = () => {
    setIsPointModalVisibleComfirm(true)
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await useServiceAPI.put(paths.pathProfileDetail, formData);
      if (response.status === 200 && response.result) {
        setIsSuccessModalVisible(true);
        navigate("/mobile/user/detail", { state: { id: userData.id } });
      } else {
        setIsFailModalVisible(true);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setIsFailModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        <div className="w-full max-w-md py-4 flex justify-between items-center">
          <h2 className="text-[#009845] text-lg font-semibold sarabun-font">แก้ไขข้อมูลสมาชิก</h2>
        </div>

        {/* Profile Image */}
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
              icon={<EditOutlined />}
              onClick={() => document.getElementById("imageUpload").click()}
              className="text-white absolute bottom-0 bg-[#009845] ms-[65px] rounded-full"
            ></Button>
          </div>
        </div>

        {/* User Details Form */}
        <div className="w-full max-w-md mt-4">
          <form className="space-y-4 sarabun-font">
            <div>
              <label className="text-gray-500 sarabun-font">ชื่อร้าน</label>
              <Input
                className="mt-1 sarabun-font text-[#A19793]"
                value={formData.shop_name}
                onChange={handleInputChange}
                name="shop_name"
                disabled={!!userData.shop_name}
              />
            </div>

            <div>
              <label className="text-gray-500 sarabun-font">ชื่อ</label>
              <Input className="mt-1 sarabun-font text-[#A19793]" value={formData.first_name} name="first_name" onChange={handleInputChange} />
            </div>

            <div>
              <label className="text-gray-500 sarabun-font">นามสกุล</label>
              <Input className="mt-1 sarabun-font text-[#A19793]" value={formData.last_name} name="last_name" onChange={handleInputChange} />
            </div>

            <div>
              <label className="text-gray-500 sarabun-font">เบอร์โทรศัพท์</label>
              <Input className="mt-1 sarabun-font text-[#A19793]" value={formData.phone_number} name="phone_number" disabled/>
            </div>

            <div>
              <label className="text-gray-500 sarabun-font">ไลน์ไอดี</label>
              <Input className="mt-1 sarabun-font text-[#A19793]" value={formData.line_id} name="line_id" onChange={handleInputChange} />
            </div>

            <div>
              <label className="text-gray-500 sarabun-font">ที่อยู่</label>
              <Input.TextArea className="mt-1 sarabun-font text-[#A19793]" rows={2} value={formData.address} name="address" onChange={handleInputChange} />
            </div>

            {/* Terms & Conditions */}
            {/* <div className="mt-4">
              <Checkbox
                className={`sarabun-font ${isChecked ? "text-[#00783F]" : "text-[#A19793]"}`}
                checked={isChecked}
                onClick={handleCheckboxClick}
              >
                <span className="sarabun-font">ตกลงยินยอมตามรายละเอียดข้อตกลงและเงื่อนไข</span>
              </Checkbox>
            </div> */}
          </form>
        </div>

        <div className="w-full max-w-md flex justify-between align-bottom mt-auto space-x-2">
          <BackButton />
          <div className="w-full max-w-md mt-auto py-2">
            <button onClick={before_save} className="w-full py-3 bg-[#009845] rounded-lg text-white sarabun-font flex items-center justify-center space-x-2">
              <span className="sarabun-font">บันทึก</span>
            </button>
          </div>
        </div>

        <DynamicPopUpConfirm
          visible={isPointModalVisibleComfirm}
          onConfirm={async () => {
            await handleSave();          // ← เรียกใช้จริง
            setIsPointModalVisibleComfirm(false); // ปิดหลังยิง API สำเร็จ/ล้มเหลวก็ได้
          }}
          onCancel={() => {
            // กดปุ่ม "ยกเลิก"
            setIsPointModalVisibleComfirm(false);
          }}
          src="/img/icons/forgot-password.png"
          text={`<div class='text-center'>
      <p class='text-green-700 text-[24px] font-bold mt-1 sarabun-font'>ยืนยันการทำรายการ</p>
    </div>`}
          confirmText="ยืนยัน"
          cancelText="ยกเลิก"
        />

        <ModalRegisterPopup visible={isModalVisible} onConfirm={handleModalConfirm} onCancel={handleModalCancel} />
      </div>
    </MobileLayout>
  );
}
