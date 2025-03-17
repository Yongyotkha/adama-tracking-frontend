import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input, Row, Col, Typography } from "antd";
import MessageLayout from "../../../layouts/MessageLayout";
import DynamicButton from "../../../components/button/DynamicButton";
import { AuthContext } from "../../../contexts/AuthContext";
import BackTopLeftButton from "../../../components/mobile/button/BackTopLeftButton";
import LogoGray from "../../../components/logo/LogoGray";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function VerifyOA() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [otpInfo, setOtpInfo] = useState("");
  const { userInfo, showMsg } = useContext(AuthContext);
  const { Title, Text } = Typography;
  const messageId = location?.state?.message_id ;
  const messagePhone = location?.state?.phone_number ;

  useEffect(() => {
    console.log(location.state);
  }, [location]);

  const onFinish = () => {
    const otpValue = otp.join("");
    console.log("OTP Submitted:", otpValue);

    setLoading(true);
    useServiceAPI.post(paths.pathOtpShopVerify, { messageId, otp: otpValue }, setLoading)
      .then((response) => {
        if (response.status === 200) {
          if (response.data.step_number == 0) {
               navigate("/mobile/contact-staff");
          } else if (response.data.step_number == 1){
              navigate("/mobile/register");
          } else if (response.data.step_number == 2){
              navigate("/mobile/contact-staff");

          } else if (response.data.step_number == 4){
            navigate("/mobile/account");

          }
          console.log("OTP Verification Success:", response.data);
          // navigate("/mobile/account");
        }
      })
      .catch((error) => {
        console.error("API Error:", error);
        // showNotification("error", error.response?.data?.message || "เกิดข้อผิดพลาด", error.response?.data?.message_id);
      })
      .finally(() => setLoading(false));
  };


  const handleChange = (index, event) => {
    const value = event.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleResend = () => {
    console.log("Resend OTP Triggered");
    setTimeLeft(300);
    showMsg("info", "OTP code has been resent!");
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    console.log("OTP Call Simulation");
    setTimeLeft(300);
  }, []);

  return (
    <MessageLayout
      loading={loading}
      childrenStyle="flex flex-col items-center justify-center h-full max-w-xs mx-auto p-6"
    >
      {/* ปุ่ม Back ที่มุมซ้ายบน */}
      <BackTopLeftButton />

      <LogoGray width="w-[100%]" className="mb-10 max-w-xs" />

      <Title level={4} className="text-green-700 sarabun-font">กรอกรหัส OTP</Title>
      <Text className="sarabun-font text-gray-500">กรอก OTP ที่ส่งไปที่เบอร์โทรศัพท์</Text>
      <Title level={5} className="pb-3">
        <Text className="sarabun-font text-[#009845]">
          {messagePhone}
          {/* {userInfo?.phone_number_display || location?.state?.phone_number_display} */}
        </Text>
      </Title>
      <Form name="otpVerification" onFinish={onFinish} autoComplete="off">
        <Row gutter={16} justify="center" className="mb-5">
          {otp.map((digit, index) => (
            <Col key={index}>
              <Input
                id={`otp-input-${index}`}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e)}
                inputMode="numeric"
                className={`sarabun-font ${digit ? "text-white bg-[#7DB41E]" : "text-black bg-[#F7F6F9]"
                  } hover:bg-[#7DB41E] focus:bg-[#7DB41E] focus:text-white border-none w-12 h-12 text-2xl text-center transition duration-300`}
                placeholder="0"
              />
            </Col>
          ))}
        </Row>

        {timeLeft !== 0 && (
          <div className="text-center mb-3">
            <Text className="text-gray-500 sarabun-font">
              รหัสอ้างอิง {otpInfo.otp_ref_no} กรุณากรอก OTP ภายใน 5 นาที
            </Text>
            <div className="text-gray-500 font-bold mt-2">{formatTime(timeLeft)}</div>
          </div>
        )}

        {!timeLeft && (
          <div className="text-center py-5">
            <Text className="text-gray-500 sarabun-font">ไม่ได้รับรหัส?</Text>
            <DynamicButton
              type="button"
              text="ส่งรหัสอีกครั้ง"
              onClick={handleResend}
              className="text-yellow-500 font-bold sarabun-font"
            />
          </div>
        )}

        <div className="mb-10 w-full">
          <DynamicButton
            type="primary"
            className="w-full bg-green-700 text-white py-2 rounded-md text-sm font-semibold shadow-md hover:bg-green-800 sarabun-font"
            htmlType="submit"
            text="ตกลง"
            disabled={loading}
            // onClick={() => navigate("/mobile/account")}

          />
          {/* <DynamicButton
            type="button"
            className="w-full bg-white text-green-700 py-2 rounded-md text-sm font-semibold shadow-md hover:bg-gray-200 mt-3"
            text="ยกเลิก"
            disabled={loading}
            onClick={() => navigate("/mobile")}
          /> */}
        </div>
      </Form>
    </MessageLayout>
  );
}
