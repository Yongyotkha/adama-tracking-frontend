import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Input } from "antd";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../components/button/ActionButton";
import TableExpand from "../../../components/table/TableExpand";
import DynamicModal from "../../../components/modal/DynamicModal"; // Adjust path if needed

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

  const header = [
    {
      title: "No",
      width: 50,
      dataIndex: "key",
      align: "left",
    },
    {
      title: "Name",
      width: 100,
      dataIndex: "name",
      align: "left",
    },
    {
      title: "Position",
      width: 100,
      dataIndex: "position",
      align: "left",
    },
    {
      title: "Territory",
      width: 100,
      dataIndex: "territory",
      align: "left",
    },
    {
      title: "Action",
      width: 100,
      dataIndex: "action",
      align: "left",
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
        <TableExpand data={salesData} header={header} /> {/* Pass header as prop */}
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/setting/sale")} />
        <ActionButton mode="update" text="Update" onClick={() => navigate("/setting/sale")} />
      </div>

      <DynamicModal
        title="Add Sale Territory"
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        header={header}
        dataSource={salesData}
        width="1200px"
        onAddSelected={handleAddSelectedRows}
        type="add"
      />
    </MainLayout>
  );
}
