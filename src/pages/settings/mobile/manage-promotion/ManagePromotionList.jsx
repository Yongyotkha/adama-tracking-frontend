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

export default function ManagePromotionList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  // Mock Data
  const mockData = [
    {
      id: 1,
      title: "Name 1",
      date: "07/03/2025",
      expire_date: "07/12/2025",
      value: "100.00",
      status: "Active",
      image: "/img/promotion-exam.png",
    },
    {
      id: 2,
      title: "Name 2",
      date: "07/03/2025",
      expire_date: "07/12/2025",
      value: "100.00",
      status: "Active",
      image: "/img/promotion-exam.png",
    },
  ];

  useEffect(() => {
    setTableLoading(true);
    setTimeout(() => {
      const formattedData = mockData.map((item, index) => ({
        key: index + 1,
        image_profile: (
          <img src={item.image} alt="profile" className="w-8 h-8 rounded-full object-cover" />
        ),
        title: (
          <div className="flex items-center">
            {item.title}
          </div>
        ),
        date: item.date,
        expire_date: item.expire_date,
        value: item.value,
        status: <BadgeStatus text={item.status} bgColor="green" textColor="white" />,
        action: (
          <Dropdown
            menu={{
              items: [
                { key: "edit", label: <ItemDropDown mode="edit" onClick={() => navigate(`edit/${item.id}`)} /> },
                { key: "delete", label: <ItemDropDown mode="delete" onClick={() => alert("Delete action")} /> },
              ],
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <img src="/img/icons/action.png" alt="action" className="inline-block w-5 h-5" />
            </a>
          </Dropdown>
        ),
      }));
      setDataSource(formattedData);
      setTableLoading(false);
    }, 500);
  }, []);

  const filters = [
    { key: "reward_code", type: "text", label: "Reward Code" },
    { key: "reward_name", type: "text", label: "Reward Name" },
    { key: "date", type: "date", label: "Date" },
  ];

  const header = [
    { title: "No", dataIndex: "key", align: "left", width: 50 },
    { title: "", dataIndex: "image_profile", align: "center", width: 80 },
    { title: "Title", dataIndex: "title", align: "left" },
    { title: "Date", dataIndex: "date", align: "left" },
    { title: "Expire Date", dataIndex: "expire_date", align: "left" },
    { title: "Value", dataIndex: "value", align: "left" },
    { title: "Status", dataIndex: "status", align: "left" },
    { title: "Action", dataIndex: "action", align: "center", width: 50 },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Manage Promotion</div>
        <ActionButton mode="create" text="Create" onClick={() => navigate("create")} />
      </div>
      <Filter filters={filters} />
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
