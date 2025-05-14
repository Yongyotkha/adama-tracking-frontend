import React, { useRef, useState, useEffect, useContext } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { useNavigate, useParams } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import FormCustom from "../../../components/form_custom/FormCustom";
import FileUploadComponent from "../../../components/file_upload/FileUploadComponent";
import { AuthContext } from "../../../contexts/AuthContext";
import { Form, Input, InputNumber, Select } from "antd";
export default function ActionMaterial() {
  const renderTitle = () => {
    console.log('mode : ', mode)
    switch (mode) {
      case "create":
        return "Create Material";
      case "edit":
        return "Edit Material";
      case "view":
        return "View Material";
      default:
        return "Material";
    }
  };

  const { mode } = useParams(); // Get the mode (create, edit, view) from the URL
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fileUploadRef = useRef(null);
  const { showMsg, showNotification, userInfo } = useContext(AuthContext);

  const [formCustom] = Form.useForm();
  const handleUploadSuccess = (response) => {
    console.log("File uploaded successfully:", response);
  };

  const handleSubmit = async () => {
    try {
      const values = await formCustom.validateFields();
      console.log("payload to submit:", values);
    } catch (error) {
      console.log("Validation or submission error : ", error);
      showMsg("error", error.message || "กรุณากรอกข้อมูลให้ครบถ้วน");
    }
  };

  const formFields = [
    {
      label: "Photo",
      name: "photo",
      type: "photo",
      col: 24,
      component: (
        <FileUploadComponent
          ref={fileUploadRef}
          dataFile={[]}
          mode={mode}
          onUploadSuccess={handleUploadSuccess}
        />
      ),
    },
    {
      label: "Material Code",
      name: "material_code",
      type: "text",
      value: "Generate",
      col: 6,
      disabled: true,
    },
    {
      label: "Material Name",
      name: "material_name",
      type: "text",
      placeholder: "Material Name",
      required: true,
      col: 6,
      disabled: mode === "view",
    },
    {
      label: "Crop",
      name: "crop",
      type: "select",
      options: [
        { id: "1", name: "Rice" },
        { id: "2", name: "Corn" },
      ],
      required: true,
      col: 6,
      disabled: mode === "view",
    },
    {
      label: "Product",
      name: "product",
      type: "select",
      options: [
        { id: "1", name: "Apopo" },
        { id: "2", name: "Bumper" },
      ],
      required: true,
      col: 6,
      disabled: mode === "view",
    },
    {
      label: "Description",
      name: "description",
      type: "text-editor",
      placeholder: "Add description",
      required: false,
      col: 24,
      disabled: mode === "view",
    },
    {
      label: "Type",
      name: "type",
      type: "text",
      placeholder: "PPB",
      col: 6,
      disabled: mode === "view",
    },
    {
      label: "Size",
      name: "size",
      type: "text",
      placeholder: "80x60",
      col: 6,
      disabled: mode === "view",
    },
    {
      label: "QTY",
      name: "qty",
      type: "text",
      placeholder: "10",
      col: 6,
      required: true,
      disabled: mode === "view",
    },
    {
      label: "Unit Price",
      name: "price",
      type: "text",
      placeholder: "Unit Price",
      col: 6,
      required: true,
      disabled: mode === "view",
    },
    {
      label: "Remark",
      name: "remark",
      type: "text",
      placeholder: "Remark",
      col: 24,
      disabled: mode === "view",
    },
  ];

  const handleChange = (filter, value) => {
    console.log("filter", filter, "value", value);
  };


  return (
    <MainLayout loading={loading}>
      <div className="title-page">{renderTitle()}</div>

      <FormCustom
        fields={formFields}
        form={formCustom}
        onChange={handleChange}

      />

      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/setting/material")}
        />
        {mode !== "view" && (
          <ActionButton
            mode="update"
            text={mode === "create" ? "Create" : "Save"}
            onClick={handleSubmit}
          />
        )}
      </div>
    </MainLayout>
  );
}
