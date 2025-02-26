import React, { useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormCustom from "../../../components/form_custom/FormCustom";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Input } from "antd";
import TableComponent from "../../../components/table/TableComponent";
import AddOrderModal from "../../../components/modal/AddOrderModal";

export default function EditClaimRequest() {
  const [loading, setLoading] = useState(false);
  const [isAddOrderModalVisible, setIsAddOrderModalVisible] = useState(false);
  const navigate = useNavigate();

  // State for Order List table data
  const [dataSource, setDataSource] = useState([
    {
      key: "1",
      no: "1",
      sku: "3027200113",
      productName: "Bumper P",
      lotNo: "BGS0109",
      reason: "Damaged item",
      quantity: 2,
    },
    {
      key: "2",
      no: "2",
      sku: "207920011520",
      productName: "Memory 300EC",
      lotNo: "BGS0163",
      reason: "Damaged item",
      quantity: 1,
    },
  ]);

  const formFields = [
    { label: "Dealer", name: "dealer", type: "select", options: ["Dealer 1", "Dealer 2"], disabled: false, required: true, value: "Select" },
    { label: "By Sales", name: "by_sale", type: "select", options: ["Sale 1", "Sale 2"], disabled: false, required: true, value: "Select" },
    { label: "Claim No", name: "claim_no", type: "text", disabled: true, required: false, value: "Generate Auto" },
    { label: "Create Date", name: "create_date", type: "date", disabled: false, required: true, value: "" },
  ];

  const handleQuantityChange = (key, newQuantity) => {
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key === key) {
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 0 };
        }
        return item;
      })
    );
  };

  const header = [
    { title: "No", dataIndex: "no", key: "no", align: "center" },
    { title: "SKU", dataIndex: "sku", key: "sku", align: "center" },
    { title: "Product Name", dataIndex: "productName", key: "productName", align: "center" },
    { title: "Lot No", dataIndex: "lotNo", key: "lotNo", align: "center" },
    { title: "Reason", dataIndex: "reason", key: "reason", align: "center" },
    {
      title: <div className="text-center">QTY (ctn)</div>,
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) => (
        <div className="quantity-control flex justify-between items-center">
          <img src="/img/icons/collapse.png" alt="+" className="cursor-pointer w-6 h-6" onClick={() => handleQuantityChange(record.key, record.quantity - 1)} />
          <Input
            inputMode="numeric"
            min={0}
            value={record.quantity}
            onChange={(e) => handleQuantityChange(record.key, parseInt(e.target.value) || 0)}
            className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 min-w-24"
          />
          <img src="/img/icons/expand.png" alt="+" className="cursor-pointer w-6 h-6" onClick={() => handleQuantityChange(record.key, record.quantity + 1)} />
        </div>
      ),
    },
    {
      title: <div className="text-center">Label</div>,
      key: "label",
      render: () => (
        <button className="view-button flex justify-center mx-auto">
          <img src="/img/icons/view-table.png" alt="view" className="w-6 h-6" />
        </button>
      ),
    },
    {
      title: <div className="text-center">Product</div>,
      key: "product",
      render: () => (
        <button className="view-button flex justify-center mx-auto">
          <img src="/img/icons/view-table.png" alt="view" className="w-6 h-6" />
        </button>
      ),
    },
    {
      title: <div className="text-center">Overall</div>,
      key: "overall",
      render: () => (
        <button className="view-button flex justify-center mx-auto">
          <img src="/img/icons/view-table.png" alt="view" className="w-6 h-6" />
        </button>
      ),
    },
    {
      title: <div className="text-center">Other</div>,
      key: "other",
      render: () => (
        <button className="view-button flex justify-center mx-auto">
          <img src="/img/icons/view-table.png" alt="view" className="w-6 h-6" />
        </button>
      ),
    },
    {
      title: <div className="text-center">Action</div>,
      key: "action",
      render: (_, record) => (
        <button className="delete-button flex justify-center mx-auto">
          <img
            src="/img/icons/delete.png"
            alt="delete"
            className="cursor-pointer w-6 h-6"
            onClick={() => setDataSource(dataSource.filter((item) => item.key !== record.key))}
          />
        </button>
      ),
    },
  ];

  const footerOrderList = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={11} className="text-right pr-2 text-white">
        Item: {dataSource.length} &nbsp; QTY (ctn): {dataSource.reduce((total, item) => total + item.quantity, 0)}
      </td>
    </tr>
  );

  const handleShowAddOrderModal = () => {
    setIsAddOrderModalVisible(true);
  };

  const handleCloseAddOrderModal = () => {
    setIsAddOrderModalVisible(false);
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex justify-between">
        <div className="title-page">Edit Claim Request</div>
      </div>

      {/* Form Section */}
      <FormCustom fields={formFields} />

      {/* Order List Section */}
      <BoxPrimary>
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-lg font-semibold">Order List</span>
          <ActionButton mode="add" text="Add" onClick={handleShowAddOrderModal} />
        </div>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pageSize={10}
          footer={footerOrderList}
        />
      </BoxPrimary>

      {/* Remark Section */}
      <BoxPrimary title="Remark">
        <div className="mb-3 flex justify-end">
          <Input.TextArea placeholder="Remark" rows={2} />
        </div>
      </BoxPrimary>

      <AddOrderModal
        title="Add Order"
        isVisible={isAddOrderModalVisible}
        onClose={handleCloseAddOrderModal}
        width="1200px" // Customize the width to make it extra-large.
      />

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/expenses/product-claim")} />
        <ActionButton mode="save" text="Save" onClick={() => navigate("/expenses/product-claim")} />
      </div>
    </MainLayout>
  );
}
