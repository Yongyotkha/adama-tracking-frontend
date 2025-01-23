import React, { useRef, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { useNavigate, useParams } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import FormCustom from "../../../components/form_custom/FormCustom";
import FileUploadComponent from "../../../components/file_upload/FileUploadComponent";

export default function ActionMaterial() {
  const { mode } = useParams(); // Get the mode (create, edit, view) from the URL
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fileUploadRef = useRef(null);

  const handleUploadSuccess = (response) => {
    console.log("File uploaded successfully:", response);
  };

  const formFields = [
    {
      label: "Material Expense Code",
      name: "material_expense_code",
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
      label: "Unit Price",
      name: "unit_price_1",
      type: "text",
      placeholder: "Unit Price",
      col: 6,
      required: true,
      disabled: mode === "view",
    },
    {
      label: "Unit Price",
      name: "unit_price_2",
      type: "text",
      placeholder: "Unit Price",
      col: 6,
      required: true,
      disabled: mode === "view",
    },
    {
      label: "Photo",
      name: "photo",
      type: "custom",
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
      label: "Remark",
      name: "remark",
      type: "text",
      placeholder: "Remark",
      col: 24,
      disabled: mode === "view",
    },
  ];

  const renderTitle = () => {
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

  const handleSubmit = () => {
    console.log("Form submitted");
    navigate("/setting/material");
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">{renderTitle()}</div>

      <FormCustom fields={formFields} />

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
