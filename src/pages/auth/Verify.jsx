import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { Form, Input, message, Row, Col } from "antd";
import MessageLayout from "../../layouts/MessageLayout";
import DynamicButton from "../../components/button/DynamicButton";
import { AuthContext } from "../../contexts/AuthContext";

export default function Verify() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(0); // 5 minutes
  const [otpInfo, setOtpInfo] = useState(""); // 5 minutes
  const [btnVerify, setBtnVerify] = useState("Verify");
  const { userInfo, showMsg,showNotification } = useContext(AuthContext);

  const onFinish = () => {
    const otpCode = otp.join("");

    useServiceAPI
      .post(
        paths.pathOtpVerify,
        {
          messageId: otpInfo.message_id,
          otp: otpCode,
        },
        setLoading
      )
      .then((response) => {
        if (response.result) {
          if (userInfo.is_change_password) {
            navigate("/change-password");
          } else {
            navigate("/");
          }
        }
      })
      .catch((error) => {
        console.log(error.message);
        if (error.status == 422) {
          showNotification("error", "กรุณาระบุ OTP ให้ครบถ้วน");
        } else {
          showNotification("error", "เกิดข้อผิดพลาด");
        }
      });
  };

  // Handle OTP input change
  const handleChange = (index, event) => {
    const value = event.target.value;
    const reg = /^[0-9]*$/; // Regex to allow only numbers
    if (reg.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Move focus to the next input if value exists
      if (value && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  // Resend OTP function
  const handleResend = () => {
    callOtpPhone();
    showMsg("info", "OTP code has been resent!");
  };

  // Countdown timer for resend button
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Convert timeLeft to minutes and seconds format (MM:SS)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const callOtpPhone = () => {
    useServiceAPI
      .post(
        paths.pathOtpCall,
        { phone_number: userInfo.phone_number_otp },
        setLoading
      )
      .then((response) => {
        if (response.status == 200) {
          console.log(response);
          setTimeLeft(300);
          setOtpInfo(response.data.data);
          // showMsg("success", response.data.message);
        }
      })
      .catch((error) => {
        console.log(error.message);
        if (error.status == 422) {
          showMsg("error", "กรุณาระบุ OTP ให้ครบถ้วน");
        } else {
          showMsg("error", "เกิดข้อผิดพลาด");
        }
      });
  };

  useEffect(() => {
    // callOtpPhone();
  }, []);

  return (
    <>
      <MessageLayout
        loading={loading}
        childrenStyle="flex justify-center items-center flex-col gap-3 h-full max-w-xs p-4 m-auto"
      >
        <p className="text-[#00783F] text-xl font-bold">OTP Verification</p>
        <p className="text-[#978B87]">Enter the OTP sent to</p>
        <p className="text-[#00783F] text-xl font-bold">
          {userInfo.phone_number_display}
        </p>
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
                  onChange={(e) => handleChange(index, e)}
                  inputMode="numeric" // Ensures numeric keyboard on mobile
                  pattern="[0-9]*" // Restricts input to numbers only
                  className={`
                    ${
                      digit ? "text-white bg-[#7DB41E]" : "text-black bg-white"
                    } 
                    hover:bg-[#7DB41E] 
                    focus:bg-[#7DB41E] focus:text-white
                    border-none
                  `}
                  style={{
                    width: "50px",
                    height: "50px",
                    fontSize: "24px",
                    textAlign: "center",
                    transition: "background-color 0.3s ease",
                  }}
                  placeholder="0"
                />
              </Col>
            ))}
          </Row>

          {timeLeft !== 0 && (
            <div>
              <p className="text-center mb-3 text-[#978B87]">
                Referral Code {otpInfo.otp_ref_no} Please enter OTP
                <br />
                within 5 minutes.
              </p>
              <p className="text-center mb-3 text-[#978B87]">
                {formatTime(timeLeft)}
              </p>
            </div>
          )}

          {/* This section will only appear when the timer reaches zero */}
          {!timeLeft && (
            <div className="text-center py-5">
              <p className="text-center mb-3 text-[#978B87]">
                Didn't you receive any code?
              </p>
              <DynamicButton
                type="button"
                text="RESEND OTP"
                onClick={handleResend}
                className="text-[#F5B317] font-bold"
              />
            </div>
          )}

          <div className="mb-40">
            <DynamicButton
              type="primary"
              className="flex w-full justify-center rounded-sm bg-[#00783F] text-white hover:bg-[#00783F] hover:text-green-600 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full max-w-full mb-3"
              htmlType="submit"
              text="Verify"
              disabled={loading}
            />

            <DynamicButton
              type="primary"
              className="flex w-full justify-center rounded-sm bg-white text-[#00783F] hover:bg-white hover:text-gray-600 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full max-w-full mb-3"
              htmlType="button"
              text="Cancel"
              disabled={loading}
              onClick={() => navigate("/login")} // Navigate back on cancel
            />
          </div>
        </Form>
      </MessageLayout>
    </>
  );
}
