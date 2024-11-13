import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import FormCustom from "../../components/form_custom/FormCustom";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../components/button/ActionButton";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TableComponent from "../../components/table/TableComponent";

export default function CreateOrder() {
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
      pricePerUnit: "575.00",
      quantity: 10,
      foc: 1,
      subTotal: "115,000.00",
    },
    {
      key: "2",
      no: "2",
      sku: "207920011520",
      productName: "Memory 300EC",
      unit: "1lt X20",
      pricePerUnit: "340.00",
      quantity: 10,
      foc: 1,
      subTotal: "68,000.00",
    },
  ]);

  // State for Gift table data
  const [dataSourceGift, setDataSourceGift] = useState([
    { key: "1", no: "1", productName: "", unit: "", quantity: 1 }
  ]);

  const formFields = [
    { label: "Name", name: "name", type: "select", options: ["Active", "Inactive"], disabled: false, required: false, value: "Select" },
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
          const quantity = Math.max(0, newQuantity); // Prevents negative quantities
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const handleAddGiftRow = () => {
    const newRow = {
      key: (dataSourceGift.length + 1).toString(),
      no: (dataSourceGift.length + 1).toString(),
      productName: "",
      unit: "",
      quantity: 1
    };
    setDataSourceGift([...dataSourceGift, newRow]);
  };

  const handleDeleteGiftRow = (key) => {
    setDataSourceGift(dataSourceGift.filter(item => item.key !== key));
  };

  const handleGiftInputChange = (key, field, value) => {
    setDataSourceGift(dataSourceGift.map(item => item.key === key ? { ...item, [field]: value } : item));
  };

  const header = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Product Name", dataIndex: "productName", key: "productName" },
    { title: "Unit", dataIndex: "unit", key: "unit" },
    { title: "THB/Unit", dataIndex: "pricePerUnit", key: "pricePerUnit" },
    {
      title: <div className="text-center">QTY (ctn)</div>,
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) => (
        <div className="quantity-control flex justify-between items-center">
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
            className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 w-16"
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
    { title: "Sub Total (THB)", dataIndex: "subTotal", key: "subTotal" },
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

  const headerGift = [
    { title: "No", dataIndex: "no", key: "no" },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      render: (_, record) => (
        <Input
          value={record.productName}
          onChange={(e) => handleGiftInputChange(record.key, "productName", e.target.value)}
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
          onChange={(e) => handleGiftInputChange(record.key, "unit", e.target.value)}
        />
      )
    },
    {
      title: <div className="text-center">QTY</div>,
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) => (
        <Input
          value={record.quantity}
          type="number"
          min={1}
          onChange={(e) => handleGiftInputChange(record.key, "quantity", parseInt(e.target.value) || 1)}
        />
      )
    },
    {
      title: <div className="text-center">Action</div>,
      key: "action",
      render: (_, record) => (
        <button onClick={() => handleDeleteGiftRow(record.key)} className="delete-button">
          <img src="/img/icons/delete.png" alt="delete" className="cursor-pointer w-6 h-6" />
        </button>
      )
    }
  ];

  const footerOrderList = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={9} className="text-right pr-2 text-white">
        Item: {dataSource.length} &nbsp; QTY (ctn): {dataSource.reduce((total, item) => total + item.quantity, 0)}
      </td>
    </tr>
  );

  const footerGift = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={5} className="text-right pr-2 text-white">
        Item: {dataSourceGift.length} &nbsp; QTY : {dataSourceGift.reduce((total, item) => total + parseInt(item.quantity || 0), 0)}
      </td>
    </tr>
  );

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Order</div>

      <FormCustom fields={formFields} />

      <BoxPrimary title="Product">
        <div className="mb-3 flex justify-end">
          <Input
            placeholder="Search..."
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
          <span className="text-[#00783F] text-lg font-semibold">Gift</span>
          <div className="flex space-x-2">
            <ActionButton mode="add" text="Add" onClick={handleAddGiftRow} />
          </div>
        </div>
        <TableComponent
          header={headerGift}
          dataSource={dataSourceGift}
          pageSize={10}
          footer={footerGift}
        />
      </BoxPrimary>

      <BoxPrimary title='Remark'>
        <div className="mb-3 flex justify-end">
          <Input placeholder="Remark" />
        </div>
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/order/list")} />
        <ActionButton mode="save" text="Confirm" onClick={() => navigate("/order/list")} />
      </div>
    </MainLayout>
  );
}
