import React, { useContext, useState } from "react";

import { AuthContext } from "../../contexts/AuthContext";
import { Button, Checkbox, Form, Input, message } from "antd";
import LoginLayout from "../../layouts/LoginLayout";
import Logo from "../../components/logo/Logo";
import { useNavigate } from "react-router-dom";

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
          navigate("/");
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
            <Button type="primary" htmlType="submit" disabled={loading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </LoginLayout>
    </>
  );
}
