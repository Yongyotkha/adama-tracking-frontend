import React, { useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import { Dropdown } from "antd";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";

export default function RewardProductList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
  });

  // 🔹 Mock Data
  const mockData = [
    {
      id: 1,
      reward_code: "20250001",
      reward_name: "Name",
      image_url: "/img/profile.jpg",
      period: "01/01/2025 - 31/12/2025",
      value: 100.0,
      status: "Pending",
    },
    {
      id: 2,
      reward_code: "20250002",
      reward_name: "Name",
      image_url: "/img/profile.jpg",
      period: "01/01/2025 - 31/12/2025",
      value: 100.0,
      status: "Pending",
    },
  ];

  useEffect(() => {
    setTableLoading(true);
    setTimeout(() => {
      const formatted = mockData.map((item, index) => ({
        key: index + 1,
        image_profile: (
          <img
            src={item.image_url}
            alt="Reward"
            className="w-10 h-10 rounded-full"
          />
        ),
        reward_code: item.reward_code,
        reward_name: item.reward_name,
        period: item.period,
        value: item.value.toFixed(2),
        status: (
          <BadgeStatus
            text={item.status}
            bgColor="orange"
            textColor="white"
          />
        ),
        action: (
          <Dropdown
            menu={{
              items: [
                {
                  key: "create",
                  label: (
                    <ItemDropDown mode="create" onClick={() => navigate(`/reward/create`)} />
                  ),
                },
                {
                  key: "edit",
                  label: (
                    <ItemDropDown mode="edit" onClick={() => navigate(`/reward/edit/${item.id}`)} />
                  ),
                },
                {
                  key: "view",
                  label: (
                    <ItemDropDown mode="view" onClick={() => navigate(`/reward/view/${item.id}`)} />
                  ),
                },
                {
                  key: "delete",
                  label: (
                    <ItemDropDown mode="delete" onClick={() => alert(`Delete ${item.id}`)} />
                  ),
                },
              ],
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <img
                src="/img/icons/action.png"
                alt="action"
                className="inline-block w-5 h-5"
              />
            </a>
          </Dropdown>
        ),
      }));

      setDataSource(formatted);
      setTableLoading(false);
    }, 500);
  }, []);

  const filters = [
    { key: "reward_code", type: "text", label: "Reward Code" },
    { key: "reward_name", type: "text", label: "Reward Name" },
    { key: "date", type: "date", label: "Date" },
  ];

  const handleSearch = (filters) => {
    setTableParams({
      ...tableParams,
      pagination: { ...tableParams.pagination, current: 1 },
      filters,
    });
  };

  const handleClear = () => {
    setTableParams({ ...tableParams, filters: {} });
  };

  const header = [
    { title: "No", dataIndex: "key", align: "center", width: 50 },
    { title: "", dataIndex: "image_profile", align: "center" },
    { title: "Reward Code", dataIndex: "reward_code", align: "left" },
    { title: "Reward Name", dataIndex: "reward_name", align: "left" },
    { title: "Period", dataIndex: "period", align: "center" },
    { title: "Value", dataIndex: "value", align: "center" },
    { title: "Status", dataIndex: "status", align: "center" },
    { title: "Action", dataIndex: "action", align: "center" },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Request Purchase</div>
        <ActionButton mode="create" text="Create" onClick={() => navigate("create")} />
      </div>

      <Filter filters={filters} onSearch={handleSearch} onClear={handleClear} />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
