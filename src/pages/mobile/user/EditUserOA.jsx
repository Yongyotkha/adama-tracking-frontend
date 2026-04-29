import React, { useEffect, useRef, useState } from "react";
import { Button, Input, DatePicker } from "antd";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate, useLocation } from "react-router-dom";
import { EditOutlined } from "@ant-design/icons";
import BackButton from "../../../components/mobile/button/BackButton";
import ModalRegisterPopup from "../../../components/mobile/popup/ModalRegisterPopup";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import DynamicPopUpConfirm from "../../../components/mobile/popup/DynamicPopUpConfirm";
import dayjs from "dayjs";

export default function EditUserOA() {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.user || {};
  const fileInputRef = useRef(null);

  const [isPointModalVisibleComfirm, setIsPointModalVisibleComfirm] = useState(false);

  const [imagePreview, setImagePreview] = useState(
    userData.profile_image || "/img/icons/profile.png"
  );
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isFailModalVisible, setIsFailModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    id: location.state?.id || userData.id || "",
    shop_name: userData.shop_name || "",
    first_name: userData.contact_first_name || "",
    last_name: userData.contact_last_name || "",
    phone_number: userData.phone_number || "",
    line_id: userData.line_id || "",
    address: userData.address || "",
    email: userData.email || "",
    name_th: userData.name_th || "",
    contact_birth_date_year: userData.contact_birth_date_year || "",
    profile_image: userData.profile_image || "",
  });

  useEffect(() => {
    setFormData({
      id: location.state?.id || userData.id || "",
      shop_name: userData.shop_name || "",
      first_name: userData.contact_first_name || "",
      last_name: userData.contact_last_name || "",
      phone_number: userData.phone_number || "",
      line_id: userData.line_id || "",
      address: userData.address || "",
      email: userData.email || "",
      name_th: userData.name_th || "",
      contact_birth_date_year: userData.contact_birth_date_year || "",
      profile_image: userData.profile_image || "",
    });

    setImagePreview(userData.profile_image || "/img/icons/profile.png");
  }, [userData, location.state]);

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("mode", "profile");

    try {
      setLoading(true);

      const response = await useServiceAPI.post(paths.pathUpload, uploadFormData);

      const fileUrl =
        response?.data?.file_url ||
        response?.file_url ||
        response?.data?.data?.file_url ||
        "";

      if (fileUrl) {
        setImagePreview(fileUrl);
        setFormData((prev) => ({
          ...prev,
          profile_image: fileUrl,
        }));
      } else {
        setIsFailModalVisible(true);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsFailModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    setIsPointModalVisibleComfirm(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (formData.profile_image) {
        await useServiceAPI.put(paths.pathProfileImage, {
          id: formData.id,
          profile_image: formData.profile_image,
        });
      }

      const payload = {
        id: formData.id,
        name_th: formData.name_th || "",
        address: formData.address || "",
        line_id: formData.line_id || "",
        contact_birth_date_year: formData.contact_birth_date_year || "",
        profile_image: formData.profile_image || "",
      };

      const response = await useServiceAPI.put(paths.pathProfileDetail, payload);

      if (response?.status === 200 && response?.result) {
        setIsSuccessModalVisible(true);
        navigate(-1);
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
          <h2 className="text-[#009845] text-lg font-semibold sarabun-font">
            แก้ไขข้อมูลสมาชิก
          </h2>
        </div>

        <div className="w-full max-w-md mt-4">
          <div className="flex justify-start items-center relative">
            <img
              src={imagePreview}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mb-2 shadow-lg"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            <Button
              icon={<EditOutlined />}
              onClick={handleOpenFilePicker}
              className="text-white absolute bottom-0 bg-[#009845] ms-[65px] rounded-full"
            />
          </div>
        </div>

        <div className="w-full max-w-md mt-4">
          <form className="space-y-4 sarabun-font">
            <div>
              <label className="text-gray-500 sarabun-font">ชื่อร้าน</label>
              <Input
                className="mt-1 sarabun-font text-[#A19793]"
                value={formData.shop_name}
                onChange={handleInputChange}
                name="shop_name"
                disabled
              />
            </div>

            <div>
              <label className="text-gray-500 sarabun-font">ชื่อ - นามสกุล</label>
              <Input
                className="mt-1 sarabun-font text-[#A19793]"
                value={formData.name_th}
                name="name_th"
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="text-gray-500 sarabun-font">เบอร์โทรศัพท์</label>
              <Input
                className="mt-1 sarabun-font text-[#A19793]"
                value={formData.phone_number}
                name="phone_number"
                disabled
              />
            </div>

            <div>
              <label className="text-gray-500 sarabun-font">วันเกิด</label>
              <DatePicker
                value={
                  formData.contact_birth_date_year
                    ? dayjs(formData.contact_birth_date_year, "YYYY-MM-DD")
                    : null
                }
                format="DD/MM/YYYY"
                className="mt-1 rounded-md h-10 sarabun-font w-full"
                onChange={(date) => {
                  setFormData((prev) => ({
                    ...prev,
                    contact_birth_date_year: date
                      ? dayjs(date).format("YYYY-MM-DD")
                      : "",
                  }));
                }}
              />
            </div>

            <div>
              <label className="text-gray-500 sarabun-font">ไลน์ไอดี</label>
              <Input
                className="mt-1 sarabun-font text-[#A19793]"
                value={formData.line_id}
                name="line_id"
                onChange={handleInputChange}
              />
            </div>

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
          </form>
        </div>

        <div className="w-full max-w-md flex justify-between align-bottom mt-auto space-x-2">
          {/* <BackButton /> */}
          <BackButton url={'/mobile/account'} type={'account'} />

          <div className="w-full max-w-md mt-auto py-2">
            <button
              type="button"
              onClick={before_save}
              className="w-full py-3 bg-[#009845] rounded-lg text-white sarabun-font flex items-center justify-center space-x-2"
            >
              <span className="sarabun-font">บันทึก</span>
            </button>
          </div>
        </div>

        <DynamicPopUpConfirm
          visible={isPointModalVisibleComfirm}
          onConfirm={async () => {
            setIsPointModalVisibleComfirm(false);
            await handleSave();
          }}
          onCancel={() => {
            setIsPointModalVisibleComfirm(false);
          }}
          src="/img/icons/warning-yellow.png"
          text={`<div class='text-center'>
                  <p class='text-green-700 text-[24px] font-bold mt-1 sarabun-font'>ยืนยันการทำรายการ</p>
                </div>`}
          confirmText="ยืนยัน"
          cancelText="ยกเลิก"
        />

        <ModalRegisterPopup
          visible={isModalVisible}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      </div>
    </MobileLayout>
  );
}