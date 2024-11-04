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

export default function OrderList() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const navigate = useNavigate();

  const filters = [
    {
      key: "sale",
      type: "text",
      label: "Sale",
      placeholder: "All",
    },
    {
      key: "dealer",
      type: "text",
      label: "Dealer",
      placeholder: "All",
    },
    {
      key: "order_no",
      type: "text",
      label: "Order No",
      placeholder: "Order No",
    },
    {
      key: "status",
      type: 'select',
      label: "Status",
      placeholder: "All",
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Pending', label: 'Pending' },
      ],
    },
  ];

  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Order No", width: 150, dataIndex: "orderNo", align: "left" },
    { title: "Sale", width: 200, dataIndex: "sale", align: "left" },
    { title: "Dealer", width: 200, dataIndex: "dealer", align: "left" },
    { title: "Value (THB)", width: 100, dataIndex: "value", align: "right" },
    { title: "Order Date", width: 150, dataIndex: "orderDate", align: "center" },
    { title: "Pay Overdue", width: 150, dataIndex: "payOverdue", align: "center" },
    { title: "Status", width: 150, dataIndex: "status", align: "center" },
    { title: "Create By", width: 150, dataIndex: "createdBy", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const actionItems = [
    { key: "1", label: <ItemDropDown mode="view" link="/order/detail" /> },
  ];
  const actionItemsPending = [
    { key: "1", label: <ItemDropDown mode="edit" link="/order/edit" /> },
    { key: "2", label: <ItemDropDown mode="view" link="/order/detail" /> },
    { key: "3", label: <ItemDropDown mode="delete" onClick={() => console.log("Delete clicked")} /> },
  ];

  useEffect(() => {
    const dataSource = [
      {
        key: 1,
        orderNo: "20240002",
        sale: "Manupong Wongpuang",
        dealer: "Chaifar",
        value: "9,150.00",
        orderDate: "2024-01-01",
        payOverdue: <BadgeStatus text="Paid" bgColor="#009845" textColor="#FFFFFF" />,
        status: <BadgeStatus text="Completed" bgColor="#009845" textColor="#FFFFFF" />,
        createdBy: "Manupong",
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottom">
            <a onClick={(e) => e.preventDefault()}>
              <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
            </a>
          </Dropdown>
        ),
      },
      {
        key: 2,
        orderNo: "20240001",
        sale: "Manupong Wongpuang",
        dealer: "Ponsri",
        value: "9,150.00",
        orderDate: "2024-01-01",
        payOverdue: <BadgeStatus text="Overdue" bgColor="#00A0DF" textColor="#FFFFFF" />,
        status: <BadgeStatus text="Completed" bgColor="#009845" textColor="#FFFFFF" />,
        createdBy: "Manupong",
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottom">
            <a onClick={(e) => e.preventDefault()}>
              <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
            </a>
          </Dropdown>
        ),
      },
      {
        key: 2,
        orderNo: "20240001",
        sale: "Manupong Wongpuang",
        dealer: "Ponsri",
        value: "9,150.00",
        orderDate: "2024-01-01",
        payOverdue: <BadgeStatus text="Pending" bgColor="#978B87" textColor="#FFFFFF" />,
        status: <BadgeStatus text="Waiting for Approve " bgColor="#F89E18" textColor="#FFFFFF" />,
        createdBy: "Manupong",
        action: (
          <Dropdown menu={{ items: actionItemsPending }} placement="bottom">
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
        <div className="title-page">Order List</div>
        <ActionButton mode="create" text="Create" onClick={(e) => navigate("/order/create")} />
      </div>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        filters={filters}
      />

      <BoxPrimary>
        <TableComponent header={header} dataSource={dataSource} />
      </BoxPrimary>

    </MainLayout>
  );
}
