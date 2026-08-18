import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Typography } from "antd";
import MessageLayout from "../../../layouts/MessageLayout";
import DynamicButton from "../../../components/button/DynamicButton";
import { AuthContext } from "../../../contexts/AuthContext";
import LogoGreenNew from "../../../components/logo/LogoGreenNew";
import useServiceAPI from "../../../services/CorsService";
import { MOBILE_BYPASS_KEY, paths } from "../../../services/CorsPath";

export default function LoginBypassOA() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { Title, Text } = Typography;
  const { loginLineUid, showMsg } = useContext(AuthContext);

  const onFinish = (values) => {
    setLoading(true);
    localStorage.setItem(MOBILE_BYPASS_KEY, "true");

    useServiceAPI
      .post(
        paths.pathShopLoginBypass,
        {
          username: values.username,
          password: values.password,
        },
        setLoading
      )
      .then(async (response) => {
        if (
          response.status === 200 &&
          response.result === true &&
          response.data?.login === true &&
          response.data?.user_id
        ) {
          localStorage.setItem("user_id", response.data.user_id);
          if (response.data.line_id_token) {
            localStorage.setItem("lineUserId", response.data.line_id_token);
          }

          const results = await loginLineUid(
            response.data.user_id,
            setLoading
          );
          if (results?.status === 200) {
            navigate("/mobile/main", { replace: true });
          }
          return;
        }

        showMsg("error", response.data?.message || "ไม่สามารถเข้าสู่ระบบได้");
      })
      .catch((error) => {
        localStorage.removeItem(MOBILE_BYPASS_KEY);
        showMsg(
          "error",
          error.response?.data?.data?.message ||
            error.response?.data?.message ||
            "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
        );
      })
      .finally(() => setLoading(false));
  };

  return (
    <MessageLayout
      loading={loading}
      childrenStyle="flex flex-col items-center justify-center h-full mx-auto p-6 sarabun-font relative"
    >
      <LogoGreenNew width="w-[100%]" className="mb-10 max-w-xs" />

      <Title level={4}>
        <span className="text-[#8A8A8A] font-bold sarabun-font">
          เข้าสู่ระบบ (ทดสอบ)
        </span>
      </Title>
      <Text className="text-[#8A8A8A] mb-4 sarabun-font text-center">
        ใช้ username และ password แทน LINE / OTP
      </Text>

      <Form
        name="loginBypass"
        onFinish={onFinish}
        autoComplete="off"
        className="max-w-xs w-full"
      >
        <div className="my-4 w-full">
          <label className="text-[#978B87] text-sm sarabun-font">
            Username
          </label>
          <Form.Item
            name="username"
            rules={[{ required: true, message: "กรุณากรอก username" }]}
          >
            <Input
              placeholder="Username / เบอร์โทรศัพท์"
              className="w-full rounded-lg px-3 py-2 text-[#8A8A8A] text-lg sarabun-font"
            />
          </Form.Item>
        </div>

        <div className="mb-4 w-full">
          <label className="text-[#978B87] text-sm sarabun-font">
            Password
          </label>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
          >
            <Input.Password
              placeholder="Password"
              className="w-full rounded-lg px-3 py-2 text-[#8A8A8A] text-lg sarabun-font"
            />
          </Form.Item>
        </div>

        <DynamicButton
          type="submit"
          className="w-full bg-[#009845] text-white py-2 rounded-md text-lg font-semibold shadow-md hover:bg-green-800 sarabun-font"
          text="เข้าสู่ระบบ"
          disabled={loading}
        />
      </Form>
    </MessageLayout>
  );
}
