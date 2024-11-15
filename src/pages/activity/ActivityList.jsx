import React, { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import Filter from "../../components/filter/Filter";
import { Dropdown } from "antd";
import ActionButton from "../../components/button/ActionButton";
import BadgeStatus from "../../components/badge/BadgeStatus";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableComponent from "../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../components/dropdown/ItemDropDown";
import DynamicModal from "../../components/modal/DynamicModal";

export default function ActivityList() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const navigate = useNavigate();

  const filters = [
    {
      key: "activity_no",
      type: "text",
      label: "Activity No",
      placeholder: "Activity No",
    },
    {
      key: "activity_type",
      type: 'select',
      label: "Activity Type",
      placeholder: "All",
      options: [
        { value: 'Demo Plot', label: 'Demo Plot' },
        { value: 'Field Visit', label: 'Field Visit' },
        // Add other activity types as needed
      ],
    },
    {
      key: "shop",
      type: "text",
      label: "Shop",
      placeholder: "All",
    },
    {
      key: "Date",
      type: 'date',
      label: "Date",
    },
  ];

  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  const handleShowProductModal = () => {
    setIsProductModalVisible(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalVisible(false);
  };

  const productModalData = [
    { key: 1, name: "Tossaphon Suphaksitthikorn", territory: "Left North", position: "Business Development Executive" },
    { key: 2, name: "Panudech Srithong", territory: "Left Lower North", position: "Business Development Executive" },
  ];

  const productModalHeader = [
    { title: "No", dataIndex: "key", key: "key", width: 50 },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Territory", dataIndex: "territory", key: "territory" },
    { title: "Position", dataIndex: "position", key: "position" },
  ];

  const actionItems = [
    { key: "1", label: <ItemDropDown mode="edit" link="/activity/edit" /> },
    { key: "2", label: <ItemDropDown mode="delete" link="#" /> },
  ];

  const header = [
    { title: "Activity No", width: 150, dataIndex: "activityNo", align: "start" },
    { title: "Activity Type", width: 150, dataIndex: "activityType", align: "start" },
    { title: "Shop", width: 150, dataIndex: "shop", align: "start" },
    { title: "Key Product", width: 100, dataIndex: "keyProduct", align: "start" },
    { title: "Date", width: 150, dataIndex: "date", align: "start" },
    { title: "Time", width: 100, dataIndex: "time", align: "start", className: "text-nowrap" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  useEffect(() => {
    const dataSource = [
      {
        key: 1,
        activityNo: "202400000000003",
        activityType: "Demo Plot",
        shop: "จัดสนาม",
        keyProduct: "-", // If there's no specific product, you can use "-" as shown in the design
        date: "2024-02-01",
        time: "09:00 AM - 11:00 AM",
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottomRight">
            <a onClick={(e) => e.preventDefault()}>
              <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
            </a>
          </Dropdown>
        ),
      },
      {
        key: 2,
        activityNo: "202400000000002",
        activityType: "Demo Plot",
        shop: "จัดสนาม",
        keyProduct: "-",
        date: "2024-01-05",
        time: "09:00 AM - 11:00 AM",
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottomRight">
            <a onClick={(e) => e.preventDefault()}>
              <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
            </a>
          </Dropdown>
        ),
      },
      {
        key: 3,
        activityNo: "202400000000001",
        activityType: "Demo Plot",
        shop: "จัดสนาม",
        keyProduct: "-",
        date: "2024-01-01",
        time: "09:00 AM - 11:00 AM",
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottomRight">
            <a onClick={(e) => e.preventDefault()}>
              <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
            </a>
          </Dropdown>
        ),
      },
    ];

    setDataSource(dataSource);
  }, []);

  return (
    <MainLayout loading={loading}>

      <div className="flex items-center justify-between">
        <div className="title-page">Activity List</div>
        <ActionButton mode="create" text="Create" onClick={(e) => navigate("/activity/create")} />
      </div>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        filters={filters}
      />

      <BoxPrimary>
        <TableComponent header={header} dataSource={dataSource} />
      </BoxPrimary>

      <DynamicModal
        title="Sale Team"
        isVisible={isProductModalVisible}
        onClose={handleCloseProductModal}
        header={productModalHeader}
        dataSource={productModalData}
        width="1200px" // Customize the width to make it extra-large
      />

    </MainLayout>
  );
}
