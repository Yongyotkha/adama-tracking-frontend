import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { Checkbox, Form, Input, message } from "antd";
import LoginLayout from "../../layouts/LoginLayout";
import Logo from "../../components/logo/Logo";
import DynamicButton from "../../components/button/DynamicButton";
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login, showMsg } = useContext(AuthContext);

  const onFinish = (values) => {
    login(username, password, setLoading)
      .then((response) => {
        if (response.result) {
          const phoneNumber = response.data.user.phone_number;
          navigate("/verify-otp?phone_number=" + phoneNumber);
        }
      })
      .catch((error) => {
        showMsg("error", error.response?.data?.data?.message);
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log(errorInfo);
  };

  return (
    <>
      <LoginLayout
        loading={loading}
        childrenStyle="flex justify-center items-center flex-col gap-6 h-full"
      >
        <div className="w-full max-w-lg mt-auto p-3">
          {/* Logo at the Top */}
          <Logo width="w-[100%]" className="mb-10" />

          <Form
            name="basic"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 30 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            {/* Username Field */}
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please input your phone number!" },
              ]}
            >
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Phone Number"
                className="p-2 rounded-md border border-gray-300"
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 rounded-md border border-gray-300"
              />
            </Form.Item>

            <div className="flex justify-between mb-4">
              {/* Remember Me and Forgot Password */}
              <Form.Item
                name="remember"
                valuePropName="checked"
                className="text-nowrap mb-0"
              >
                <Checkbox className="text-white hover:text-[#00783F]">
                  Remember me
                </Checkbox>
              </Form.Item>

              <Form.Item
                name="remember"
                valuePropName="checked"
                className="text-nowrap mb-0"
              >
                <a
                  href="/forgot-password"
                  className="text-white hover:text-[#00783F]"
                >
                  Forgot Password?
                </a>
              </Form.Item>
            </div>

            {/* Login Button */}
            <Form.Item>
              <DynamicButton
                type="primary"
                htmlType="submit"
                className="flex w-full justify-center rounded-sm bg-[#00783F] text-white hover:bg-[#00783F] hover:text-green-600 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full max-w-full"
                text="Login"
                disabled={loading}
              />
            </Form.Item>

            <div className="flex justify-center text-white">
              <p>Listen • Learn • Deliver</p>
            </div>
          </Form>
        </div>

        {/* Footer */}
        <div className="mt-auto text-center text-white pb-3">
          <p>Copyright © ADAMA</p>
        </div>
      </LoginLayout>
    </>
  );
}
