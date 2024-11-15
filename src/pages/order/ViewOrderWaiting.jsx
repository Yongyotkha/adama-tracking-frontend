import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { Input } from "antd";
import TableComponent from "../../components/table/TableComponent";
import ActionButton from "../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import FormCustom from "../../components/form_custom/FormCustom";

export default function ViewOrderWaiting() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const dataSource = [
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
  ];

  const dataSourceOther = [
    {
      key: "1",
      no: "1",
      productName: "เสื้อเชิ้ตยีนส์แขนยาว - อดามา",
      unit: "ตัว",
      quantity: 10,
      value: 10000,
    },
    {
      key: "2",
      no: "2",
      productName: "เสื้อเชิ้ตยีนส์แขนยาว - อดามา",
      unit: "ตัว",
      quantity: 20,
      value: 20000,
    },
  ];

  const header = [
    { title: "No", dataIndex: "no", key: "no", width: 10 },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Product Name", dataIndex: "productName", key: "productName" },
    { title: "Unit", dataIndex: "unit", key: "unit" },
    { title: "THB/Unit", dataIndex: "pricePerUnit", key: "pricePerUnit" },
    {
      title: <div className="text-center">QTY (ctn)</div>,
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => (
        <div className="text-center">
          {parseFloat(text || 0).toLocaleString("en-US")}
        </div>
      ),
    },
    {
      title: <div className="text-center">FOC (ctn)</div>,
      dataIndex: "foc",
      key: "foc",
      render: (text) => (
        <div className="text-center">
          {parseFloat(text || 0).toLocaleString("en-US")}
        </div>
      ),
    },
    {
      title: <div className="text-end">Sub Total (THB)</div>,
      dataIndex: "subTotal",
      key: "subTotal",
      render: (text) => (
        <div className="text-end">
          {parseFloat(text || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </div>
      ),
    },
  ];

  const headerOther = [
    { title: "No", dataIndex: "no", key: "no", width: 10 },
    { title: "Name", dataIndex: "productName", key: "productName" },
    { title: "Unit", dataIndex: "unit", key: "unit" },
    { title: "QTY", dataIndex: "quantity", key: "quantity" },
    {
      title: <div className="text-end">Value (THB)</div>,
      dataIndex: "value",
      key: "value",
      render: (text) => (
        <div className="text-end">
          {parseFloat(text || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </div>
      ),
    },
  ];

  const footerOrderList = (currentData) => (
    <tr className="bg-[#978B87]">
      <td colSpan={8} className="text-right pr-2 text-white">
        Item : {dataSource.length} &nbsp;&nbsp; QTY (ctn):{" "}
        {dataSource.reduce((total, item) => total + item.quantity, 0)} &nbsp;&nbsp;
        Total :{" "}
        {dataSource
          .reduce(
            (total, item) => total + parseFloat(item.subTotal.replace(/,/g, "")),
            0
          )
          .toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );

  const footerOther = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={5} className="text-right pr-2 text-white">
        Item : {dataSourceOther.length} &nbsp;&nbsp; QTY :{" "}
        {dataSourceOther.reduce(
          (total, item) => total + parseInt(item.quantity || 0),
          0
        )}
        &nbsp;&nbsp; Total :{" "}
        {dataSourceOther
          .reduce((total, item) => total + item.value, 0)
          .toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );

  const formFields = [
    { label: "Sale", name: "sale", type: "text", disabled: true, value: "Manupong" },
    { label: "Dealer", name: "dealer", type: "text", disabled: true, value: "Chaifar" },
    { label: "Order No", name: "order_no", type: "text", disabled: true, value: "20240001" },
    { label: "Date", name: "order_date", type: "date", disabled: true, value: "2024-01-01" },
  ];

  return (
    <MainLayout loading={loading}>

      <div className="title-page">View Order</div>

      <FormCustom fields={formFields} />

      <BoxPrimary title="Order List">
        <TableComponent
          header={header}
          dataSource={dataSource}
          pageSize={10}
          footer={footerOrderList}
          pagination={false} // Disable pagination if the read-only view requires it
        />
      </BoxPrimary>

      <BoxPrimary title="Other">
        <TableComponent
          header={headerOther}
          dataSource={dataSourceOther}
          pageSize={10}
          footer={footerOther}
          pagination={false} // Disable pagination if the read-only view requires it
        />
      </BoxPrimary>

      <BoxPrimary title="Remark">
        <Input.TextArea placeholder="Remark" value="Remark" disabled className="bg-gray-100" />
      </BoxPrimary>

      <div className="flex justify-end space-x-4 mt-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/order-waiting/list")} />
        <ActionButton mode="reject" text="Reject" onClick={() => navigate("/order-waiting/list")} />
        <ActionButton mode="save" text="Confirm" onClick={() => navigate("/order-waiting/list")} />
      </div>
    </MainLayout>
  );
}
