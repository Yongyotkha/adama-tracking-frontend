import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";
import DynamicButton from "../../../components/button/DynamicButton";
import { useNavigate } from "react-router-dom";

export default function EditUser() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {}, []);

  const handleBack = () => {
    navigate('/setting/user');
  };

  const handleSave = () => {
    navigate('/setting/user');
  };

  const formFields = [
    { label: "Name (EN)", name: "name_en", type: "text", required: true },
    { label: "Name (TH)", name: "name_th", type: "text", required: true },
    { label: "Sales Employee Code", name: "employee_code", type: "text", required: true },
    { label: "Contact Number", name: "contact_number", type: "tel", required: true },
    { label: "Email", name: "email", type: "email", required: false },
    { label: "Address", name: "address", type: "text", required: false },
    { label: "Department", name: "department", type: "select", required: false, options: ["Sales Team", "Marketing Team", "Support Team"] },
    { label: "Territory", name: "territory", type: "text", required: false },
    { label: "Area", name: "area", type: "text", required: false },
    { label: "Date of Joining", name: "date_of_joining", type: "date", required: false },
    { label: "Status", name: "status", type: "select", required: false, options: ["Active", "Inactive"] },
    { label: "Position", name: "position", type: "select", required: true, options: ["Sales Assistant", "Manager", "Team Lead"] },
    { label: "Role", name: "role", type: "select", required: true, options: ["Individual Module", "Admin Module", "Viewer"] }
  ];
  
  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create User</div>
      
      <FormUser fields={formFields} />

      <div className="flex justify-end space-x-4">
        <DynamicButton
          text="Back"
          className="bg-[#B6AEAB] min-w-[96px] text-[#ffff] rounded-sm p-2"
          onClick={handleBack}
        />
        <DynamicButton
          text="Save"
          className="bg-[#00783F] min-w-[96px] text-[#ffff] rounded-sm p-2"
          onClick={handleSave}
        />
      </div>
    </MainLayout>
  );
}
