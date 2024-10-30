import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown, Modal } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import DynamicButton from "../../../components/button/DynamicButton";

export default function SettingProduct() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isCropModalVisible, setIsCropModalVisible] = useState(false);

  const filters = [
    { key: "product_code", type: "text", label: "Product Code", placeholder: "All" },
    {
      key: "product_type",
      type: "select",
      label: "Product Type",
      options: [
        { value: "", label: "All" },
        { value: "Special", label: "Special" },
        { value: "Commodity", label: "Commodity" },
        { value: "3rd Party", label: "3rd Party" },
        { value: "SAS", label: "SAS" },
      ],
    },
    {
      key: "product_group",
      type: "select",
      label: "Product Group",
      options: [
        { value: "", label: "All" },
        { value: "Gold", label: "Gold" },
        { value: "Silver", label: "Silver" },
        { value: "Bronz", label: "Bronz" },
      ],
    },
    { key: "product_name", type: "text", label: "Product Name", placeholder: "All" },
  ];

  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  const handleShowCropModal = () => {
    setIsCropModalVisible(true);
  };

  const handleCloseCropModal = () => {
    setIsCropModalVisible(false);
  };

  const cropColumns = [
    { title: "No", dataIndex: "key", key: "key", width: 50 },
    { title: "Name", dataIndex: "name", key: "name" },
  ];

  const cropData = [
    { key: 1, name: "Rice" },
    { key: 2, name: "Wheat" },
    { key: 3, name: "Corn" },
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "left" },
    { title: "Product Code", width: 150, dataIndex: "product_code", align: "left" },
    { title: "Product Type", width: 150, dataIndex: "product_type", align: "left" },
    { title: "Product Group", width: 150, dataIndex: "product_group", align: "left" },
    { title: "Category", width: 100, dataIndex: "category", align: "left" },
    { title: "Product Name", width: 200, dataIndex: "product_name", align: "left" },
    { title: "Baht/lt,kg", width: 100, dataIndex: "baht_per_lt_kg", align: "right" },
    { title: "Baht/unit", width: 100, dataIndex: "baht_per_unit", align: "right" },
    { title: "Sub Dealer", width: 100, dataIndex: "sub_dealer", align: "right" },
    { title: "Farmer", width: 100, dataIndex: "farmer", align: "right" },
    { title: "Crop", width: 100, dataIndex: "crop", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const actionItems = [
    {
      key: "1",
      label: (
        <a rel="noopener noreferrer" href="/setting/product/edit" className="flex gap-1">
          <img src="/img/icons/edit.png" alt="Edit icon" className="inline-block h-4" />
          <span className="text-[#978B87]">Edit</span>
        </a>
      ),
    },
    {
      key: "2",
      label: (
        <a rel="noopener noreferrer" href="#" className="flex gap-1">
          <img src="/img/icons/delete.png" alt="Delete icon" className="inline-block h-4" />
          <span className="text-[#978B87]">Delete</span>
        </a>
      ),
    },
  ];

  useEffect(() => {
    const dataSource = [
      {
        key: 1,
        product_code: "303710131300",
        product_type: "Special",
        product_group: "Gold",
        category: "FUN",
        product_name: "Apopo 20%SE",
        baht_per_lt_kg: "940.00",
        baht_per_unit: "470.00",
        sub_dealer: "450.00",
        farmer: "500.00",
        crop: <BadgeStatus text="1" bgColor="#FFB020" textColor="#FFFFFF" onClick={handleShowCropModal} />,
        action: (
          <Dropdown
            menu={{ items: actionItems }}
            placement="bottom"
          >
            <a onClick={(e) => e.preventDefault()}>
              <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
            </a>
          </Dropdown>
        ),
      },
      // Add more rows as needed to match the structure
    ];

    setDataSource(dataSource);
  }, []);

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Product Management</div>
        <ActionButton mode="sync" text="Sync SAP" onClick={() => console.log("Sync SAP clicked")} className="ms-auto me-2" />
      </div>

      <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} />

      <BoxPrimary>
        <TableComponent header={header} dataSource={dataSource} />
      </BoxPrimary>

      <Modal
        title="Crop"
        open={isCropModalVisible}
        onCancel={handleCloseCropModal}
        footer={[
          <DynamicButton
            text="Close"
            key="close"
            onClick={handleCloseCropModal}
            className="bg-[#B6AEAB] text-white rounded-sm p-2"
          />,
        ]}
      >
        <TableComponent header={cropColumns} dataSource={cropData} />
      </Modal>

    </MainLayout>
  );
}
