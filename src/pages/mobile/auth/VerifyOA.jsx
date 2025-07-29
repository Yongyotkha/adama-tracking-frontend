import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { Form, Input, Typography, Modal } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import MessageLayout from "../../../layouts/MessageLayout";
import DynamicButton from "../../../components/button/DynamicButton";
import { AuthContext } from "../../../contexts/AuthContext";
import LogoGray from "../../../components/logo/LogoGray";
import BackTopLeftButton from "../../../components/mobile/button/BackTopLeftButton";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";


export default function VerifyOA() {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [popupImage, setPopupImage] = useState("");
  const navigate = useNavigate();
  const [phone_number, setPhoneNumber] = useState("");
  const { Title, Text } = Typography;
  const formatPhoneNumber = (number) => number.replace(/\s+/g, "");

  const { lineProfile } = useOutletContext() || {};
  useEffect(() => {
    console.log("lineProfile xxx : ", lineProfile);
    if (lineProfile) {
      localStorage.setItem('lineDisplayName', lineProfile.displayName);
      localStorage.setItem('lineUserId', lineProfile.userId);
    }

  }, []);

  const showConfirm = (title, content, btn_ok, btn_cancel) => {
    Modal.confirm({
      title: title,
      content: content,
      okText: btn_ok,
      cancelText: btn_cancel,
      onOk() {
        console.log('ok cancel');
      },
      onCancel() {
        console.log('contact admin');
        navigate("/mobile/contact-admin");
      },
    });
  };

  const showCancel = (title, content, btn_ok) => {
    Modal.confirm({
      title,
      content,
      okText: btn_ok,
      cancelButtonProps: { style: { display: 'none' } }, // ซ่อนปุ่ม Cancel
      onOk() {
        // Modal.confirm สร้าง modal แบบ one-time ดังนั้นไม่ต้อง destroy เอง
      },
    });
  };
  const onFinish = () => {
    const formattedPhoneNumber = formatPhoneNumber(phone_number);
    console.log('formattedPhoneNumber : ', formattedPhoneNumber)

    setLoading(true);

    useServiceAPI
      .post(
        paths.pathOtpShopCall,
        { phone_number: Number(formattedPhoneNumber) },
        setLoading
      )
      .then((response) => {

        if (response.status === 200) {
          if (response.data.step_number == 0) {
            showCancel('คุณมีการลงทะเบียนแล้ว', 'ไม่พบข้อมูลของคุณในระบบ', 'ปิด');
          } else if (response.data.step_number == 1) {

            const otpRefNo = response.data.data.data.otp_ref_no;
            const message_id = response.data.data.data.message_id;
            navigate("/mobile/otp", { state: { otpRefNo, message_id } });

          } else if (response.data.step_number == 2) {
            showConfirm('คุณมีการลงทะเบียนแล้ว', 'กรุณากรอกเบอร์โทรศัพท์ที่เคยมีการลงทะเบียนแล้วหากคุณลืมหมายเลขให้ติดต่อแจ้งเจ้าหน้าที่', 'ตกลง', 'ติดต่อเจ้าหน้าที่');
          } else if (response.data.step_number == 3) {

          } else if (response.data.step_number == 4) {

          }
        }

        if (response.status === 200) {


        } else if (response.status === 201) {
          console.log('register success')

        } else if (response.status === 202) {

        }
      })
      .catch((error) => {
        console.error("API Error:", error);
      })
      .finally(() => setLoading(false));
  };

  return (
    <MessageLayout
      loading={loading}
      childrenStyle="flex flex-col items-center justify-center h-full mx-auto p-6 sarabun-font relative"
    >
      {/* <BackTopLeftButton /> */}
      <LogoGray width="w-[100%]" className="mb-10 max-w-xs" />
      <Title level={4}>
        <span className="text-[#8A8A8A] font-bold sarabun-font">
          ยืนยันตัวตนของคุณ
        </span>
      </Title>
      <Text className="text-[#8A8A8A] mb-4 sarabun-font">
        กรุณากรอกเบอร์โทรศัพท์
      </Text>
      <Form
        name="phoneVerification"
        onFinish={onFinish}
        autoComplete="off"
        className="max-w-xs w-full"
      >
        <div className="my-4 w-full">
          <label className="text-[#978B87] text-sm sarabun-font">
            เบอร์โทรศัพท์
          </label>
          <Form.Item
            name="phone_number"
            rules={[
              { required: true, message: "กรุณากรอกเบอร์โทรศัพท์" },
              // { pattern: /^\d{3} \d{3} \d{4}$/, message: "กรุณากรอกรูปแบบ 000 000 0000" }
            ]}
          >
            <PhoneInput
              defaultCountry="TH"
              value={phone_number}
              onChange={setPhoneNumber}
              className="w-full border rounded-lg px-3 py-2 text-[#8A8A8A] text-lg focus:ring-green-500 focus:border-green-500 sarabun-font"
              placeholder="000 000 0000"
              limitMaxLength={12}
            />
          </Form.Item>
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
        <Text
          onClick={() => {
            navigate("/mobile/contact-admin");
          }}
          className="text-green-600 text-sm cursor-pointer hover:underline sarabun-font">
          เปลี่ยนหมายเลขโทรศัพท์ของคุณหรือ ลืมหมายเลขของคุณ?
        </Text>
      </div>

      <button
        onClick={() => {
          const isAndroid = /Android/i.test(navigator.userAgent);
          const url = "adama.mtsc.co.th/mobile/scan-collect"; // ❌ ไม่มี https://

          if (isAndroid) {
            window.location.href = `intent://${url}#Intent;scheme=https;package=com.android.chrome;end;`;
          } else {
            window.open(`https://${url}`, "_blank");
          }
        }}
        className="w-full py-3 bg-[#009845] rounded-lg text-white sarabun-font flex items-center justify-center space-x-2 hidden"
      >
        d
      </button>

      <DynamicPopUp
        visible={isModalVisible}
        onConfirm={() => {
          setIsModalVisible(false);
          if (phone_number === "0800000001") {
            setIsModalVisible(false);
          } else {
            navigate("/mobile/contact-admin");
          }
        }}
        onCancel={() => setIsModalVisible(false)}
        src={popupImage}
        text={popupText}
        confirmText="ตกลง"
        cancelText="ปิดหน้าต่าง"
      />
    </MessageLayout>
  );
}
