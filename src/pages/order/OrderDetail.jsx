import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { Input, Form } from "antd";
import TableComponent from "../../components/table/TableComponent";
import ActionButton from "../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";

export default function OrderDetail() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Static data for Order List and Gift tables
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

  const dataSourceGift = [
    {
      key: "1",
      no: "1",
      productName: "เสื้อเชิ้ตยีนส์แขนยาว - อดามา",
      unit: "ตัว",
      quantity: 20,
    },
  ];

  const header = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Product Name", dataIndex: "productName", key: "productName" },
    { title: "Unit", dataIndex: "unit", key: "unit" },
    { title: "THB/Unit", dataIndex: "pricePerUnit", key: "pricePerUnit" },
    { title: <div className="text-center">QTY (ctn)</div>, dataIndex: "quantity", key: "quantity" },
    { title: "FOC (ctn)", dataIndex: "foc", key: "foc" },
    { title: "Sub Total (THB)", dataIndex: "subTotal", key: "subTotal" },
  ];

  const headerGift = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "Name", dataIndex: "productName", key: "productName" },
    { title: "Unit", dataIndex: "unit", key: "unit" },
    { title: <div className="text-center">QTY</div>, dataIndex: "quantity", key: "quantity" },
  ];

  const footerOrderList = (currentData) => (
    <tr className="bg-[#978B87]">
      <td colSpan={8} className="text-right pr-2 text-white">
        Item : {dataSource.length} &nbsp; QTY (ctn): {dataSource.reduce((total, item) => total + item.quantity, 0)} &nbsp;
        Total : {dataSource.reduce((total, item) => total + parseFloat(item.subTotal.replace(/,/g, "")), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );

  const footerGift = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={4} className="text-right pr-2 text-white">
        Item : {dataSourceGift.length} &nbsp; QTY : {dataSourceGift.reduce((total, item) => total + parseInt(item.quantity || 0), 0)}
      </td>
    </tr>
  );

  return (
    <MainLayout loading={loading}>

      <div className="title-page">Order Detail</div>

      <BoxPrimary>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-3">
          <div>
            <label className="block mb-1">Order No</label>
            <Input placeholder="Order No" value="20240001" disabled className="bg-gray-100" />
          </div>
          <div>
            <label className="block mb-1">Dealer</label>
            <Input placeholder="Dealer" value="Chaifar" disabled className="bg-gray-100" />
          </div>
          <div>
            <label className="block mb-1">Date</label>
            <Input placeholder="Date" value="2024-01-01" disabled className="bg-gray-100" />
          </div>
        </div>

      </BoxPrimary>

      <BoxPrimary title="Order List">
        <TableComponent
          header={header}
          dataSource={dataSource}
          pageSize={10}
          footer={footerOrderList}
          pagination={false} // Disable pagination if the read-only view requires it
        />
      </BoxPrimary>

      <BoxPrimary title="Gift">
        <TableComponent
          header={headerGift}
          dataSource={dataSourceGift}
          pageSize={10}
          footer={footerGift}
          pagination={false} // Disable pagination if the read-only view requires it
        />
      </BoxPrimary>

      <BoxPrimary title="Remark">
        <Input.TextArea placeholder="Remark" value="Remark" disabled className="bg-gray-100" />
      </BoxPrimary>

      <div className="flex justify-end space-x-4 mt-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/order/list")} />
      </div>
    </MainLayout>
  );
}
