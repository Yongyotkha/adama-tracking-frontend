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
          {/* <DynamicButton iconSrc="/img/icons/create.png"  onClick={() => handleEdit(record)} /> */}
          <DynamicButton iconSrc="/img/icons/create.png" onClick={handleOpenModal} />
          <DynamicButton iconSrc="/img/icons/delete.png" onClick={() => handleDelete(record)} />
        </div>
      ),
    },
  ];

  // Define the nested table columns
  const nestedColumns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      width: 80,
    },
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
      render: (_, nestedRecord) => (
        <DynamicButton iconSrc="/img/icons/delete.png" onClick={() => handleDelete(nestedRecord.key)} />
      ),
    },
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

  const handleEdit = (record) => {
    console.log("Edit", record);
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

        <TableExpand data={salesData} columns={columns} nestedColumns={nestedColumns} /> {/* Pass columns and nestedColumns as props */}

      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/setting/sale")} />
        <ActionButton mode="update" text="Update" onClick={() => navigate("/setting/sale")} />
      </div>

      <DynamicModal
        title="Add Sale Territory"
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        header={[
          { title: "No", dataIndex: "no", key: "no", width: 50 },
          { title: "Name", dataIndex: "name", key: "name", width: 150 },
          { title: "Territory", dataIndex: "territory", key: "territory", width: 150 },
          { title: "Position", dataIndex: "position", key: "position", width: 150 }
        ]}
        dataSource={salesData}
        width="1200px"
        onAddSelected={handleAddSelectedRows}
        type="add"
      />

    </MainLayout>
  );
}
