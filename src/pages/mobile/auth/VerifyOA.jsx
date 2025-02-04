import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input, Typography } from "antd";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css"; // Import styles
import MessageLayout from "../../../layouts/MessageLayout";
import DynamicButton from "../../../components/button/DynamicButton";
import { AuthContext } from "../../../contexts/AuthContext";

export default function VerifyOA() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const { userInfo } = useContext(AuthContext);
  const { Title, Text } = Typography;

  useEffect(() => {
    console.log(location.state);
  }, [location]);

  const onFinish = () => {
    console.log("Phone Number Submitted:", phoneNumber);
    setLoading(false);
    navigate("/mobile/otp");
  };

  return (
    <MessageLayout
      loading={loading}
      childrenStyle="flex flex-col items-center justify-center h-full max-w-xs mx-auto p-6 sarabun-font"
    >
      <Title level={4} className="text-gray-800 font-bold sarabun-font">
        ยืนยันตัวตนของคุณ
      </Title>
      <Text className="text-gray-500 mb-4 sarabun-font">กรุณากรอกเบอร์โทรศัพท์</Text>

      <Form name="phoneVerification" onFinish={onFinish} autoComplete="off">
        <div className="mb-4 w-full">
          <label className="text-gray-600 text-sm sarabun-font">เบอร์โทรศัพท์</label>
          <PhoneInput
            defaultCountry="TH"
            value={phoneNumber}
            onChange={setPhoneNumber}
            className="w-full border rounded-lg px-3 py-2 text-lg focus:ring-green-500 focus:border-green-500 sarabun-font"
            placeholder="088xxxxxxx"
          />
        </div>

        <DynamicButton
          type="primary"
          className="w-full bg-green-700 text-white py-2 rounded-md text-lg font-semibold shadow-md hover:bg-green-800 sarabun-font"
          htmlType="submit"
          text="ตกลง"
          disabled={loading || !phoneNumber}
          />
      </Form>

      <div className="text-center mt-4">
        <Text className="text-green-600 text-sm cursor-pointer hover:underline">
          เปลี่ยนหมายเลขโทรศัพท์ของคุณหรือ ลืมหมายเลขของคุณ?
        </Text>
      </div>
    </MessageLayout>
  );
}
