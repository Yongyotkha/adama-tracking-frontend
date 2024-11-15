import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import FormCustom from "../../components/form_custom/FormCustom";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../components/button/ActionButton";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TableComponent from "../../components/table/TableComponent";

export default function EditOrder() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // State for Order List table data
  const [dataSource, setDataSource] = useState([
    {
      key: "1",
      no: "1",
      sku: "3027200113",
      productName: "Bumper P",
      unit: "0.5 ltX20",
      pricePerUnit: '575.50',
      quantity: 0,
      foc: 1,
      subTotal: '115000',
    },
    {
      key: "2",
      no: "2",
      sku: "207920011520",
      productName: "Memory 300EC",
      unit: "1lt X20",
      pricePerUnit: '340',
      quantity: 0,
      foc: 2,
      subTotal: '68000',
    },
  ]);

  // State for Other table data
  const [dataSourceOther, setDataSourceOther] = useState([
    { key: "1", no: "1", productName: "", unit: "", quantity: 1, value: 10000 },
    { key: "2", no: "2", productName: "", unit: "", quantity: 1, value: 20000 }
  ]);

  const formFields = [
    { label: "Sale", name: "sale", type: "select", options: ["Chayanon Tunyateerapong", "Chaiyapat"], disabled: false, required: false, value: "Select" },
    { label: "Dealer", name: "dealer", type: "select", options: ["Kornkan Induang", "	Phaisan Jethuen"], disabled: false, required: false, value: "Select" },
    { label: "Order No", name: "order_no", type: "text", disabled: true, required: false, value: "Generate Auto" },
    { label: "Date", name: "order_date", type: "date", disabled: true, required: false, value: "" },
  ];

  const handleSearch = (e) => {
    console.log("Search term:", e.target.value);
  };

  const handleQuantityChange = (key, newQuantity) => {
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key === key) {
          const quantity = Math.max(0, newQuantity); // Prevent negative quantities
          const subTotal = (quantity * parseFloat(item.pricePerUnit.replace(/,/g, ""))).toFixed(2); // Calculate new subTotal
          return { ...item, quantity, subTotal };
        }
        return item;
      })
    );
  };

  const handleQuantityChangeOther = (key, newQuantity) => {
    const baseUnitPrice = 10000; // Base price for calculation, assuming 10,000 per unit
  
    setDataSourceOther((prevData) =>
      prevData.map((item) => {
        if (item.key === key) {
          const quantity = Math.max(1, newQuantity); // Prevent quantity less than 1
          const value = quantity * baseUnitPrice; // Calculate new value based on quantity
          return { ...item, quantity, value };
        }
        return item;
      })
    );
  };
  
  const handleAddOtherRow = () => {
    const newRow = {
      key: (dataSourceOther.length + 1).toString(),
      no: (dataSourceOther.length + 1).toString(),
      productName: "",
      unit: "",
      quantity: 1,
      value: '10000',
    };
    setDataSourceOther([...dataSourceOther, newRow]);
  };

  const handleDeleteOtherRow = (key) => {
    setDataSourceOther(dataSourceOther.filter(item => item.key !== key));
  };

  const handleOtherInputChange = (key, field, value) => {
    setDataSourceOther(dataSourceOther.map(item => item.key === key ? { ...item, [field]: value } : item));
  };

  const header = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Product Name", dataIndex: "productName", key: "productName" },
    { title: "Unit", dataIndex: "unit", key: "unit" },
    {
      title: "THB/Unit", dataIndex: "pricePerUnit", key: "pricePerUnit",
      render: (text) => parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
    },
    {
      title: <div className="text-center">QTY (ctn)</div>,
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) => (
        <div className="quantity-control flex justify-center items-center">
          <img
            src="/img/icons/collapse.png"
            alt="decrease"
            className="cursor-pointer w-6 h-6"
            onClick={() => handleQuantityChange(record.key, record.quantity - 1)}
          />
          <Input
            inputMode="numeric"
            min={0}
            value={record.quantity}
            onChange={(e) => handleQuantityChange(record.key, parseInt(e.target.value) || 0)}
            className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 w-20"
          />
          <img
            src="/img/icons/expand.png"
            alt="increase"
            className="cursor-pointer w-6 h-6"
            onClick={() => handleQuantityChange(record.key, record.quantity + 1)}
          />
        </div>
      ),
    },
    { title: "FOC (ctn)", dataIndex: "foc", key: "foc" },
    {
      title: "Sub Total (THB)",
      dataIndex: "subTotal",
      key: "subTotal",
      render: (text) => parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
    },
    {
      title: <div className="text-center">Action</div>, key: "action", render: (_, record) =>
        <button className="delete-button flex justify-center mx-auto">
          <img
            src="/img/icons/delete.png"
            alt="delete"
            className="cursor-pointer w-6 h-6"
            onClick={() => setDataSource(dataSource.filter((item) => item.key !== record.key))}
          />
        </button>
    },
  ];

  const headerOther = [
    { title: "No", dataIndex: "no", key: "no" },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      render: (_, record) => (
        <Input
          value={record.productName}
          onChange={(e) => handleOtherInputChange(record.key, "productName", e.target.value)}
        />
      )
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      render: (_, record) => (
        <Input
          value={record.unit}
          onChange={(e) => handleOtherInputChange(record.key, "unit", e.target.value)}
        />
      )
    },
    {
      title: <div className="text-center">QTY</div>,
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) => (
        <div className="quantity-control flex justify-center items-center">
          <img
            src="/img/icons/collapse.png"
            alt="decrease"
            className="cursor-pointer w-6 h-6"
            onClick={() => handleQuantityChangeOther(record.key, record.quantity - 1)}
          />
          <Input
            inputMode="numeric"
            min={1}
            value={record.quantity}
            onChange={(e) => handleQuantityChangeOther(record.key, parseInt(e.target.value) || 1)}
            className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 w-20"
          />
          <img
            src="/img/icons/expand.png"
            alt="increase"
            className="cursor-pointer w-6 h-6"
            onClick={() => handleQuantityChangeOther(record.key, record.quantity + 1)}
          />
        </div>
      ),
    },
    {
      title: "Value (THB)",
      dataIndex: "value",
      key: "value",
      render: (text) => parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })
    },
    {
      title: <div className="text-center">Action</div>,
      key: "action",
      render: (_, record) => (
        <button onClick={() => handleDeleteOtherRow(record.key)} className="delete-button">
          <img src="/img/icons/delete.png" alt="delete" className="cursor-pointer w-6 h-6" />
        </button>
      )
    }
  ];

  const footerOrderList = () => {
    const totalQuantity = dataSource.reduce((total, item) => total + item.quantity, 0);
    const totalFOC = dataSource.reduce((total, item) => total + item.foc, 0);
    const totalAmount = dataSource.reduce((total, item) => total + parseFloat(item.subTotal || 0), 0);
  
    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {dataSource.length} &nbsp; QTY (ctn): {totalQuantity}+{totalFOC} &nbsp;
          Total: {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </td>
      </tr>
    );
  };

  const footerOther = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={6} className="text-right pr-2 text-white">
        Item: {dataSourceOther.length} &nbsp; QTY: {dataSourceOther.reduce((total, item) => total + item.quantity, 0)} &nbsp;
        Total: {dataSourceOther.reduce((total, item) => total + parseFloat(item.value.replace(/,/g, "")), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );


  return (
    <MainLayout loading={loading}>
      <div className="title-page">Edit Order</div>

      <FormCustom fields={formFields} />

      <BoxPrimary title="Product">
        <div className="mb-3 flex justify-end">
          <Input
            placeholder="Search Product..."
            prefix={<SearchOutlined className="text-gray-500" />}
            onChange={handleSearch}
          />
        </div>
      </BoxPrimary>

      <BoxPrimary title="Order List">
        <TableComponent
          header={header}
          dataSource={dataSource}
          pageSize={10}
          footer={footerOrderList}
        />
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex justify-between space-x-4 mb-3">
          <span className="text-[#00783F] text-lg font-semibold">Other</span>
          <div className="flex space-x-2">
            <ActionButton mode="add" text="Add" onClick={handleAddOtherRow} />
          </div>
        </div>
        <TableComponent
          header={headerOther}
          dataSource={dataSourceOther}
          pageSize={10}
          footer={footerOther}
        />
      </BoxPrimary>

      <BoxPrimary title='Remark'>
        <div className="mb-3 flex justify-end">
          <Input.TextArea placeholder="Remark" rows={2} />
        </div>
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/order/list")} />
        <ActionButton mode="save" text="Confirm" onClick={() => navigate("/order/list")} />
      </div>
    </MainLayout>
  );
}
