import React, { useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import { Form } from "antd";
import { useNavigate } from "react-router-dom";
import FormUser from "../../../../components/form_user/FormUser";
import ActionButton from "../../../../components/button/ActionButton";

export default function CreateCustomerLine() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState("/img/profile.jpg"); // Default value

  const handleSubmit = (values) => {
    setLoading(true);
    console.log("Submitted Values:", values);
    setTimeout(() => {
      setLoading(false);
      navigate("/setting/line/customer-support-list");
    }, 1000);
  };

  const fields = [
    {
      label: "",
      name: "profile", // ชื่อฟิลด์ในฟอร์ม
      type: "picture", // ประเภทฟิลด์
      required: false,
      col: 24,
      value: '',

    },
    { name: "shop_name", label: "Shop Name", type: "text", required: true },
    { name: "contact_name", label: "Contact Name", type: "text", required: true },
    { name: "phone_no", label: "Phone No", type: "text", required: true },
    { name: "customer_code", label: "Customer Code", type: "text" },
    {
      name: "status", label: "Status", type: "select", required: true, options: [
        { id: "active", name: "Active" },
        { id: "inactive", name: "Inactive" }
      ]
    }
  ];

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Create Customer</div>
      </div>
      <FormUser profile={profileImage} fields={fields} form={form} onChange={() => { }} />
      <div className="flex justify-end gap-2 mt-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        <ActionButton mode="save" text="Save" onClick={() => form.submit()} />
      </div>
    </MainLayout>
  );
}
