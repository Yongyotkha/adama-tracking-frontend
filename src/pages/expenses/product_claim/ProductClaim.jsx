import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import DynamicModal from "../../../components/modal/DynamicModal";

export default function ProductClaim() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const navigate = useNavigate();
  
  const filters = [
    {
      key: "claim_no",
      type: "text",
      label: "Claim No",
      placeholder: "Claim No",
    },
    {
      key: "claim_date",
      type: "date",
      label: "Claim Date",
      placeholder: "YYYY-MM-DD",
    },
    {
      key: "dealer_name",
      type: "text",
      label: "Dealer Name",
      placeholder: "All",
    },
    {
      key: "status",
      type: 'select',
      label: "Status",
      placeholder: "All",
      options: [
        { value: 'Wait for Approve', label: 'Wait for Approve' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' },
      ],
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
    { key: "1", label: <ItemDropDown mode="edit" link="/expenses/product-claim/edit" /> },
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Claim No", width: 150, dataIndex: "claimNo", align: "center" },
    { title: "Claim Date", width: 150, dataIndex: "claimDate", align: "center" },
    { title: "Dealer Name", width: 200, dataIndex: "dealerName", align: "left" },
    { title: "Product", width: 100, dataIndex: "product", align: "center" },
    { title: "Status", width: 150, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];
  
  useEffect(() => {
    const dataSource = [
      {
        key: 1,
        claimNo: "20241000003",
        claimDate: "2024-01-01",
        dealerName: "Chaifar",
        product: <BadgeStatus text="2" bgColor="#F89E18" textColor="#FFFFFF" onClick={handleShowProductModal} />, // Badge to represent product count
        status: <BadgeStatus text="Wait for Approve" bgColor="#F89E18" textColor="#FFFFFF" />,
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
        claimNo: "20241000002",
        claimDate: "2024-01-01",
        dealerName: "Chaifar",
        product: <BadgeStatus text="1" bgColor="#F89E18" textColor="#FFFFFF" />,
        status: <BadgeStatus text="Wait for Approve" bgColor="#F89E18" textColor="#FFFFFF" />,
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
        claimNo: "20241000001",
        claimDate: "2024-01-01",
        dealerName: "Chaifar",
        product: <BadgeStatus text="1" bgColor="#F89E18" textColor="#FFFFFF" />,
        status: <BadgeStatus text="Wait for Approve" bgColor="#F89E18" textColor="#FFFFFF" />,
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
        <div className="title-page">Product Claim</div>
        <ActionButton mode="create" text="Create" onClick={(e) => navigate("/expenses/product-claim/create")} />
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
