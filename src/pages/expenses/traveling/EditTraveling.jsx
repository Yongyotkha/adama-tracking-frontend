import React, { useState } from "react";
import { Input } from "antd";
import MainLayout from "../../../layouts/MainLayout";
import FormCustom from "../../../components/form_custom/FormCustom";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import NumericInput from "../../../components/numeric_input/NumericInput";

export default function EditTraveling() {
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

  // Function to add a new row
  const addRow = () => {
    const newRow = {
      key: `${dataSource.length + 1}`,
      date: "",
      from: "",
      to: "",
      mileage: "0",
      petrol: "0",
      cashPetrol: "0",
      hotel: "0",
      allowance: "0",
      tollFee: "0",
      entertain: "0",
      others: "0",
      total: "0",
      remark: "",
    };
    setDataSource([...dataSource, newRow]);
  };

  // Update individual cell values
  const updateField = (key, field, value) => {
    setDataSource((prevData) =>
      prevData.map((item) =>
        item.key === key ? { ...item, [field]: value, total: calculateTotal(item) } : item
      )
    );
  };

  // Calculate total for each row
  const calculateTotal = (item) =>
    ["mileage", "petrol", "cashPetrol", "hotel", "allowance", "tollFee", "entertain", "others"]
      .reduce((acc, field) => acc + parseFloat(item[field] || 0), 0);

  // Calculate total for the footer
  const calculateFooterTotal = (field) =>
    dataSource.reduce((acc, item) => acc + parseFloat(item[field] || 0), 0);

  const formFields = [
    { label: "Month", name: "Month", type: "month", disabled: false, required: true, col: 6, value: "2024-08" },
    { label: "Date", name: "date", type: "date", disabled: false, required: true, col: 6, value: "2024-01-01" },
  ];

  // Table headers for the Traveling section
  const header = [
    {
      title: <span className="text-nowrap">Date</span>,
      dataIndex: "date",
      key: "date",
      render: (value, record) => (
        <Input
          value={value}
          style={{ width: 120 }}
          onChange={(e) => updateField(record.key, 'date', e.target.value)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Traveling From</span>,
      dataIndex: "from",
      key: "from",
      render: (value, record) => (
        <Input
          value={value}
          style={{ width: 120 }}
          onChange={(e) => updateField(record.key, 'from', e.target.value)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">To</span>,
      dataIndex: "to",
      key: "to",
      render: (value, record) => (
        <Input
          value={value}
          style={{ width: 120 }}
          onChange={(e) => updateField(record.key, 'to', e.target.value)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Mileage</span>,
      dataIndex: "mileage",
      key: "mileage",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={value}
          onChange={(val) => updateField(record.key, 'mileage', val)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Petrol</span>,
      dataIndex: "petrol",
      key: "petrol",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={value}
          onChange={(val) => updateField(record.key, 'petrol', val)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Cash Petrol</span>,
      dataIndex: "cashPetrol",
      key: "cashPetrol",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={value}
          onChange={(val) => updateField(record.key, 'cashPetrol', val)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Hotel</span>,
      dataIndex: "hotel",
      key: "hotel",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={value}
          onChange={(val) => updateField(record.key, 'hotel', val)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Allowance</span>,
      dataIndex: "allowance",
      key: "allowance",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={value}
          onChange={(val) => updateField(record.key, 'allowance', val)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Toll Fee</span>,
      dataIndex: "tollFee",
      key: "tollFee",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={value}
          onChange={(val) => updateField(record.key, 'tollFee', val)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Entertain</span>,
      dataIndex: "entertain",
      key: "entertain",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={value}
          onChange={(val) => updateField(record.key, 'entertain', val)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Others</span>,
      dataIndex: "others",
      key: "others",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={value}
          onChange={(val) => updateField(record.key, 'others', val)}
        />
      ),
    },
    {
      title: <span className="text-nowrap">Total</span>,
      dataIndex: "total",
      key: "total",
      render: (value, record) => (
        <NumericInput
          style={{ width: 100 }}
          value={value}
          onChange={(val) => updateField(record.key, 'total', val)}
          readOnly
        />
      ),
    },
    {
      title: <span className="text-nowrap">Remark</span>,
      dataIndex: "remark",
      key: "remark",
      render: (text) => (
        <Input style={{ width: 250 }} defaultValue={text} />
      ),
    },
  ];
  

  const footerOrderList = () => (
    <tr className="bg-[#978B87] text-white text-start">
      <td colSpan={3}>Total (THB)</td>
      <td><Input value={calculateFooterTotal("mileage")} readOnly /></td>
      <td><Input value={calculateFooterTotal("petrol")} readOnly /></td>
      <td><Input value={calculateFooterTotal("cashPetrol")} readOnly /></td>
      <td><Input value={calculateFooterTotal("hotel")} readOnly /></td>
      <td><Input value={calculateFooterTotal("allowance")} readOnly /></td>
      <td><Input value={calculateFooterTotal("tollFee")} readOnly /></td>
      <td><Input value={calculateFooterTotal("entertain")} readOnly /></td>
      <td><Input value={calculateFooterTotal("others")} readOnly /></td>
      <td><Input value={calculateFooterTotal("total")} readOnly /></td>
      <td></td>
    </tr>
  );

  return (
    <MainLayout loading={loading}>
      <div className="flex justify-between">
        <div className="title-page">Edit Traveling Expense</div>
      </div>

      {/* Form Section */}
      <FormCustom fields={formFields} />

      {/* Traveling Section */}
      <BoxPrimary>
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-lg font-semibold">Traveling</span>
          <ActionButton mode="add" text="Add" onClick={addRow} />
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
        <Input.TextArea placeholder="Remark" rows={2} />
      </BoxPrimary>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/expenses/traveling")} />
        <ActionButton mode="save" text="Save" onClick={() => navigate("/expenses/traveling")} />
      </div>
    </MainLayout>
  );
}
