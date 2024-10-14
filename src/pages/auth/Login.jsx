import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

import { Checkbox, Form, Input, message } from "antd";
import Button from "../../components/button/Button";
import LoginLayout from "../../layouts/LoginLayout";
import Logo from "../../components/logo/Logo";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);
  const [messageApi, contextHolder] = message.useMessage();

  const showMsg = (type, content) => {
    messageApi.open({
      type,
      content,
    });
  };

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
        childrenStyle="flex justify-center items-center  flex-col gap-3 h-full"
      >
        {contextHolder}
        <Logo width="w-[20%]" />
        <div>
          <span className="text-white">Listen • Learn • Delivery</span>
        </div>
        <Form
          name="basic"
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 20 }}
          style={{ maxWidth: 700 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            name="remember"
            valuePropName="checked"
            wrapperCol={{ offset: 4, span: 18 }}
          >
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
            <Button
              type="primary"
              htmlType="submit"
              className="flex w-full justify-center rounded-md bg-gray-100 text-green-600 hover:bg-gray-200 hover:text-green-600 px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              text="Login"
              disabled={loading}
            ></Button>
          </Form.Item>
        </Form>
      </LoginLayout>
    </>
  );
}
