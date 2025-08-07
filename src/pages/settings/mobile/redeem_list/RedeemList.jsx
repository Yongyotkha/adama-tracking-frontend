import React, { useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import { Dropdown } from "antd";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";

export default function RedeemList() {
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

  // 🔹 Mock Data
  const mockData = [
    {
      id: 1,
      shop_name: "กัลยาการเกษตร",
      customer_name: "Firstname Lastname",
      reward_name: "Reward 1",
      type: "Double Point",
      point: 20,
      date: "01/12/2025",
      status: "Pending",
    },
    {
      id: 2,
      shop_name: "กำนันบงลักษณ์",
      customer_name: "Firstname Lastname",
      reward_name: "Reward 2",
      type: "Double Point",
      point: 20,
      date: "01/12/2025",
      status: "Pending",
    },
  ];

  useEffect(() => {
    setTableLoading(true);
    setTimeout(() => {
      const formatted = mockData.map((item, index) => ({
        key: index + 1,
        shop_name: item.shop_name,
        customer_name: item.customer_name,
        reward_name: item.reward_name,
        type: item.type,
        point: item.point,
        date: item.date,
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
                  key: "edit",
                  label: (
                    <ItemDropDown
                      mode="edit"
                      onClick={() => navigate(`/redeem/edit/${item.id}`)}
                    />
                  ),
                },
                {
                  key: "view",
                  label: (
                    <ItemDropDown
                      mode="view"
                      onClick={() => navigate(`/redeem/view/${item.id}`)}
                    />
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
    { key: "shop_name", type: "text", label: "Shop Name" },
    { key: "customer_name", type: "text", label: "Contact Name" },
    { key: "date", type: "date", label: "Date" },
  ];

  const handleTableChange = (pagination) => {
    setTableParams({ pagination });
  };

  const header = [
    { title: "No", dataIndex: "key", align: "left", width: 50 },
    { title: "Shop Name", dataIndex: "shop_name", align: "left" },
    { title: "Customer Name", dataIndex: "customer_name", align: "left" },
    { title: "Reward Name", dataIndex: "reward_name", align: "left" },
    { title: "Type", dataIndex: "type", align: "left" },
    { title: "Point", dataIndex: "point", align: "center" },
    { title: "Date", dataIndex: "date", align: "center" },
    { title: "Status", dataIndex: "status", align: "center" },
    { title: "Action", dataIndex: "action", align: "center" },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Redeem Reward List</div>
      </div>

      <Filter filters={filters} />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
          onChange={handleTableChange}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
