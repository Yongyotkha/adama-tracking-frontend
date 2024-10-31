import React, { useState } from "react";
import BadgeStatus from "../../components/badge/BadgeStatus";
import DropdownHover from "../../components/dropdown/DropdownHover";
import DynamicButton from "../../components/button/DynamicButton";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import Filter from "../../components/filter/Filter";
import DynamicModal from "../../components/modal/DynamicModal";
import { PlusOutlined } from "@ant-design/icons";
import MainLayout from "../../layouts/MainLayout";

const Wiki = () => {
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    isVisible: false,
    header: [],
    dataSource: []
  });

  const dropdownHoverItems = [
    {
      key: "1",
      label: (
        <a rel="noopener noreferrer" href="#">
          Dynamic menu item 1
        </a>
      ),
      icon: <PlusOutlined />,
    },
    {
      key: "2",
      danger: true,
      label: "Danger item",
    },
  ];

  const filters = [
    {
      key: 'year',
      type: 'select',
      label: 'Year',
      options: [
        { value: 2021, label: '2021' },
        { value: 2022, label: '2022' },
        { value: 2023, label: '2023' },
      ],
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Pending', label: 'Pending' },
      ],
    },
    {
      key: 'productName',
      type: 'text',
      label: 'Product Name',
      placeholder: 'Enter product name',
    },
    {
      key: 'quantity',
      type: 'number',
      label: 'Quantity',
      placeholder: 'Enter quantity',
    },
  ];

  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  // Sample data for modal table
  const modalHeader = [
    { title: "No", dataIndex: "key", key: "key", width: 50 },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Status", dataIndex: "status", key: "status" }
  ];

  const modalDataSource = [
    { key: 1, name: "Item 1", status: "Active" },
    { key: 2, name: "Item 2", status: "Inactive" },
    { key: 3, name: "Item 3", status: "Pending" },
  ];

  // Function to open modal with dynamic content
  const openDynamicModal = (title) => {
    setModalConfig({
      title: title,
      isVisible: true,
      header: modalHeader,
      dataSource: modalDataSource
    });
  };

  const handleCloseModal = () => {
    setModalConfig({ ...modalConfig, isVisible: false });
  };

  return (
    <MainLayout loading={loading}>
      {/* Filter Component */}
      <span>Filter</span>
      <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} />
      <hr className="my-5" />

      {/* Dynamic Button with Ant Design icon */}
      <span>DynamicButton 1</span>
      <DynamicButton
        text="Add New Item"
        icon={<PlusOutlined />}
        className="text-white rounded-lg p-2"
        type="primary"
        onClick={() => openDynamicModal("Add New Item Modal")}
        style={{
          backgroundColor: "#00783F",
        }}
      />
      <hr className="my-5" />

      {/* Dynamic Button with image icon */}
      <span>DynamicButton 2 (Style + iconSrc)</span>
      <DynamicButton
        text="View Report"
        iconSrc="/img/icons/expenses.png"
        className="bg-green-500 text-white rounded-lg p-2"
        type="primary"
        variant="solid"
        style={{ color: "#000000", backgroundColor: "#00783F" }}
      />
      <hr className="my-5" />

      {/* Dynamic Dropdown Hover Component */}
      <span>Dynamic Dropdown Hover</span>
      <DropdownHover
        items={dropdownHoverItems}
        triggerText="Dynamic Hover Menu"
        className="bg-blue-500 text-white rounded-lg p-3"
        onClick={() => openDynamicModal("Dynamic Hover Menu Modal")}
      />
      <hr className="my-5" />

      {/* Dynamic BoxPrimary component with custom content */}
      <span>BoxPrimary</span>
      <BoxPrimary></BoxPrimary>
      <hr className="my-5" />

      {/* Dynamic BadgeStatus component */}
      <span>BadgeStatus (Dynamic colors)</span>
      <BadgeStatus
        text="Active"
        bgColor="#00783F"
        textColor="#FFFFFF"
      />
      <BadgeStatus
        text="Inactive"
        bgColor="#FF0000"
        textColor="#FFFFFF"
      />
      <BadgeStatus
        text="Pending"
        bgColor="#FFA500"
        textColor="#FFFFFF"
      />

      <span>BadgeStatus (Dynamic colors + Modal)</span>

      <BadgeStatus
        text="Active Modal"
        bgColor="#00783F"
        textColor="#FFFFFF"
        onClick={() => openDynamicModal("Active Status Modal")}
      />

      <div onClick={() => openDynamicModal("Active Status Modal")}>Modal onClick</div>

      {/* Dynamic Modal */}
      <DynamicModal
        title={modalConfig.title}
        isVisible={modalConfig.isVisible}
        onClose={handleCloseModal}
        header={modalConfig.header}
        dataSource={modalConfig.dataSource}
        width="500px" // Default 1200px
      />
    </MainLayout>
  );
};

export default Wiki;
