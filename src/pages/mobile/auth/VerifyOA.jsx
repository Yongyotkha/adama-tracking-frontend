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
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function VerifyOA() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [popupText, setPopupText] = useState(""); // State for dynamic text
  const [popupImage, setPopupImage] = useState(""); // State for dynamic image if needed
  const navigate = useNavigate();
  const [phone_number, setphone_number] = useState("");
  const { userInfo } = useContext(AuthContext);
  const { Title, Text } = Typography;
  const [userName, setUserName] = useState(""); // เก็บชื่อผู้ใช้


  useEffect(() => {
    console.log(location.state);
    console.log(phone_number);
  }, [location, phone_number]);

  const onFinish = () => {
    if (!phone_number) {
      setPopupText("<p class='text-[#978B87] text-center sarabun-font'>ไม่พบข้อมูลของคุณในระบบ กรุณาติดต่อเจ้าหน้าที่</p>");
      setPopupImage("/logo/Logo-Adama-Smile-2-New 1.png");
      setIsModalVisible(true);
      return;
    }

    if (phone_number === '0800000001' || phone_number === '+66800000001') {
      setPopupText("<p class='text-[#978B87] text-center sarabun-font'>ร้านค้านี้มีการลงทะเบียนในระบบแล้ว</p>");
      setPopupImage("/logo/Logo-Adama-Smile-2-New 1.png");
      setIsModalVisible(true);
      return;
    }

    // console.log("Phone Number Submitted:", phone_number);
    // setLoading(false);
    // navigate("/mobile/otp");

    // form
    // .validateFields()
    // .then((values) => {
    //   useServiceAPI
    //     .post(paths.pathOtpShopCall, values, setLoading)
    //     .then((response) => {
    //       if (response.status === 200) {
    //         navigate("/mobile/otp");
    //         setLoading(false);

    //       }
    //     })
    //     .catch((error) => {
    //       console.log(error);
    //       if (error.status === 422) {
    //         console.log("error", error.message);
    //       } else {
    //         // showMsg("error", "เกิดข้อผิดพลาด");
    //         showNotification("error", response.message, response.message_line);

    //       }
    //     });
    // })
    // .catch((errorInfo) => {
    //   console.error("Validation Failed:", errorInfo);
    // });

    setLoading(true);
    useServiceAPI.post(paths.pathOtpShopCall, { phone_number }, setLoading)
      .then((response) => {
        if (response.status == 200 ) {
          const otpRefNo = response.data.data.otp_ref_no;
          const message_id = response.data.data.message_id;
          console.log("OTP Reference Number:", otpRefNo);
          navigate("/mobile/otp", { state: { phone_number, otpRefNo , message_id} });
        }
      })
      .catch((error) => {
        console.error("API Error:", error);
        showNotification("error", error.response?.data?.message || "เกิดข้อผิดพลาด", error.response?.data?.message_id);
      })
      .finally(() => setLoading(false));

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
            value={phone_number}
            onChange={setphone_number}
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
          if (phone_number === '0800000001') {
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

