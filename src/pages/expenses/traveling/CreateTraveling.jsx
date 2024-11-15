import React, { useState } from "react";
import { Input } from "antd";
import MainLayout from "../../../layouts/MainLayout";
import FormCustom from "../../../components/form_custom/FormCustom";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import NumericInput from "../../../components/numeric_input/NumericInput";

export default function CreateTraveling() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Table data source
  const [dataSource, setDataSource] = useState([
    {
      key: "1",
      date: "01-08-2024",
      from: "กรุงเทพ",
      to: "สิงห์บุรี",
      mileage: "0",
      petrol: "0",
      cashPetrol: "1260",
      hotel: "0",
      allowance: "400",
      tollFee: "0",
      entertain: "0",
      others: "0",
      total: "1660",
      remark: "ไป-กลับ กทม สิงบุรี ลงแปลง อ้อย",
    },
    {
      key: "2",
      date: "01-08-2024",
      from: "กรุงเทพ",
      to: "สิงห์บุรี",
      mileage: "0",
      petrol: "0",
      cashPetrol: "3200",
      hotel: "0",
      allowance: "1200",
      tollFee: "0",
      entertain: "0",
      others: "0",
      total: "4400",
      remark: "ไป-กลับ กทม สิงบุรี ลงแปลง อ้อย",
    },
  ]);

  // Form fields at the top
  const formFields = [
    { label: "Month", name: "Month", type: "month", disabled: false, required: true, col: 6, value: "2024-08" },
    { label: "Date", name: "date", type: "date", disabled: false, required: true, col: 6, value: "2024-01-01" },
  ];

  // Table headers for the Traveling section
  const header = [
    {
      title: <span className="text-nowrap">Date</span>, dataIndex: "date", key: "date", // Set specific width
      render: (value, record) => (
        <Input value={value} style={{ width: 120 }} onChange={(e) => updateField(record.key, 'date', e.target.value)} />
      )
    },
    { title: <span className="text-nowrap">Traveling From</span>, dataIndex: "from", key: "from" },
    { title: <span className="text-nowrap">To</span>, dataIndex: "to", key: "to" },
    { title: <span className="text-nowrap">Mileage</span>, dataIndex: "mileage", key: "mileage", render: (value, record) => <NumericInput style={{ width: 100 }} value={value} onChange={(val) => updateField(record.key, 'mileage', val)} /> },
    { title: <span className="text-nowrap">Petrol</span>, dataIndex: "petrol", key: "petrol", render: (value, record) => <NumericInput style={{ width: 100 }} value={value} onChange={(val) => updateField(record.key, 'petrol', val)} /> },
    { title: <span className="text-nowrap">Cash Petrol</span>, dataIndex: "cashPetrol", key: "cashPetrol", render: (value, record) => <NumericInput style={{ width: 100 }} value={value} onChange={(val) => updateField(record.key, 'cashPetrol', val)} /> },
    { title: <span className="text-nowrap">Hotel</span>, dataIndex: "hotel", key: "hotel", render: (value, record) => <NumericInput style={{ width: 100 }} value={value} onChange={(val) => updateField(record.key, 'hotel', val)} /> },
    { title: <span className="text-nowrap">Allowance</span>, dataIndex: "allowance", key: "allowance", render: (value, record) => <NumericInput style={{ width: 100 }} value={value} onChange={(val) => updateField(record.key, 'allowance', val)} /> },
    { title: <span className="text-nowrap">Toll Fee</span>, dataIndex: "tollFee", key: "tollFee", render: (value, record) => <NumericInput style={{ width: 100 }} value={value} onChange={(val) => updateField(record.key, 'tollFee', val)} /> },
    { title: <span className="text-nowrap">Entertain</span>, dataIndex: "entertain", key: "entertain", render: (value, record) => <NumericInput style={{ width: 100 }} value={value} onChange={(val) => updateField(record.key, 'entertain', val)} /> },
    { title: <span className="text-nowrap">Others</span>, dataIndex: "others", key: "others", render: (value, record) => <NumericInput style={{ width: 100 }} value={value} onChange={(val) => updateField(record.key, 'others', val)} /> },
    { title: <span className="text-nowrap">Total</span>, dataIndex: "total", key: "total", render: (value, record) => <NumericInput style={{ width: 100 }} value={value} onChange={(val) => updateField(record.key, 'total', val)} readOnly /> },
    { title: <span className="text-nowrap">Remark</span>, dataIndex: "remark", key: "remark", render: (text) => <Input style={{ width: 250 }} defaultValue={text} /> },
  ];

  // Function to update field in dataSource
  const updateField = (key, field, value) => {
    setDataSource((prevData) =>
      prevData.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
  };

  // Total Footer
  const footerOrderList = () => (
    <tr className="bg-[#978B87] text-white text-start">
      <td colSpan={4}>Total (THB)</td>
      <td><Input defaultValue='0' readOnly /></td>
      <td><Input defaultValue='1260' readOnly /></td>
      <td><Input defaultValue='0' readOnly /></td>
      <td><Input defaultValue='400' readOnly /></td>
      <td><Input defaultValue='0' readOnly /></td>
      <td><Input defaultValue='0' readOnly /></td>
      <td><Input defaultValue='0' readOnly /></td>
      <td><Input defaultValue='1660' readOnly /></td>
      <td></td>
    </tr>
  );

  return (
    <MainLayout loading={loading}>
      <div className="flex justify-between">
        <div className="title-page">Create Traveling Expense</div>
      </div>

      {/* Form Section */}
      <FormCustom fields={formFields} />

      {/* Traveling Section */}
      <BoxPrimary>
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-lg font-semibold">Traveling</span>
        </div>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pageSize={10}
          footer={footerOrderList}
        />
      </BoxPrimary>

      {/* Total Expense Summary */}
      <BoxPrimary>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-end">Total Advanced:</div>
          <NumericInput value="26080" disabled />

          <div className="flex justify-end">Total Expenses:</div>
          <NumericInput value="26080" disabled />

          <div className="flex justify-end">Return to Company:</div>
          <NumericInput value="0" disabled />

          <div className="flex justify-end">Return to Staff:</div>
          <NumericInput value="26080" disabled />
        </div>
      </BoxPrimary>

      {/* Remark Section */}
      <BoxPrimary title="Remark">
        <Input.TextArea placeholder="Remark" rows={3} />
      </BoxPrimary>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/expenses/traveling")} />
        <ActionButton mode="save" text="Save" onClick={() => navigate("/expenses/traveling")} />
      </div>
    </MainLayout>
  );
}
