import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableExpand from "../../../components/table/TableExpand";
import { Dropdown } from "antd";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import { useNavigate } from "react-router-dom";

export default function RollingForecast() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const data = [
      {
        key: 1,
        year: "2024",
        workPlan: "50,750,000",
        lastModified: "2024-01-01 11:11",
        status: (
          <BadgeStatus text="Wait for edit plan" bgColor="#A9A9A9" textColor="#FFFFFF" />
        ),
        action: (
          <Dropdown menu={{ items: dropdownItems }} placement="bottom">
            <a onClick={(e) => e.preventDefault()}>
              <img src="/img/icons/action.png" alt="button icon" className="inline-block w-5 h-5 mr-2" />
            </a>
          </Dropdown>
        ),
        nestedData: [
          { key: "1-1", no: 1, month: "January", workPlan: "4,687,500", forecast: "4,687,500", actual: "4,687,500", status: "Complete" },
          { key: "1-2", no: 2, month: "February", workPlan: "4,587,500", forecast: "4,587,500", actual: "0", status: "Pending" },
          { key: "1-3", no: 3, month: "March", workPlan: "4,587,500", forecast: "4,587,500", actual: "0", status: "Pending" },
          { key: "1-4", no: 4, month: "April", workPlan: "4,587,500", forecast: "4,587,500", actual: "0", status: "Pending" },
          { key: "1-5", no: 5, month: "May", workPlan: "4,437,500", forecast: "4,437,500", actual: "0", status: "Pending" },
          { key: "1-6", no: 6, month: "June", workPlan: "4,362,500", forecast: "4,362,500", actual: "0", status: "Pending" },
          { key: "1-7", no: 7, month: "July", workPlan: "4,087,500", forecast: "4,087,500", actual: "0", status: "Pending" },
          { key: "1-8", no: 8, month: "August", workPlan: "4,062,500", forecast: "4,062,500", actual: "0", status: "Pending" },
          { key: "1-9", no: 9, month: "September", workPlan: "3,762,500", forecast: "3,762,500", actual: "0", status: "Pending" },
          { key: "1-10", no: 10, month: "October", workPlan: "3,812,500", forecast: "3,812,500", actual: "0", status: "Pending" },
          { key: "1-11", no: 11, month: "November", workPlan: "3,862,500", forecast: "3,862,500", actual: "0", status: "Plan" },
          { key: "1-12", no: 12, month: "December", workPlan: "3,912,500", forecast: "3,912,500", actual: "0", status: "Plan" },
        ]
      },
      {
        key: 2,
        year: "2023",
        workPlan: "60,000,000",
        lastModified: "2023-01-01 11:11",
        status: (
          <BadgeStatus text="Completed" bgColor="#00783F" textColor="#FFFFFF" />
        ),
        action: (
          <Dropdown menu={{ items: dropdownItems }} placement="bottom">
            <a onClick={(e) => e.preventDefault()}>
              <img src="/img/icons/action.png" alt="button icon" className="inline-block w-5 h-5 mr-2" />
            </a>
          </Dropdown>
        ),
        nestedData: [
          { key: "2-1", no: 1, month: "January", workPlan: "5,000,000", forecast: "5,000,000", actual: "5,000,000", status: "Complete" },
          { key: "2-2", no: 2, month: "February", workPlan: "5,000,000", forecast: "5,000,000", actual: "4,500,000", status: "In Progress" },
          // Additional months...
        ],
      },
    ];
    setDataSource(data);
  }, []);

  const filters = [
    {
      key: "year",
      type: "select",
      label: "Year",
      options: [
        { value: 2021, label: "2021" },
        { value: 2022, label: "2022" },
        { value: 2023, label: "2023" },
      ],
    },
    {
      key: "status",
      type: "select",
      label: "Status",
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
        { value: "Pending", label: "Pending" },
      ],
    },
  ];

  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  const dropdownItems = [
    {
      key: "1",
      label: (
        <ItemDropDown
          mode="edit"
          text="Edit"
          onClick={() => navigate("/sale-plan/work-plan/edit")}
        />
      ),
    },
    {
      key: "2",
      label: (
        <ItemDropDown
          mode="view"
          text="View"
          onClick={() => navigate("/sale-plan/work-plan")}
        />
      ),
    },
  ];

  const sub_items = [
    {
      key: "1",
      label: (
        <ItemDropDown
          mode="edit"
          text="Edit"
          onClick={() => navigate("/sale-plan/rolling-forecast/edit")}
        />
      ),
    },
    {
      key: "2",
      label: (
        <ItemDropDown
          mode="view"
          text="View"
          onClick={() => navigate("/sale-plan/rolling-forecast")}
        />
      ),
    },
  ];

  const columns = [
    { title: "Year", dataIndex: "year", key: "year", width: 100 },
    { title: "Work Plan (THB)", dataIndex: "workPlan", key: "workPlan", width: 150 },
    { title: "Last Modified", dataIndex: "lastModified", key: "lastModified", width: 150 },
    { title: "Status", dataIndex: "status", key: "status", width: 150 },
    { title: "Action", dataIndex: "action", key: "action", width: 100 },
  ];

  const nestedColumns = [
    { title: "No", dataIndex: "no", key: "no", width: 50 },
    { title: "Month", dataIndex: "month", key: "month", width: 100 },
    { title: "Work Plan (THB)", dataIndex: "workPlan", key: "workPlan", width: 150 },
    { title: "Rolling Forecast (THB)", dataIndex: "forecast", key: "forecast", width: 150 },
    { title: "Actual (THB)", dataIndex: "actual", key: "actual", width: 150 },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (text) => (
        <BadgeStatus
          text={text}
          bgColor={
            text === "Complete" ? "#00783F" :
              text === "Plan" ? "#A9A9A9" :
                text === "Pending" ? "#FFA500" :
                  text === "Create" ? "#FFD700" :
                    "#000000" // Default color if none match
          }
          textColor="#FFFFFF"
          className="cursor-pointer"
        />
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 100,
      render: (text) => (
        <Dropdown menu={{ items: sub_items }} placement="bottom">
          <a onClick={(e) => e.preventDefault()}>
            <img src="/img/icons/action.png" alt="button icon" className="inline-block w-5 h-5 mr-2" />
          </a>
        </Dropdown>
      ),
    },
  ];



  return (
    <MainLayout loading={loading} childrenStyle="">
      <div className="title-page">Rolling Forecast</div>
      <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} />

      <BoxPrimary>
        <TableExpand data={dataSource} columns={columns} nestedColumns={nestedColumns} />
      </BoxPrimary>
    </MainLayout>
  );
}
