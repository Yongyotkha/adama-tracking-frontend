import React, { useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import { Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";

export default function RedeemProduct() {
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

  const mockData = [
    {
      id: 1,
      code: "20250001",
      rewardName: "Reward 1",
      dealerPoint: 100,
      subDealerPoint: 90,
    },
    {
      id: 2,
      code: "20250002",
      rewardName: "Reward 2",
      dealerPoint: 100,
      subDealerPoint: 90,
    },
  ];

  useEffect(() => {
    setTableLoading(true);
    setTimeout(() => {
      const formatted = mockData.map((item, index) => ({
        key: index + 1,
        code: item.code,
        rewardName: item.rewardName,
        picture: (
          <div className="w-12 h-8 bg-gray-200 rounded-md mx-auto" />
        ),
        dealerPoint: item.dealerPoint,
        subDealerPoint: item.subDealerPoint,
        action: (
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  label: (
                    <ItemDropDown
                      mode="edit"
                      onClick={() => navigate(`/rewards/edit/${item.id}`)}
                    />
                  ),
                },
                {
                  key: "view",
                  label: (
                    <ItemDropDown
                      mode="view"
                      onClick={() => navigate(`/rewards/view/${item.id}`)}
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

  const handleTableChange = (pagination) => {
    setTableParams({ pagination });
  };

  const filters = [
    { key: "code", type: "text", label: "Code" },
    { key: "rewardName", type: "text", label: "Reward Name" },
    { key: "date", type: "date", label: "Date" },
  ];

  const header = [
    { title: "No", dataIndex: "key", align: "left", width: 50 },
    { title: "Code", dataIndex: "code", align: "left" },
    { title: "Reward Name", dataIndex: "rewardName", align: "left" },
    { title: "Picture", dataIndex: "picture", align: "center" },
    { title: "Dealer Point", dataIndex: "dealerPoint", align: "center" },
    { title: "Sub Dealer Point", dataIndex: "subDealerPoint", align: "center" },
    { title: "Action", dataIndex: "action", align: "center" },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Redeem Product</div>
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
