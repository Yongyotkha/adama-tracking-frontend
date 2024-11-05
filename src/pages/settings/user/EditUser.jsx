import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";
import DynamicButton from "../../../components/button/DynamicButton";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";

export default function EditUser() {
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
      value: "John Doe",
    },
    {
      label: "Name (TH)",
      name: "name_th",
      type: "text",
      required: true,
      col: 6,
      value: "จอห์น โด",
    },
    {
      label: "Sales Employee Code",
      name: "employee_code",
      type: "text",
      required: true,
      col: 6,
      disabled: true,
      value: "SM123",
    },
    {
      label: "Contact Number",
      name: "contact_number",
      type: "tel",
      required: true,
      col: 6,
      value: "0812345678",
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: false,
      col: 6,
      value: "john.doe@example.com",
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      required: false,
      col: 12,
      value: "123 Main St, Bangkok",
    },
    {
      label: "Position",
      name: "position",
      type: "select",
      required: true,
      col: 6,
      options: ["Sales Assistant", "Manager", "Team Lead"],
      value: "Manager",
    },
    {
      label: "Department",
      name: "department",
      type: "select",
      required: false,
      col: 6,
      options: ["Sales Team", "Marketing Team", "Support Team"],
      value: "Sales Team",
    },
    {
      label: "Territory",
      name: "territory",
      type: "text",
      required: false,
      col: 6,
      value: "North",
    },
    {
      label: "Area",
      name: "area",
      type: "text",
      required: false,
      col: 6,
      value: "Zone 1",
    },
    {
      label: "Role",
      name: "role",
      type: "select",
      required: true,
      col: 6,
      options: ["Individual Module", "Admin Module", "Viewer"],
      value: "Admin Module",
    },
    {
      label: "Date of Joining",
      name: "date_of_joining",
      type: "date",
      required: false,
      col: 6,
      value: null,
    },
    {
      label: "Status",
      name: "status",
      type: "select",
      required: false,
      col: 6,
      options: ["Active", "Inactive"],
      value: "Active",
    },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Edit User</div>

      <FormUser profile="/img/profile.jpg" fields={formFields} />

      <div className="flex justify-end space-x-4">
        <ActionButton text="Back" mode="back" onClick={handleBack} />
        <ActionButton text="Update" mode="update" onClick={handleSave} />
      </div>
    </MainLayout>
  );
}
