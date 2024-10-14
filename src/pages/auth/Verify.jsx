import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../services/corsService";
import { paths } from "../../services/CorsPath";

import { Form, Input, message, Row, Col } from "antd";
import LoginLayout from "../../layouts/LoginLayout";
import Logo from "../../components/logo/Logo";
import Button from "../../components/button/Button";

export default function Verify() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isResendDisabled, setResendDisabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [btnVerify, setBtnVerify] = useState("Verify");

  const [messageApi, contextHolder] = message.useMessage();

  const showMsg = (type, content) => {
    messageApi.open({
      type,
      content,
    });
  };

  const onFinish = () => {
    const otpCode = otp.join("");
    const body = {
      otpCode: otpCode,
    };
    useServiceAPI
      .get(paths.pathVerifyOtp, body, setLoading)
      .then((response) => {
        if (response.status == 200) {
          showMsg("success", response.data.message);
          navigate("/");
        }
      })
      .catch((error) => {
        console.log(error.message);
        setError(error.message);
        if (error.status == 422) {
          showMsg("error", "กรุณาระบุ OTP ให้ครบถ้วน");
        } else {
          showMsg("error", "เกิดข้อผิดพลาด");
        }
      });
  };

  // Handle OTP input change
  const handleChange = (index, event) => {
    const value = event.target.value;
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Move focus to the next input
      if (value && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  // Resend OTP function
  const handleResend = () => {
    setResendDisabled(true);
    setTimeLeft(60);
    // Mock resend function, replace with real API call if needed
    showMsg("info", "OTP code has been resent!");
  };

  // Countdown timer for resend button
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
      setBtnVerify("Resend");
    }
  }, [timeLeft, btnVerify]);

  return (
    <>
      <LoginLayout
        loading={loading}
        childrenStyle="flex justify-center items-center  flex-col gap-3 h-full"
      >
        {contextHolder}
        <Logo width="w-[20%]" />
        <div>
          <span className="text-white">Listen • Learn • Delivery</span>
        </div>
        <Form
          name="otpVerification"
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 20 }}
          style={{ maxWidth: 700 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={16} justify="center" style={{ marginBottom: "20px" }}>
            {otp.map((digit, index) => (
              <Col key={index}>
                <Input
                  id={`otp-input-${index}`}
                  maxLength={1}
                  value={digit}
                  type="number"
                  onChange={(e) => handleChange(index, e)}
                  style={{
                    width: "60px",
                    height: "60px",
                    fontSize: "24px",
                    textAlign: "center",
                  }}
                  placeholder="0"
                />
              </Col>
            ))}
          </Row>
          <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
            <p
              className="flex-auto text-gray-100"
              style={{ textAlign: "center" }}
            >
              Ref number: SAR79L Enter OTP code within 5 minutes.
            </p>
            <p
              className="flex-auto text-gray-100"
              style={{ textAlign: "center" }}
            >
              Resend code in {isResendDisabled ? `${timeLeft} seconds` : "Now"}
            </p>
            <Button
              type="primary"
              className="flex w-full justify-center rounded-md bg-gray-100 text-green-600 hover:bg-gray-200 hover:text-green-600 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              htmlType="submit"
              text={btnVerify}
              disabled={loading}
            ></Button>
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
            {/* <Button
              type="link"
              text="Resend"
              onClick={handleResend}
              disabled={isResendDisabled}
            ></Button> */}
          </Form.Item>
        </Form>
      </LoginLayout>
    </>
  );
}
