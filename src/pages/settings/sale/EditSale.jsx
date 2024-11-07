import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Input } from "antd";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../components/button/ActionButton";
import TableExpand from "../../../components/table/TableExpand";
import DynamicModal from "../../../components/modal/DynamicModal"; // Adjust path if needed
import DynamicButton from "../../../components/button/DynamicButton";

const { Option } = Select;

export default function EditSale() {
  const [loading, setLoading] = useState(false);
  const [isTerritoryModalVisible, setIsTerritoryModalVisible] = useState(false);
  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);
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

  const salesDataTerritory = [
    { key: "1", no: 1, name: "Kornkan Induang", position: "Sales Executive", territory: "Left North" },
    { key: "2", no: 2, name: "Phaisan Jethuen", position: "Sales Executive", territory: "Left Lower North" },
    { key: "3", no: 3, name: "Manupong Wongpuang", position: "Sales Executive", territory: "Lower North" },
    { key: "4", no: 4, name: "Kriangkrai Kraikeaw", position: "Sales Executive", territory: "Central Left North" },
    { key: "5", no: 5, name: "Charoenpong Khunawatcharakun", position: "Sales Executive", territory: "Central Right North" },
    { key: "6", no: 6, name: "Amorn Sriworakul", position: "Sales Executive", territory: "Right Lower North" },
    { key: "7", no: 7, name: "Nitchapan Akkaraketsawad", position: "Sales Executive", territory: "Upper Central" },
    { key: "8", no: 8, name: "Manus Nakkhum", position: "Sales Executive", territory: "Central" },
    // Add more entries if needed
  ];

  const salesDataTeam = [
    { key: "1", no: 1, name: "Passakorn Kong-In", position: "Sales Assistant", territory: "Right North" },
    { key: "2", no: 2, name: "Tossaphon Suphaksitthikorn", position: "Business Development Executive", territory: "Right Lower North" },
    { key: "3", no: 3, name: "Panudech Srithong", position: "Business Development Executive", territory: "Upper Central" },
    { key: "4", no: 4, name: "Sarawut Nisap", position: "Business Development Executive", territory: "Central" },
    { key: "5", no: 5, name: "Tanadol Kaewyai", position: "Sales Assistant", territory: "Central" },
    { key: "6", no: 6, name: "Thanakit Kongkrapan", position: "Sales Assistant", territory: "West" },
    { key: "7", no: 7, name: "Wisisak Prakobsin", position: "Business Development Executive", territory: "South" },
    { key: "8", no: 8, name: "Chinnawat Bunmakaew", position: "Sales Assistant", territory: "South" },
    // Add more entries if needed
  ];
  

  // Define the main table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      width: 200,
    },
    {
      title: "Territory",
      dataIndex: "territory",
      key: "territory",
      width: 150,
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <DynamicButton iconSrc="/img/icons/create.png" onClick={handleOpenTeamModal} />
          <DynamicButton iconSrc="/img/icons/delete.png" onClick={() => handleDelete(record)} />
        </div>
      ),
    },
  ];

  // Define the nested table columns
  const nestedColumns = [
    { title: "No", dataIndex: "no", key: "no", width: 80 },
    { title: "Name", dataIndex: "name", key: "name", width: 150 },
    { title: "Position", dataIndex: "position", key: "position", width: 200 },
    { title: "Territory", dataIndex: "territory", key: "territory", width: 150 },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, nestedRecord) => (
        <DynamicButton iconSrc="/img/icons/delete.png" onClick={() => handleDelete(nestedRecord.key)} />
      ),
    },
  ];

  const handleOpenTerritoryModal = () => {
    setIsTerritoryModalVisible(true);
  };

  const handleCloseTerritoryModal = () => {
    setIsTerritoryModalVisible(false);
  };
  
  const handleOpenTeamModal = () => {
    setIsTeamModalVisible(true);
  };

  const handleCloseTeamModal = () => {
    setIsTeamModalVisible(false);
  };

  const handleAddSelectedRows = (selectedRows) => {
    setSelectedSalesData((prev) => [...prev, ...selectedRows]);
  };

  const handleDelete = (record) => {
    console.log("Delete", record);
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Edit Sale Management</div>

      <BoxPrimary>
        <div className="grid gap-4 mb-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
          <div>
            <label className="block mb-1 text-sm text-gray-600">Sale Head</label>
            <Select defaultValue="Chayanon Tunyateerapong" className="w-full" placeholder="Select Sale Head">
              <Option value="chayanon">Chayanon Tunyateerapong</Option>
              <Option value="another">Another Person</Option>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-600">Sale Area</label>
            <Select defaultValue="Veerasak Likitmanchai" className="w-full" placeholder="Select Sale Area">
              <Option value="veerasak">Veerasak Likitmanchai</Option>
              <Option value="another_area">Another Area</Option>
            </Select>
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-600">Area</label>
            <Input defaultValue="Area 1" disabled className="w-full" />
          </div>
        </div>
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex justify-between space-x-4 mb-3">
          <span className="text-[#00783F] text-lg font-semibold">Sale Team</span>
          <div className="flex space-x-2">
            <ActionButton mode="add" text="Add" onClick={handleOpenTerritoryModal} />
          </div>
        </div>

        <TableExpand data={salesData} columns={columns} nestedColumns={nestedColumns} />

      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/setting/sale")} />
        <ActionButton mode="update" text="Update" onClick={() => navigate("/setting/sale")} />
      </div>

      {/* Modal for Add Sale Territory */}
      <DynamicModal
        title="Add Sale Territory"
        isVisible={isTerritoryModalVisible}
        onClose={handleCloseTerritoryModal}
        header={[
          { title: "No", dataIndex: "no", key: "no", width: 50 },
          { title: "Name", dataIndex: "name", key: "name", width: 150 },
          { title: "Territory", dataIndex: "territory", key: "territory", width: 150 },
          { title: "Position", dataIndex: "position", key: "position", width: 150 },
        ]}
        dataSource={salesDataTerritory}
        width="1200px"
        onAddSelected={handleAddSelectedRows}
        type="add"
      />

      {/* Modal for Add Sale Team */}
      <DynamicModal
        title="Add Sale Team"
        isVisible={isTeamModalVisible}
        onClose={handleCloseTeamModal}
        header={[
          { title: "No", dataIndex: "no", key: "no", width: 50 },
          { title: "Name", dataIndex: "name", key: "name", width: 150 },
          { title: "Territory", dataIndex: "territory", key: "territory", width: 150 },
          { title: "Position", dataIndex: "position", key: "position", width: 150 },
        ]}
        dataSource={salesDataTeam}
        width="1200px"
        onAddSelected={handleAddSelectedRows}
        type="add"
      />
    </MainLayout>
  );
}
