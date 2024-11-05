import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";

export default function CreatePromotion() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { }, []);

  const formFields = [
    { label: "Name", name: "name", type: "text", required: false, col: 12, },
    { label: "Description ", name: "description", type: "text", required: false, col: 12, },
    { label: "Value (THB)", name: "value_thb", type: "text", required: false, col: 6, options: ["Special", "Commodity", "3rd Party", "SAS"], },
    { label: "Status", name: "status", type: "select", required: false, col: 6, options: ["Active", "Inactive"], },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Promotion</div>

      <FormUser fields={formFields} />

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/setting/promotion")} />
        <ActionButton mode="save" text="Save" onClick={() => navigate("/setting/promotion")} />
      </div>

    </MainLayout>
  );
}
