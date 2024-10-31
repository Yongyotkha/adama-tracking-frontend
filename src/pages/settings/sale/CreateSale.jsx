import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Input } from "antd";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../components/button/ActionButton";
import TableExpand from "../../../components/table/TableExpand";
import DynamicModal from "../../../components/modal/DynamicModal"; // Adjust path if needed

const { Option } = Select;

export default function CreateSale() {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSalesData, setSelectedSalesData] = useState([]); // Store selected rows
  const navigate = useNavigate();

  const salesData = [
    {
      key: "1",
      no: 1,
      name: "Sarawut Nisap",
      position: "Business Development Executive",
      territory: "Central",
      nestedData: [
        {
          key: "1-1",
          no: 1,
          name: "Passakorn Kong-In",
          position: "Sales Assistant",
          territory: "Right North",
        },
      ],
    },
    {
      key: "2",
      no: 2,
      name: "Tanadol Kaewyai",
      position: "Sales Assistant",
      territory: "Central",
      nestedData: [
        {
          key: "2-1",
          no: 1,
          name: "Ratchada Saensuk",
          position: "Junior Sales Assistant",
          territory: "Left North",
        },
        {
          key: "2-2",
          no: 2,
          name: "Somchai Pracha",
          position: "Senior Sales Assistant",
          territory: "Left South",
        },
      ],
    },
  ];

  // Columns and data for the modal table
  const territoryColumns = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Territory", dataIndex: "territory", key: "territory" },
    { title: "Position", dataIndex: "position", key: "position" },
  ];

  const territoryData = [
    { key: "1", no: 1, name: "Kornkan Induang", position: "Sales Executive", territory: "Left North" },
    { key: "2", no: 2, name: "Phaisan Jethuen", position: "Sales Executive", territory: "Left Lower North" },
    // Add more data as needed
  ];

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleAddSelectedRows = (selectedRows) => {
    setSelectedSalesData((prev) => [...prev, ...selectedRows]);
  };
  
  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Sale Management</div>

      <BoxPrimary>
        {/* Sale Head (Select) / Sale Area (Select) / Area (text:disable) */}
        <div className="grid gap-4 mb-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
          <div>
            <label className="block mb-1 text-sm text-gray-600">Sale Head</label>
            <Select
              defaultValue="Chayanon Tunyateerapong"
              className="w-full"
              placeholder="Select Sale Head"
            >
              <Option value="chayanon">Chayanon Tunyateerapong</Option>
              <Option value="another">Another Person</Option>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-600">Sale Area</label>
            <Select
              defaultValue="Veerasak Likitmanchai"
              className="w-full"
              placeholder="Select Sale Area"
            >
              <Option value="veerasak">Veerasak Likitmanchai</Option>
              <Option value="another_area">Another Area</Option>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-600">Area</label>
            <Input
              defaultValue="Area 1"
              disabled
              className="w-full"
            />
          </div>
        </div>
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex justify-between space-x-4 mb-3">
          <span className="text-[#00783F]">Sale Team</span>
          <ActionButton mode="add" text="Add" onClick={handleOpenModal} />
        </div>
        <TableExpand data={salesData} />
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/setting/sale")} />
        <ActionButton mode="update" text="Update" onClick={() => navigate("/setting/sale")} />
      </div>

      {/* Dynamic Modal Instance */}
      <DynamicModal
        title="Add Sale Territory"
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        header={territoryColumns}
        dataSource={territoryData}
        width="1200px"
        onAddSelected={handleAddSelectedRows} // Pass function to handle selected rows
        type="add" // Set type to "add" to enable checkbox and Add button
      />
    </MainLayout>
  );
}
