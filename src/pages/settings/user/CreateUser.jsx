import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";
import DynamicButton from "../../../components/button/DynamicButton";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";

export default function CreateUser() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {}, []);

  const handleBack = () => {
    navigate("/setting/user");
  };

  const handleSave = () => {
    navigate("/setting/user");
  };

  const formFields = [
    {
      label: "Name (EN)",
      name: "name_en",
      type: "text",
      required: true,
      col: 6,
    },
    {
      label: "Name (TH)",
      name: "name_th",
      type: "text",
      required: true,
      col: 6,
    },
    {
      label: "Sales Employee Code",
      name: "employee_code",
      type: "text",
      required: true,
      col: 6,
      disabled: true,
    },
    {
      label: "Contact Number",
      name: "contact_number",
      type: "tel",
      required: true,
      col: 6,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: false,
      col: 6,
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      required: false,
      col: 12,
    },
    {
      label: "Position",
      name: "position",
      type: "select",
      required: true,
      col: 6,
      options: ["Sales Assistant", "Manager", "Team Lead"],
    },
    {
      label: "Department",
      name: "department",
      type: "select",
      required: false,
      col: 6,
      options: ["Sales Team", "Marketing Team", "Support Team"],
    },
    {
      label: "Territory",
      name: "territory",
      type: "text",
      required: false,
      col: 6,
    },
    {
      label: "Area",
      name: "area",
      type: "text",
      required: false,
      col: 6,
    },
    {
      label: "Role",
      name: "role",
      type: "select",
      required: true,
      col: 6,
      options: ["Individual Module", "Admin Module", "Viewer"],
    },
    {
      label: "Date of Joining",
      name: "date_of_joining",
      type: "date",
      required: false,
      col: 6,
    },
    {
      label: "Status",
      name: "status",
      type: "select",
      required: false,
      col: 6,
      options: ["Active", "Inactive"],
    },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create User</div>

      <FormUser fields={formFields} />
      <div className="flex justify-end space-x-4">
        <ActionButton text="Back" mode="back" onClick={handleBack} />
        <ActionButton text="Save" mode="save" onClick={handleSave} />
      </div>
    </MainLayout>
  );
}
