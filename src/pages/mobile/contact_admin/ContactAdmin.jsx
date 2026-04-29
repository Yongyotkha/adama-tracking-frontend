import React, {useContext, useEffect, useState } from "react";
import { Form, Input, Select, Button, message } from "antd";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import BackButton from "../../../components/mobile/button/BackButton";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import "./../css/FormAnt.css"; // ✅ Import CSS
import { AuthContext } from "../../../contexts/AuthContext";
const { Option } = Select;

export default function ContactAdmin() {
  const { showNotification, userInfo } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [contactTypes, setContactTypes] = useState([]); // เก็บค่าจาก API
  const [popupMessage, setPopupMessage] = useState(""); // ✅ ใช้เก็บข้อความที่จะแสดงใน Popup
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // ดึงข้อมูลประเภทการติดต่อจาก API
  useEffect(() => {

    const lineDisplayName = localStorage.getItem('lineDisplayName');
    const lineUserId = localStorage.getItem('lineUserId');
    console.log('lineDisplayName : ', lineDisplayName)
    console.log('lineUserId : ', lineUserId)


    const fetchContactTypes = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathMasterContactType);

        if (response.status === 200 && response.result) {
          setContactTypes(response.data);
        } else {
          console.error("Failed to fetch contact types:", response);
        }
      } catch (error) {
        console.error("Error fetching contact types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactTypes();
  }, []);


  // Function to format data before sending to API
  const formatData = (values) => {
    return {
      platform: "web",
      shop_name: values.shopName || "-",
      contact_type_id: values.contactType || 0,
      contact_type_name: contactTypes.find((type) => type.id === values.contactType)?.name || "N/A",
      first_name: values.firstName || "-",
      last_name: values.lastName || "-",
      phone: values.phoneNumber || "-",
      remark: values.remark || "-",
      line_id: localStorage.getItem('lineUserId') || "-", // Replace with real LINE ID if available
      line_name: localStorage.getItem('lineDisplayName') || "-",
      line_url: values.line_url || "line_url",
    };
  };

  // ✅ ฟังก์ชันยิง API POST ไปที่ pathMasterContactUpdate
  const onFinish = async (values) => {
    console.log("Form Submitted: ", values);

    const payload = formatData(values); // Format data before sending

    try {
      setLoading(true);
      const response = await useServiceAPI.post(paths.pathMasterContactUpdate, payload);

      if (response.status === 200 && response.result) {
        setPopupMessage(response.data.message_line); // ✅ ตั้งค่าข้อความ Popup จาก API
        setIsConfirmationVisible(true);
      } else {
        message.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } catch (error) {
      console.error("Error sending contact update:", error);
      message.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header Section */}
        <div className="w-full max-w-md py-4 flex justify-between items-center">
          <h2 className="text-[#009845] text-lg font-semibold sarabun-font">ติดต่อเจ้าหน้าที่</h2>
        </div>

        {/* User Details Form */}
        <div className="w-full max-w-md mt-4">
          <Form
            form={form}
            layout="vertical"
            className="space-y-4 sarabun-font h-full"
            onFinish={onFinish} // ✅ เมื่อกด submit จะเรียก onFinish
          >
            {/* ชื่อร้าน */}
            <Form.Item
              label="ชื่อร้าน"
              name="shopName"
              rules={[{ required: true, message: "กรุณากรอกชื่อร้าน" }]}
            >
              <Input className="mt-1 sarabun-font text-[#A19793]" placeholder="กรอกชื่อร้าน" />
            </Form.Item>

            {/* ประเภทการแจ้งติดต่อ */}
            <Form.Item
              label="ประเภทการแจ้งติดต่อ"
              name="contactType"
              rules={[{ required: true, message: "กรุณาเลือกประเภทการแจ้งติดต่อ" }]}
            >
              <Select placeholder="เลือกประเภท" className="sarabun-font">
                {contactTypes.map((type) => (
                  <Option key={type.id} value={type.id} className="sarabun-font">
                    {type.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* ชื่อ */}
            <Form.Item
              label="ชื่อ"
              name="firstName"
              rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
            >
              <Input className="mt-1 sarabun-font text-[#A19793]" placeholder="กรอกชื่อ" />
            </Form.Item>

            {/* นามสกุล */}
            <Form.Item
              label="นามสกุล"
              name="lastName"
              rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
            >
              <Input className="mt-1 sarabun-font text-[#A19793]" placeholder="กรอกนามสกุล" />
            </Form.Item>

            {/* เบอร์ติดต่อ */}
            <Form.Item
              label="เบอร์ติดต่อ"
              name="phoneNumber"
              rules={[
                { required: true, message: "กรุณากรอกเบอร์ติดต่อ" },
                { pattern: /^[0-9]{10}$/, message: "เบอร์ติดต่อไม่ถูกต้อง (ต้องมี 10 หลัก)" },
              ]}
            >
              <Input className="mt-1 sarabun-font text-[#A19793]" placeholder="กรอกเบอร์ติดต่อ" />
            </Form.Item>

            {/* หมายเหตุ */}
            <Form.Item label="หมายเหตุ" name="remark">
              <Input.TextArea className="mt-1 sarabun-font text-[#A19793]" placeholder="กรอกหมายเหตุ (ถ้ามี)" />
            </Form.Item>
          </Form>
        </div>

        {/* Action Buttons - นอก Form */}
        <div className="w-full max-w-md flex justify-between align-bottom mt-auto space-x-2">
          <BackButton url="/mobile/verify" />

          <div className="w-full max-w-md mt-auto py-2">
            <button
              type="primary"
              className="w-full py-3 bg-[#009845] rounded-lg text-white sarabun-font flex items-center justify-center space-x-2"
              onClick={() => form.submit()} // ✅ ใช้ form.submit() เพื่อให้ปุ่มสามารถกดแล้วส่งฟอร์ม
            >
              <span className="sarabun-font">แจ้งเจ้าหน้าที่</span>
            </button>
          </div>
        </div>
      </div>

      {/* DynamicPopUp - Confirmation Popup */}
      <DynamicPopUp
        visible={isConfirmationVisible}
        onConfirm={() => {
          setIsConfirmationVisible(false);
          navigate("/mobile/verify"); // ✅ Navigate ไปยังหน้าถัดไป
        }}
        src="/img/icons/check-circle.png"
        text={`<p class='text-[#978B87] text-center sarabun-font'>${popupMessage}</p>`} // ✅ ทำให้ข้อความใน Popup เป็นแบบไดนามิก
        confirmText="ตกลง"
      />
    </MobileLayout>
  );
}
