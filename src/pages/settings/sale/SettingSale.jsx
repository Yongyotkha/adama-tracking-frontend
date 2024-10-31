import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown, Modal } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import DynamicModal from "../../../components/modal/DynamicModal";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";

export default function SettingSale() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isTerritoryModalVisible, setIsTerritoryModalVisible] = useState(false);
  const [isBDModalVisible, setIsBDModalVisible] = useState(false);
  const [isSAModalVisible, setIsSAModalVisible] = useState(false);
  const navigate = useNavigate();

  const filters = [
    {
      key: "sale_head_name",
      type: "select",
      label: "Sale Head Name",
      options: [
        { value: "", label: "All" },
        { value: "Chayanon Tunyateerapong", label: "Chayanon Tunyateerapong" },
        { value: "John Doe", label: "John Doe" },
      ],
    },
    {
      key: "sale_area_name",
      type: "select",
      label: "Sale Area Name",
      options: [
        { value: "", label: "All" },
        { value: "Veerasak Likitmanchai", label: "Veerasak Likitmanchai" },
        { value: "Cheerayut Inthong", label: "Cheerayut Inthong" },
      ],
    },
  ];

  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  const handleShowTerritoryModal = () => {
    setIsTerritoryModalVisible(true);
  };

  const handleShowBDModal = () => {
    setIsBDModalVisible(true);
  };

  const handleShowSAModal = () => {
    setIsSAModalVisible(true);
  };

  const handleCloseTerritoryModal = () => {
    setIsTerritoryModalVisible(false);
  };

  const handleCloseBDModal = () => {
    setIsBDModalVisible(false);
  };

  const handleCloseSAModal = () => {
    setIsSAModalVisible(false);
  };

  const territoryColumns = [
    { title: "No", dataIndex: "key", key: "key", width: 50 },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Territory", dataIndex: "territory", key: "territory" },
    { title: "Position", dataIndex: "position", key: "position" },
  ];

  const territoryData = [
    {
      key: 1,
      name: "Kornkan Induang",
      territory: "Left North",
      position: "Sales Executive",
    },
    {
      key: 2,
      name: "Phaisan Jethuen",
      territory: "Left Lower North",
      position: "Sales Executive",
    },
    // Additional data...
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    {
      title: "Sale Head Name",
      width: 200,
      dataIndex: "sale_head_name",
      align: "left",
    },
    {
      title: "Sale Area Name",
      width: 200,
      dataIndex: "sale_area_name",
      align: "left",
    },
    { title: "Area", width: 100, dataIndex: "area", align: "left" },
    { title: "Sale", width: 100, dataIndex: "sale", align: "center" },
    {
      title: "Business Development",
      width: 150,
      dataIndex: "business_dev",
      align: "center",
    },
    {
      title: "Sale Assistant",
      width: 150,
      dataIndex: "sale_assistant",
      align: "center",
    },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const actionItems = [
    {
      key: "1",
      label: (
        <ItemDropDown
          mode="edit"
          onClick={(e) => navigate("/setting/sale/edit")}
        />
      ),
    },
    {
      key: "2",
      label: (
        <ItemDropDown
          mode="delete"
          // onClick={(e) => navigate("/setting/sale/edit")}
        />
      ),
    },
  ];

  useEffect(() => {
    const dataSource = [
      {
        key: 1,
        sale_head_name: "Chayanon Tunyateerapong",
        sale_area_name: "Veerasak Likitmanchai",
        area: "Area1",
        sale: (
          <BadgeStatus
            text="8"
            bgColor="#FFB020"
            textColor="#FFFFFF"
            onClick={handleShowTerritoryModal}
          />
        ),
        business_dev: (
          <BadgeStatus
            text="4"
            bgColor="#FFB020"
            textColor="#FFFFFF"
            onClick={handleShowBDModal}
          />
        ),
        sale_assistant: (
          <BadgeStatus
            text="4"
            bgColor="#FFB020"
            textColor="#FFFFFF"
            onClick={handleShowSAModal}
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
        sale_head_name: "Chayanon Tunyateerapong",
        sale_area_name: "Cheerayut Inthong",
        area: "Area2",
        sale: <BadgeStatus text="7" bgColor="#FFB020" textColor="#FFFFFF" />,
        business_dev: (
          <BadgeStatus text="7" bgColor="#FFB020" textColor="#FFFFFF" />
        ),
        sale_assistant: (
          <BadgeStatus text="7" bgColor="#FFB020" textColor="#FFFFFF" />
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
        <div className="title-page">Sale Management</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={(e) => navigate("/setting/sale/create")}
        />
      </div>

      <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} />

      <BoxPrimary>
        <TableComponent header={header} dataSource={dataSource} />
      </BoxPrimary>

      {/* Dynamic Modal Instances */}
      <DynamicModal
        title="Sale Territory"
        isVisible={isTerritoryModalVisible}
        onClose={handleCloseTerritoryModal}
        header={territoryColumns}
        dataSource={territoryData}
        width="1200px" // Customize the width to make it extra-large
      />

      <DynamicModal
        title="Sale Team (Business Development)"
        isVisible={isBDModalVisible}
        onClose={handleCloseBDModal}
        header={territoryColumns}
        dataSource={territoryData}
        width="1200px" // Customize the width to make it extra-large
      />

      <DynamicModal
        title="Sale Team (Sale Assistant)"
        isVisible={isSAModalVisible}
        onClose={handleCloseSAModal}
        header={territoryColumns}
        dataSource={territoryData}
        width="1200px" // Customize the width to make it extra-large
      />
    </MainLayout>
  );
}
