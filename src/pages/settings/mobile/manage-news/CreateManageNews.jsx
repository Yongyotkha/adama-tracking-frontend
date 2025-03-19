import React, { useContext, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import FormCustom from "../../../../components/form_custom/FormCustom";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../../components/button/ActionButton";
import { Form } from "antd";
import { AuthContext } from "../../../../contexts/AuthContext";
import dayjs from "dayjs";

export default function CreateManageNews() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { showNotification } = useContext(AuthContext);

  // 🔹 Form Fields
  const formFields = [
    { label: "Banner", name: "banner", type: "photo", required: true, col: 24, accept: "image/png, image/jpeg" },

    { label: "Date", name: "date", type: "date", required: true, col: 12, value: dayjs().format("YYYY-MM-DD") },
    { label: "Expire Date", name: "expire_date", type: "date", required: true, col: 12, value: dayjs().add(7, "days").format("YYYY-MM-DD") },

    { label: "Title", name: "title", type: "text", required: true, col: 24, placeholder: "Reward Name" },
    { label: "Short Description", name: "short_description", type: "text", required: true, col: 24, placeholder: "Short Description" },
    { label: "Detail", name: "detail", type: "textarea", required: true, col: 24, placeholder: "Add Detail" },
    { label: "Condition", name: "condition", type: "textarea", required: true, col: 24, placeholder: "Add Condition" },

    { label: "Show Value", name: "show_value", type: "text", required: false, col: 8, placeholder: "Value" },
    { label: "Real Value", name: "real_value", type: "text", required: false, col: 8, placeholder: "Value" },
    {
      label: "Status", name: "status", type: "select", required: true, col: 8, options: [
        { name: "Active", id: 1 },
        { name: "Inactive", id: 0 },
      ], value: 1
    },
  ];

  // 🔹 Handle Form Submission
  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Ensure date format is correct before submission
      values.date = dayjs(values.date).format("YYYY-MM-DD");
      values.expire_date = dayjs(values.expire_date).format("YYYY-MM-DD");

      console.log("Form Data:", values);

      showNotification("success", "Promotion Created", "Your promotion has been successfully created.");
      navigate("/setting/promotion");
    } catch (error) {
      console.error("Validation Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create</div>

      <FormCustom fields={formFields} form={form} />

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        <ActionButton text="Save" mode="save" onClick={handleSave} />
      </div>
    </MainLayout>
  );
}
