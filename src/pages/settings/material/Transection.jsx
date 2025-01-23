import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import ActionButton from "../../../components/button/ActionButton";
import { Input, Modal, DatePicker, Button } from "antd";

export default function Transaction() {
  const { mode } = useParams(); // Get the mode from the URL
  const navigate = useNavigate();
  const isViewMode = mode === "view";
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([
    {
      key: 1,
      date: "01/01/2025",
      type: "Opening",
      stock: 100,
      byTeam: "Warehouse",
    },
    {
      key: 2,
      date: "02/01/2025",
      type: "Order",
      stock: 40,
      byTeam: "Warehouse",
    },
    {
      key: 3,
      date: "03/01/2025",
      type: "Order",
      stock: 30,
      byTeam: "Warehouse",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStock, setNewStock] = useState({ date: null, stock: "" });

  const stockHead = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Stock", dataIndex: "stock", key: "stock" },
    { title: "By Team", dataIndex: "byTeam", key: "byTeam" },
  ];

  const handleAddStock = () => {
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    if (newStock.date && newStock.stock) {
      setDataSource((prev) => [
        ...prev,
        {
          key: prev.length + 1,
          date: newStock.date.format("DD/MM/YYYY"),
          type: "Added",
          stock: newStock.stock,
          byTeam: "Warehouse",
        },
      ]);
      setNewStock({ date: null, stock: "" });
      setIsModalOpen(false);
    } else {
      alert("Please fill in all fields");
    }
  };

  const handleModalCancel = () => {
    setNewStock({ date: null, stock: "" });
    setIsModalOpen(false);
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Transaction</div>

      <BoxPrimary>
        <div className="grid gap-4 mb-4 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
          <div>
            <label className="block mb-1 text-sm">Material Code</label>
            <Input
              value="Generate"
              placeholder="Generate"
              disabled
              className="w-full border-gray-300 bg-gray-100 text-gray-500 rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Material Name</label>
            <Input
              placeholder="Material Name"
              className="w-full border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Unit Price</label>
            <Input
              placeholder="Unit Price"
              className="w-full border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Current Stock</label>
            <Input
              placeholder="Current Stock"
              className="w-full border-gray-300 rounded-md"
            />
          </div>
        </div>
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex items-center justify-between">
          <div className="text-[#00783F] text-lg font-semibold mb-3">Stock</div>
          <ActionButton mode="add" text="Add Stock" onClick={handleAddStock} />
        </div>
        <TableComponent header={stockHead} dataSource={dataSource} />
      </BoxPrimary>

      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/setting/material")}
        />
        <ActionButton
          mode="save"
          text={mode === "create" ? "Create" : "Save"}
        />
      </div>

      {/* Modal for Adding Stock */}
      <Modal
        title="Add Stock"
        visible={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Close
          </Button>,
          <Button
            key="add"
            type="primary"
            onClick={handleModalOk}
            style={{ backgroundColor: "#00783F", borderColor: "#00783F" }}
          >
            Add
          </Button>,
        ]}
      >
        <div className="mb-4">
          <label className="block mb-1 text-sm">Date</label>
          <DatePicker
            className="w-full"
            value={newStock.date}
            onChange={(date) => setNewStock({ ...newStock, date })}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm">Stock Add</label>
          <Input
            type="number"
            placeholder="Enter stock quantity"
            value={newStock.stock}
            onChange={(e) =>
              setNewStock({ ...newStock, stock: e.target.value })
            }
            className="w-full"
          />
        </div>
      </Modal>
    </MainLayout>
  );
}
