import React, { useState } from "react";
import { Input, Button, Form } from "antd";
import { MobileLayout } from "../../../../../components/navbar/NavbarMobile";
import BackButton from "../../../../../components/mobile/button/BackButton";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../../../services/CorsService";
import { paths } from "../../../../../services/CorsPath";
import DynamicPopUp from "../../../../../components/mobile/popup/DynamicPopUp";

export default function CreateTranAddress() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const onFinish = async (values) => {
    const payload = {
      platform: "web",
      firstname: values.firstName,
      lastname: values.lastName,
      phoneNumber: values.phone,
      address: values.address,
    };

    setLoading(true);
    try {
      const response = await useServiceAPI.post(paths.pathTranAddressCreate, payload);

      if (response.status === 200 && response.result) {
        // ✅ Show modal on success
        setIsSuccessModalVisible(true);
      } else {
        console.error("❌ Save failed:", response);
      }
    } catch (error) {
      console.error("❌ API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header */}
        <div className="w-full max-w-md py-4 flex justify-between items-center">
          <h2 className="text-[#009845] text-lg font-semibold sarabun-font">
            ที่อยู่ใหม่
          </h2>
        </div>

        {/* Form Section */}
        <div className="w-full max-w-md">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            // initialValues={{
            //   lastName: "Ruangkol",
            //   address: "54 ซ.รัชประชา 5 ถ.รัชดาภิเษกเขตดุสิต แขวงลาดยาว จ.กรุงเทพมหานคร10150",
            // }}
            className="sarabun-font space-y-3"
          >
            <Form.Item
              label="ชื่อ"
              name="firstName"
              rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
            >
              <Input placeholder="ชื่อ" className="text-[#A19793] sarabun-font" />
            </Form.Item>

            <Form.Item
              label="นามสกุล"
              name="lastName"
              rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
            >
              <Input placeholder="นามสกุล" className="text-[#A19793] sarabun-font" />
            </Form.Item>

            <Form.Item
              label="เบอร์โทรศัพท์"
              name="phone"
              rules={[{ required: true, message: "กรุณากรอกเบอร์โทรศัพท์" }]}
            >
              <Input placeholder="เบอร์โทรศัพท์" type="tel" className="text-[#A19793] sarabun-font" />
            </Form.Item>

            <Form.Item
              label="ที่อยู่"
              name="address"
              rules={[{ required: true, message: "กรุณากรอกที่อยู่" }]}
            >
              <Input.TextArea rows={3} placeholder="ที่อยู่" className="sarabun-font" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-[#009845] border-none rounded-lg h-10 mt-2"
              >
                <span className="sarabun-font">บันทึก</span>
              </Button>
            </Form.Item>
          </Form>
        </div>

        <BackButton />

        {/* ✅ Success Modal */}
        <DynamicPopUp
          visible={isSuccessModalVisible}
          onConfirm={() => navigate("/mobile/tran-address")}
          src="/img/icons/check-circle.png"
          text="<p class='text-[#978B87] text-center sarabun-font'>สร้างที่อยู่สำเร็จ</p>"
          confirmText="ตกลง"
        />
      </div>
    </MobileLayout>
  );
}
