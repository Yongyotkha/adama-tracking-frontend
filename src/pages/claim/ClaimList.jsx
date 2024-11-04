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

export default function ClaimList() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const navigate = useNavigate();

  const filters = [
    {
      key: "name",
      type: "text",
      label: "Name",
      placeholder: "All",
    },
  ];

  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "left" },
    { title: "Name", width: 200, dataIndex: "name", align: "left" },
    { title: "Description", width: 300, dataIndex: "description", align: "left" },
    { title: "Value (THB)", width: 100, dataIndex: "value", align: "right" },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const actionItems = [
    {
      key: "1",
      label: (
        <ItemDropDown
          mode="edit"
          onClick={(e) => navigate("/setting/promotion/edit")}
        />
      ),
    },
    {
      key: "2",
      label: (
        <ItemDropDown mode="delete" />
      ),
    },
  ];

  useEffect(() => {
    const dataSource = [
      {
        key: 1,
        name: "Cooler Box M11 - กระติกน้ำ คละสี",
        description: "Cooler Box M11 - กระติกน้ำ คละสี",
        value: "0",
        status: (
          <BadgeStatus
            text="Active"
            bgColor="#009845"
            textColor="#FFFFFF"
          />
        ),
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottom">
            <a onClick={(e) => e.preventDefault()}>
              <img
                src="/img/icons/action.png"
                alt="Actions icon"
                className="inline-block w-5 h-5"
              />
            </a>
          </Dropdown>
        ),
      },
      {
        key: 2,
        name: "Adama Bag (กระเป๋าผ้าสีเขียบนอมด์)",
        description: "Adama Bag (กระเป๋าผ้าสีเขียบนอมด์)",
        value: "0",
        status: (
          <BadgeStatus
            text="Active"
            bgColor="#009845"
            textColor="#FFFFFF"
          />
        ),
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottom">
            <a onClick={(e) => e.preventDefault()}>
              <img
                src="/img/icons/action.png"
                alt="Actions icon"
                className="inline-block w-5 h-5"
              />
            </a>
          </Dropdown>
        ),
      },
      {
        key: 3,
        name: "เสื้อยืดแขนยาว - นาโพลิค",
        description: "เสื้อยืดแขนยาว - นาโพลิค",
        value: "0",
        status: (
          <BadgeStatus
            text="Active"
            bgColor="#009845"
            textColor="#FFFFFF"
          />
        ),
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottom">
            <a onClick={(e) => e.preventDefault()}>
              <img
                src="/img/icons/action.png"
                alt="Actions icon"
                className="inline-block w-5 h-5"
              />
            </a>
          </Dropdown>
        ),
      },
      {
        key: 4,
        name: "เสื้อเชิ้ตยีนส์แขนยาว - อานา",
        description: "เสื้อเชิ้ตยีนส์แขนยาว - อานา",
        value: "0",
        status: (
          <BadgeStatus
            text="Active"
            bgColor="#009845"
            textColor="#FFFFFF"
          />
        ),
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottom">
            <a onClick={(e) => e.preventDefault()}>
              <img
                src="/img/icons/action.png"
                alt="Actions icon"
                className="inline-block w-5 h-5"
              />
            </a>
          </Dropdown>
        ),
      },
      {
        key: 5,
        name: "เสื้อยืดคอกลมแขนยาว - เมโซรี่",
        description: "เสื้อยืดคอกลมแขนยาว - เมโซรี่",
        value: "0",
        status: (
          <BadgeStatus
            text="Active"
            bgColor="#009845"
            textColor="#FFFFFF"
          />
        ),
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottom">
            <a onClick={(e) => e.preventDefault()}>
              <img
                src="/img/icons/action.png"
                alt="Actions icon"
                className="inline-block w-5 h-5"
              />
            </a>
          </Dropdown>
        ),
      },
      {
        key: 6,
        name: "เสื้อยืดคอกลมแขนยาว - โรยอน โกลด์ (สีเทา)",
        description: "เสื้อยืดคอกลมแขนยาว - โรยอน โกลด์ (สีเทา)",
        value: "0",
        status: (
          <BadgeStatus
            text="Active"
            bgColor="#009845"
            textColor="#FFFFFF"
          />
        ),
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottom">
            <a onClick={(e) => e.preventDefault()}>
              <img
                src="/img/icons/action.png"
                alt="Actions icon"
                className="inline-block w-5 h-5"
              />
            </a>
          </Dropdown>
        ),
      },
      {
        key: 7,
        name: "แก้วน้ำใส อานา",
        description: "แก้วน้ำใส อานา",
        value: "0",
        status: (
          <BadgeStatus
            text="Active"
            bgColor="#009845"
            textColor="#FFFFFF"
          />
        ),
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottom">
            <a onClick={(e) => e.preventDefault()}>
              <img
                src="/img/icons/action.png"
                alt="Actions icon"
                className="inline-block w-5 h-5"
              />
            </a>
          </Dropdown>
        ),
      },
      {
        key: 8,
        name: "หมวกนักเผด็จสายทหาร - พลักอำร่า",
        description: "หมวกนักเผด็จสายทหาร - พลักอำร่า",
        value: "0",
        status: (
          <BadgeStatus
            text="Active"
            bgColor="#009845"
            textColor="#FFFFFF"
          />
        ),
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottom">
            <a onClick={(e) => e.preventDefault()}>
              <img
                src="/img/icons/action.png"
                alt="Actions icon"
                className="inline-block w-5 h-5"
              />
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
        <div className="title-page">Promotion Management</div>
        <ActionButton mode="create" text="Create" onClick={(e) => navigate("/setting/promotion/create")} />
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
