import React, { useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import { Form } from "antd";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../../components/button/ActionButton";
import FormUser from "../../../../components/form_user/FormUser";

export default function RegisteredCustomerDetail() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState("/img/profile.jpg");

  const handleSubmit = (values) => {
    setLoading(true);
    console.log("Submitted Values:", values);
    setTimeout(() => {
      setLoading(false);
      navigate("/setting/line/register-customer");
    }, 1000);
  };

  const fields = [
    {
      label: "",
      name: "profile",
      type: "picture",
      required: false,
      col: 24,
      value: "",
    },
    { name: "shop_name", label: "Shop Name", type: "text", required: true, col: 6, disabled: true },
    { name: "contact_name", label: "Name", type: "text", required: true, col: 6, disabled: true },
    { name: "surname", label: "Surname", type: "text", required: true, col: 6, disabled: true },
    { name: "dob", label: "Date of birth", type: "date", required: false, col: 6, disabled: true },
    { name: "phone_no", label: "Contact Number", type: "text", required: true, col: 6, disabled: true },
    { name: "line_id", label: "Line ID", type: "text", required: false, col: 6, disabled: true },
    { name: "address", label: "Address", type: "text", required: false, col: 12, disabled: true },
    { name: "register_date", label: "Register Date", type: "date", required: true, col: 6, disabled: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      col: 6,
      value: "active", // << ตั้งค่าเริ่มต้นที่นี่
      options: [
        { id: "active", name: "Active" },
        { id: "inactive", name: "Inactive" },
      ],
    },
  ];


  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Customer Detail</div>
      </div>

      <FormUser
        profile={profileImage}
        fields={fields}
        form={form}
        onChange={() => { }}
        disableImageUpload={false} // ห้ามเปลี่ยนรูปตาม UI
      />


      <div className="flex justify-end gap-2 mt-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        <ActionButton mode="save" text="Update" onClick={() => form.submit()} />
      </div>
    </MainLayout>
  );
}
