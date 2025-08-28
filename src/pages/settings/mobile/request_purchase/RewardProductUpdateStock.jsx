import React, { useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import { Form, Button } from "antd";
import { useNavigate } from "react-router-dom";
import FormCustom from "../../../../components/form_custom/FormCustom";
import ActionButton from "../../../../components/button/ActionButton";

export default function RewardProductUpdateStock() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const fields = [
    {
      name: "reward_code",
      label: "Reward Code",
      type: "text",
      value: "Generate", // หรือปล่อยให้ backend เติมทีหลังก็ได้
      disabled: true,
      col: 24,
    },
    {
      name: "reward_name",
      label: "Reward Name",
      type: "text",
      required: true,
      placeholder: "Reward Name",
      col: 24,
    },
    {
      name: "short_description",
      label: "Short Description",
      type: "text",
      required: true,
      placeholder: "Short Description",
      col: 24,
    },
    {
      name: "description",
      label: "Description",
      type: "text-editor",
      placeholder: "Add description",
      col: 24,
    },
    {
      name: "condition",
      label: "Condition",
      type: "textarea",
      placeholder: "Add description",
      col: 24,
    },
    {
      name: "show_value",
      label: "Show Value",
      type: "number",
      placeholder: "Value",
      col: 12,
    },
    {
      name: "real_value",
      label: "Real Value",
      type: "number",
      placeholder: "Value",
      col: 12,
    },
    {
      name: "picture",
      label: "Picture",
      type: "photo",
      col: 24,
    },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log("✅ Form Submitted:", values);
      // TODO: ส่งข้อมูลไป backend
    } catch (error) {
      console.warn("Form validation failed:", error);
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Create Request Purchase</div>
      </div>

      <FormCustom
        fields={fields}
        form={form}
        title={null}
        mode="create"
      />
      <div className="flex justify-end space-x-4">
        <ActionButton
          text="Back"
          mode="back"
          onClick={() => navigate(-1)}
        />
        <ActionButton
          text="Save"
          mode="save"
          onClick={() => handleSubmit}
        />
      </div>
    </MainLayout>
  );
}
