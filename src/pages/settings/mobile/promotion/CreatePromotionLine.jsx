import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import FormUser from "../../../../components/form_user/FormUser";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../../components/button/ActionButton";
import { Form, Select, Input, Button } from "antd";
import { AuthContext } from "../../../../contexts/AuthContext";
import dayjs from "dayjs";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../../components/table/TableComponent";
import { DeleteOutlined } from "@ant-design/icons";

export default function CreatePromotionLine() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { showNotification } = useContext(AuthContext);

  // 🔹 Mock Data for Extra Point Table
  const [dataSourceExtraPoint, setDataSourceExtraPoint] = useState([
    { key: 1, start_bath: 100, end_bath: 100, point: 10 },
    { key: 2, start_bath: 100, end_bath: 100, point: 10 },
  ]);

  // 🔹 Table Headers
  const headerExtraPoint = [
    { title: "No", dataIndex: "key", align: "center", width: 50 },
    {
      title: "Start Bath",
      dataIndex: "start_bath",
      align: "center",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleEditRow(index, "start_bath", e.target.value)}
        />
      ),
    },
    {
      title: "End Bath",
      dataIndex: "end_bath",
      align: "center",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleEditRow(index, "end_bath", e.target.value)}
        />
      ),
    },
    {
      title: "Point",
      dataIndex: "point",
      align: "center",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => handleEditRow(index, "point", e.target.value)}
        />
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      width: 50,
      render: (_, record) => (
        <button
          onClick={() => handleDeleteRow(record.key)}
          className="delete-button"
        >
          <img
            src="/img/icons/delete.png"
            alt="delete"
            className="cursor-pointer w-5 h-5"
          />
        </button>
      ),
    },
  ];

  // 🔹 Form Fields
  const formFields = [
    { label: "Promotion Name", name: "promotion_name", type: "text", required: true, col: 12 },
    { label: "Period From", name: "period_from", type: "date", required: true, col: 6, value: dayjs("2025-01-01") },
    { label: "Period To", name: "period_to", type: "date", required: true, col: 6, value: dayjs("2025-03-01") },
    { label: "Type", name: "type", type: "radio", required: true, col: 6, options: [
      { name: "Double Point", id: "double_point", selected: true },
      { name: "Extra Point", id: "extra_point", selected: false },
    ]},
    { label: "Target", name: "target", type: "radio", required: true, col: 6, options: [
      { name: "Crop", id: "crop", selected: true },
      { name: "Dealer", id: "dealer", selected: false },
      { name: "All Customer", id: "all_customer", selected: false },
    ]},
    { label: "Apply To", name: "apply_to", type: "radio", required: true, col: 6, options: [
      { name: "Select Product", id: "select_product", selected: true },
      { name: "All Product", id: "all_product", selected: false },
    ]},
    { label: "Status", name: "status", type: "select", required: true, col: 6, options: [
      { name: "Active", id: 1, selected: true },
      { name: "Inactive", id: 0, selected: false },
    ], value: 1 },
  ];

  // 🔹 Handle Adding New Row
  const handleAddRow = () => {
    const newKey = dataSourceExtraPoint.length + 1;
    setDataSourceExtraPoint([
      ...dataSourceExtraPoint,
      { key: newKey, start_bath: 0, end_bath: 0, point: 0 },
    ]);
  };

  // 🔹 Handle Editing Rows
  const handleEditRow = (index, field, value) => {
    const newData = [...dataSourceExtraPoint];
    newData[index][field] = value;
    setDataSourceExtraPoint(newData);
  };

  // 🔹 Handle Deleting Row
  const handleDeleteRow = (key) => {
    setDataSourceExtraPoint(dataSourceExtraPoint.filter((row) => row.key !== key));
  };

  // 🔹 Handle Form Submission
  const handleSave = () => {
    form.validateFields()
      .then((values) => {
        console.log("Form Data:", values);
        showNotification("success", "Promotion Created", "Your promotion has been successfully created.");
        navigate("/setting/promotion");
      })
      .catch((error) => {
        console.error("Validation Failed:", error);
      });
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Customer Group</div>

      <FormUser fields={formFields} form={form} />

      {/* 🔹 Extra Point Table */}
      <BoxPrimary>
        <div className="flex justify-between space-x-4 mb-3">
          <span className="text-[#00783F] text-lg font-semibold">Extra Point</span>
          <ActionButton mode="add" text="Add" onClick={handleAddRow} />
        </div>
        <TableComponent
          header={headerExtraPoint}
          dataSource={dataSourceExtraPoint}
          pageSize={10}
        />
      </BoxPrimary>

      {/* 🔹 Select Boxes for Crop, Dealer, Product */}
      <BoxPrimary title="Crop">
        <Select mode="multiple" showSearch placeholder="Select Crop(s)" optionFilterProp="children" className="w-full" />
      </BoxPrimary>

      <BoxPrimary title="Dealer">
        <Select mode="multiple" showSearch placeholder="Select Dealer(s)" optionFilterProp="children" className="w-full" />
      </BoxPrimary>

      <BoxPrimary title="Product">
        <Select mode="multiple" showSearch placeholder="Select Product(s)" optionFilterProp="children" className="w-full" />
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        <ActionButton text="Save" mode="save" onClick={handleSave} />
      </div>
    </MainLayout>
  );
}
