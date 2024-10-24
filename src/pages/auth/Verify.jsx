import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../services/corsService";
import { paths } from "../../services/CorsPath";
import { Form, Input, message, Row, Col } from "antd";
import MessageLayout from "../../layouts/MessageLayout";
import Button from "../../components/button/Button";

export default function Verify() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isResendDisabled, setResendDisabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30); // 5 minutes
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
    setTimeLeft(30);
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
    }
  }, [timeLeft]);

  // Convert timeLeft to minutes and seconds format (MM:SS)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <>
      <MessageLayout
        loading={loading}
        childrenStyle="flex justify-center items-center  flex-col gap-3 h-full"
      >
        {contextHolder}
        <p className="text-[#00783F] text-lg font-bold">OTP Verification</p>
        <p className="text-[#978B87]">Enter the OTP sent to</p>
        <p className="text-[#00783F] text-lg font-bold">+66801xxxx67</p>
        <Form
          name="otpVerification"
          labelCol={{ span: 8 }}
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
                  type="tel"
                  onChange={(e) => handleChange(index, e)}
                  className={`
                    ${digit ? 'text-white bg-[#7DB41E]' : 'text-black bg-white'} 
                    hover:bg-[#7DB41E] 
                    focus:bg-[#7DB41E] focus:text-white
                    border-none
                  `}
                  style={{
                    width: "50px",
                    height: "50px",
                    fontSize: "24px",
                    textAlign: "center",
                    transition: "background-color 0.3s ease", // Optional smooth transition
                  }}
                  placeholder="0"
                />
              </Col>
            ))}
          </Row>
          <div>
            <p className="text-center mb-3 text-[#978B87]">
              Referral Code XRE0FC Please enter OTP
              <br />
              within 5 minutes.
            </p>
            <p className="text-center mb-3 text-[#978B87]">
              {isResendDisabled ? formatTime(timeLeft) : ""}
            </p>
          </div>

          {/* This section will only appear when the timer reaches zero */}
          {!isResendDisabled && (
            <div className="text-center py-5">
              <p className="text-center mb-3 text-[#978B87]">
                Didn't you receive any code?
              </p>
              <Button
                type="link"
                text='RESEND OTP'
                onClick={handleResend}
                className='text-[#F5B317] font-bold'
              />
            </div>
          )}

          <div className="mb-40">
            <Button
              type="primary"
              className="flex w-full justify-center rounded-sm bg-[#00783F] text-white hover:bg-[#00783F] hover:text-green-600 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full max-w-full mb-3"
              htmlType="submit"
              text="Verify"
              disabled={loading}
            />

            <Button
              type="primary"
              className="flex w-full justify-center rounded-sm bg-white text-[#00783F] hover:bg-white hover:text-gray-600 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full max-w-full mb-3"
              htmlType="button"
              text="Cancel"
              disabled={loading}
              onClick={() => navigate("/")} // Navigate back on cancel
            />
          </div>
        </Form>
      </MessageLayout>
    </>
  );
}
