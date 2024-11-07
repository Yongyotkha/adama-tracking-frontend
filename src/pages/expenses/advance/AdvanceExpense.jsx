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

export default function AdvanceExpense() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const navigate = useNavigate();

  const filters = [
    {
      key: "customer",
      type: "select",
      label: "Customer",
      placeholder: "All",
      options: [
        { value: 'Chaifar', label: 'Chaifar' },
        { value: 'OtherCustomer', label: 'OtherCustomer' },
      ],
    },
    {
      key: "expense_no",
      type: "text",
      label: "Expense No",
      placeholder: "All",
    },
    {
      key: "activity_reference",
      type: "text",
      label: "Activity Reference",
      placeholder: "All",
    },
    {
      key: "type_of_meeting",
      type: "text",
      label: "Type of Meeting",
      placeholder: "All",
    },
    {
      key: "date",
      type: "date",
      label: "Date",
      placeholder: "YYYY-MM-DD",
    },
  ];
  
  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  const header = [
    { title: "No", dataIndex: "key", align: "center" },
    { title: "Customer", dataIndex: "customer", align: "left" },
    { title: "Expense No", dataIndex: "expenseNo", align: "left" },
    { title: "Activity Reference", dataIndex: "activityReference", align: "left" },
    { title: "Type of Meeting", dataIndex: "typeOfMeeting", align: "center" },
    { title: "Date", dataIndex: "date", align: "center" },
    { title: "Status", dataIndex: "status", align: "center" },
    { title: "Action", dataIndex: "action", align: "center" },
  ];

  const actionItems = [
    { key: "1", label: <ItemDropDown mode="edit" link="/expenses/advance/edit" /> },
    { key: "2", label: <ItemDropDown mode="view" link="/expenses/advance/view" /> },
    { key: "3", label: <ItemDropDown mode="delete" link="#" /> },
  ];

  useEffect(() => {
    const dataSource = [
      {
        key: 1,
        customer: "Chaifar",
        expenseNo: "20240002",
        activityReference: "2024000000000001",
        typeOfMeeting: "FMT",
        date: "2024-01-01",
        status: <BadgeStatus text="Convert" bgColor="#00A0DF" textColor="#FFFFFF" />,
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
        customer: "Chaifar",
        expenseNo: "20240001",
        activityReference: "2024000000000002",
        typeOfMeeting: "FMT",
        date: "2024-01-01",
        status: <BadgeStatus text="Convert" bgColor="#00A0DF" textColor="#FFFFFF" />,
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottom">
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
        <div className="title-page">Advance Expense</div>
        <ActionButton mode="create" text="Create" onClick={() => navigate("/expenses/advance/create")} />
      </div>
      <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} />
      <BoxPrimary>
        <TableComponent header={header} dataSource={dataSource} />
      </BoxPrimary>
    </MainLayout>
  );
}
