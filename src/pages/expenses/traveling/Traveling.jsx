import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useNavigate, useLocation } from "react-router-dom";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function Traveling() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  // Filter configuration
  const filters = [
    { key: "customer", type: "select", label: "Customer", placeholder: "All", options: [] },
    { key: "expense_no", type: "text", label: "Expense No", placeholder: "All" },
    { key: "activity_ref", type: "text", label: "Activity Reference", placeholder: "All" },
    { key: "type_of_meeting", type: "select", label: "Type of Meeting", placeholder: "All", options: [] },
    { key: "date", type: "date", label: "Date", placeholder: "Select Date.." },
  ];

  // Handlers for filter actions
  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  // Dropdown actions
  const actionItems = [
    { key: "1", label: <ItemDropDown mode="edit" link="/expenses/traveling/edit" /> },
    { key: "2", label: <ItemDropDown mode="view" link="/expenses/traveling/view" /> },
    { key: "3", label: <ItemDropDown mode="delete" /> },
  ];

  // Table header configuration
  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Year", width: 100, dataIndex: "year", align: "center" },
    { title: "Month", width: 150, dataIndex: "month", align: "left" },
    { title: "Date", width: 150, dataIndex: "date", align: "center" },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  useEffect(() => {
    // Example data for the table
    const dataSource = [
      {
        key: 1,
        year: "2024",
        month: "October",
        date: "2024-01-01",
        status: <BadgeStatus text="Completed" bgColor="#009845" textColor="#FFFFFF" />,
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
        year: "2024",
        month: "September",
        date: "2024-01-01",
        status: <BadgeStatus text="Completed" bgColor="#009845" textColor="#FFFFFF" />,
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
        <div className="title-page">Traveling</div>
        <ActionButton mode="create" text="Create" onClick={() => navigate("/expenses/traveling/create")} />
      </div>

      <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} />

      <BoxPrimary>
        <TableComponent header={header} dataSource={dataSource} />
      </BoxPrimary>
    </MainLayout>
  );
}
