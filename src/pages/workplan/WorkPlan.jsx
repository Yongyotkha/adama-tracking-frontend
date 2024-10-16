import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import Logo from "../../components/logo/Logo";
import Filter from "../../components/filter/Filter";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableComponent from "../../components/table/TableComponent";
import DynamicButton from "../../components/button/Button";
import { Button, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";

export default function WorkPlan() {
  const [loading, setLoading] = useState(false);

  const years = [2021, 2022, 2023];
  const statuses = ["Active", "Inactive", "Pending"];

  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  const columns = [
    {
      title: "Years",
      width: 100,
      dataIndex: "year",
      fixed: "left",
    },
    {
      title: "Work Plan (THB)",
      width: 100,
      dataIndex: "workPlan",
      fixed: "left",
    },
    {
      title: "Last modified",
      width: 100,
      dataIndex: "lastModified",
      fixed: "left",
    },
    {
      title: "Status",
      width: 100,
      dataIndex: "status",
      fixed: "left",
    },
    {
      title: "Action",
      width: 100,
      dataIndex: "action",
      fixed: "left",
    },
  ];

  const items = [
    {
      key: "1",
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.antgroup.com"
        >
          create
        </a>
      ),
    },
    {
      key: "2",
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.aliyun.com"
        >
          edit
        </a>
      ),
    },
  ];

  const dataSource = [
    {
      key: 1,
      workPlan: 0,
      year: "2024",
      action: (
        <Dropdown
          menu={{
            items,
          }}
          placement="bottom"
        >
          <a onClick={(e) => e.preventDefault()}>
            <img
              src="/img/icons/action.png"
              alt="button icon"
              className="inline-block w-5 h-5 mr-2"
            />
          </a>
        </Dropdown>
      ),
      status: "Create Plan",
      lastModified: "2024-01-01 11:11",
    },
    {
      key: 2,
      workPlan: 1000000,
      year: "2023",
      action: (
        <Dropdown
          menu={{
            items,
          }}
          placement="bottom"
        >
          <a onClick={(e) => e.preventDefault()}>
            <img
              src="/img/icons/action.png"
              alt="button icon"
              className="inline-block w-5 h-5 mr-2"
            />
          </a>
        </Dropdown>
      ),
      status: "Create Plan",
      lastModified: "2024-01-01 11:11",
    },
  ];

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <div className="title-page">Work Plan</div>
        <Filter
          onSearch={handleSearch}
          onClear={handleClear}
          years={years}
          statuses={statuses}
        />
        <BoxPrimary>
          <TableComponent columns={columns} dataSource={dataSource} />
        </BoxPrimary>
      </MainLayout>
    </>
  );
}
