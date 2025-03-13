import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input, Typography } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import MessageLayout from "../../../layouts/MessageLayout";
import DynamicButton from "../../../components/button/DynamicButton";
import { AuthContext } from "../../../contexts/AuthContext";
import LogoGray from "../../../components/logo/LogoGray";
import BackTopLeftButton from "../../../components/mobile/button/BackTopLeftButton";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp"; // Import Modal Popup
import liff from "@line/liff";

export default function VerifyOA() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [popupText, setPopupText] = useState(""); // State for dynamic text
  const [popupImage, setPopupImage] = useState(""); // State for dynamic image if needed
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const { userInfo } = useContext(AuthContext);
  const { Title, Text } = Typography;
  const [userName, setUserName] = useState(""); // เก็บชื่อผู้ใช้


  useEffect(() => {
    console.log(location.state);
    console.log(phoneNumber);
  }, [location, phoneNumber]);

  const onFinish = () => {
    if (!phoneNumber) {
      setPopupText("<p class='text-[#978B87] text-center sarabun-font'>ไม่พบข้อมูลของคุณในระบบ กรุณาติดต่อเจ้าหน้าที่</p>");
      setPopupImage("/logo/Logo-Adama-Smile-2-New 1.png");
      setIsModalVisible(true);
      return;
    }

    if (phoneNumber === '0800000001' || phoneNumber === '+66800000001') {
      setPopupText("<p class='text-[#978B87] text-center sarabun-font'>ร้านค้านี้มีการลงทะเบียนในระบบแล้ว</p>");
      setPopupImage("/logo/Logo-Adama-Smile-2-New 1.png");
      setIsModalVisible(true);
      return;
    }

    console.log("Phone Number Submitted:", phoneNumber);
    setLoading(false);
    navigate("/mobile/otp");
  };

  
  return (
    <MessageLayout
      loading={loading}
      childrenStyle="flex flex-col items-center justify-center h-full mx-auto p-6 sarabun-font relative"
    >
      {/* Back Button */}
      <BackTopLeftButton />

      <LogoGray width="w-[100%]" className="mb-10 max-w-xs" />

      <Title level={4}>
        <span className="text-[#8A8A8A] font-bold sarabun-font">ยืนยันตัวตนของคุณ</span>
      </Title>
      <Text className="text-[#8A8A8A] mb-4 sarabun-font">กรุณากรอกเบอร์โทรศัพท์</Text>

      <Form name="phoneVerification" onFinish={onFinish} autoComplete="off">
        <div className="my-4 w-full">
          <label className="text-[#978B87] text-sm sarabun-font">เบอร์โทรศัพท์</label>
          <PhoneInput
            defaultCountry="TH"
            value={phoneNumber}
            onChange={setPhoneNumber}
            className="w-full border rounded-lg px-3 py-2 text-[#8A8A8A] text-lg focus:ring-green-500 focus:border-green-500 sarabun-font"
            placeholder="088 xxx xxxx"
          />
        </div>

        <DynamicButton
          type="primary"
          className="w-full bg-[#009845] text-white py-2 rounded-md text-lg font-semibold shadow-md hover:bg-green-800 sarabun-font"
          htmlType="submit"
          text="ตกลง"
          disabled={loading}
        />

      </Form>

      <div className="text-center mt-10">
        <Text className="text-green-600 text-sm cursor-pointer hover:underline sarabun-font">
          เปลี่ยนหมายเลขโทรศัพท์ของคุณหรือ ลืมหมายเลขของคุณ?
        </Text>
      </div>

      {/* Modal Popup for Empty Phone Number */}
      <DynamicPopUp
        visible={isModalVisible}
        onConfirm={() => {
          setIsModalVisible(false);
          if (phoneNumber === '0800000001') {
            // Handle the case for phone number 0800000001
            setIsModalVisible(false);
          } else {
            navigate("/mobile/contact-staff"); // Navigate to "ติดต่อเจ้าหน้าที่" page
          }
        }}
        onCancel={() => setIsModalVisible(false)}
        src={popupImage} // Dynamically set image path
        text={popupText} // Dynamically set text content
        confirmText="ตกลง"
        cancelText="ปิดหน้าต่าง"
      />
    </MessageLayout>
  );
}

