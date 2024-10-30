import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import TableComponent from "../../../components/table/TableComponent";
import { Dropdown } from "antd";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";

export default function SettingUser() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const navigate = useNavigate();


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
    {
      key: "productName",
      type: "text",
      label: "Product Name",
      placeholder: "Enter product name",
    },
    {
      key: "quantity",
      type: "number",
      label: "Quantity",
      placeholder: "Enter quantity",
    },
  ];
  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  // Data in Table
  const header = [
    {
      title: "No",
      width: 50,
      dataIndex: "key",
      align: "left",
    },
    {
      title: "Name(EN)",
      width: 100,
      dataIndex: "name",
      align: "left",
    },
    {
      title: "Contact Number",
      width: 100,
      dataIndex: "contact_number",
      align: "left",
    },
    {
      title: "Email",
      width: 100,
      dataIndex: "email",
      align: "left",
    },
    {
      title: "Position",
      width: 100,
      dataIndex: "position",
      align: "left",
    },
    {
      title: "Role",
      width: 100,
      dataIndex: "role",
      align: "left",
    },
    {
      title: "Status",
      width: 100,
      dataIndex: "status",
      align: "left",
    },
    {
      title: "Action",
      width: 100,
      dataIndex: "action",
      align: "left",
    },
  ];

  // Action Option
  const items = [
    {
      key: "1",
      label: (
        <a rel="noopener noreferrer" href="/sale-plan/work-plan/edit">
          edit
        </a>
      ),
    },
  ];

  useEffect(() => {
    let dataSource = [
      {
        key: 1,
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
        name:"Chayanon Tunyateerapong ",
        status: (
          <BadgeStatus text="Active" bgColor="#00783F" textColor="#FFFFFF" />
        ),
        contact_number:"0818590775",
        email:"chayanon.tunyateerapong@adama.com",
        position:"Industrial Business Sales Director",
        role:"All Sales Module",
      },
    ];

    setDataSource(dataSource);
  }, []);

  return (
    <>
      <MainLayout loading={loading}>
        <div className="flex items-center justify-between">
          <div className="title-page">Manage Users</div>
          <ActionButton mode="create" text="Create" onClick={(e) => navigate("/setting/user/create")}/>
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
    </>
  );
}
