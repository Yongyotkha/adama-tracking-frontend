import React, { useContext, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import FormCustom from "../../../../components/form_custom/FormCustom";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../../components/button/ActionButton";
import { Form, Input } from "antd";
import { AuthContext } from "../../../../contexts/AuthContext";
import dayjs from "dayjs";
import TableComponent from "../../../../components/table/TableComponent";

export default function CreateRewardCampaign() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { showNotification } = useContext(AuthContext);

  // ✅ Form field definition
  const formFields = [
    {
      label: "Banner",
      name: "banner",
      type: "photo",
      required: true,
      col: 24,
      accept: "image/png, image/jpeg",
    },
    {
      label: "Reward Code",
      name: "code",
      type: "text",
      required: false,
      col: 12,
      placeholder: "Generate",
      disabled: true,
    },
    {
      label: "Category",
      name: "category",
      type: "select",
      required: true,
      col: 12,
      options: [], // TODO: populate from API
    },
    {
      label: "Reward Name",
      name: "name",
      type: "text",
      required: true,
      col: 24,
      placeholder: "Enter",
    },
    {
      label: "Detail",
      name: "description",
      type: "text",
      required: true,
      col: 24,
      placeholder: "Enter",
    },
    {
      label: "Condition",
      name: "condition",
      type: "text",
      required: true,
      col: 24,
      placeholder: "Enter",
    },
    {
      label: "Product Detail",
      name: "product_detail",
      type: "text",
      required: true,
      col: 24,
      placeholder: "Enter",
    },
    {
      label: "Stock (Pcs)",
      name: "stock",
      type: "text",
      required: true,
      col: 8,
      placeholder: "Enter",
    },
    {
      label: "Period Date",
      name: "date_range",
      type: "date", // DateRange
      required: true,
      col: 8,
      placeholder: "Start date — End date",
    },
    {
      label: "Cost (THB)",
      name: "cost",
      type: "text",
      required: false,
      col: 4,
      placeholder: "Enter",
    },
    {
      label: "Campaign Publish",
      name: "use_flag",
      type: "switch",
      required: false,
      col: 4,
      value: true,
    },
  ];

  // ✅ Target Table Data
  const [targetData, setTargetData] = useState([
    { id: 1, target_name: "Dealer", type_name: "Star" },
    { id: 2, target_name: "Dealer", type_name: "Non Star" },
    { id: 3, target_name: "Sub Dealer", type_name: "Push" },
    { id: 4, target_name: "Sub Dealer", type_name: "Pull" },
    { id: 5, target_name: "Sub Dealer", type_name: "หน้าร้าน" },
    { id: 6, target_name: "Farmer", type_name: "KOL" },
    { id: 7, target_name: "Farmer", type_name: "Big Farmer" },
    { id: 8, target_name: "Farmer", type_name: "General" },
  ]);

  // ✅ Handle input change in table
  const handleTargetChange = (value, index, field) => {
    const updated = [...targetData];
    updated[index][field] = value;
    setTargetData(updated);
  };

  // ✅ Columns for TableComponent
  const targetColumns = [
    {
      title: "No",
      dataIndex: "id",
      key: "id",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Target Name",
      dataIndex: "target_name",
      key: "target_name",
    },
    {
      title: "Type Name",
      dataIndex: "type_name",
      key: "type_name",
    },
    {
      title: "Points",
      dataIndex: "points",
      key: "points",
      render: (_, __, index) => (
        <Input
          placeholder="Enter"
          value={targetData[index]?.points}
          onChange={(e) => handleTargetChange(e.target.value, index, "points")}
        />
      ),
    },
    {
      title: "Value (THB)",
      dataIndex: "value",
      key: "value",
      render: (_, __, index) => (
        <Input
          placeholder="Enter"
          value={targetData[index]?.value}
          onChange={(e) => handleTargetChange(e.target.value, index, "value")}
        />
      ),
    },
  ];

  // ✅ Form Submission
  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const payload = {
        ...values,
        date_start: dayjs(values.date_range?.[0]).format("YYYY-MM-DD"),
        date_end: dayjs(values.date_range?.[1]).format("YYYY-MM-DD"),
        use_flag: values.use_flag ? "1" : "0",
        targets: targetData.map((t) => ({
          target_name: t.target_name,
          type_name: t.type_name,
          points: t.points || "",
          value: t.value || "",
        })),
      };

      delete payload.date_range;

      console.log("Payload:", payload);

      showNotification("success", "Reward Created", "Campaign has been saved.");
      navigate("/point/reward");
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Reward Campaign</div>

      <FormCustom fields={formFields} form={form} />

      <div className="mt-8 font-semibold text-lg">Target</div>
      <TableComponent
        header={targetColumns}
        dataSource={targetData}
        pagination={false}
        scroll
      />

      <div className="flex justify-end gap-4 mt-6">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        <ActionButton text="Save" mode="save" onClick={handleSave} />
      </div>
    </MainLayout>
  );
}
