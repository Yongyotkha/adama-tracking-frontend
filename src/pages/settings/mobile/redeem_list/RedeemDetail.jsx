import React, { useEffect, useState } from "react";
import { Dropdown, Tabs } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../../components/button/ActionButton";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";

const { TabPane } = Tabs;

export default function RedeemDetail() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  // --- List state ---
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  // --- Request state ---
  const [requestTableLoading, setRequestTableLoading] = useState(false);
  const [requestDataSource, setRequestDataSource] = useState([]);
  const [requestTableParams, setRequestTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  const filtersList = [
    { key: "target", type: "text", label: "Target Name" },
    { key: "type", type: "text", label: "Type Name" },
    {
      key: "use_flag",
      type: "select",
      label: "Status",
      options: [
        { id: "1", name: "Active" },
        { id: "0", name: "Inactive" },
      ],
    },
  ];

  const filtersRequest = [
    { key: "shop", type: "text", label: "Shop Name" },
    { key: "customer", type: "text", label: "Customer Name" },
    { key: "reward", type: "text", label: "Reward Name" },
    {
      key: "status",
      type: "select",
      label: "Status",
      options: [
        { id: "PENDING", name: "Pending" },
        { id: "APPROVED", name: "Approved" },
        { id: "REJECTED", name: "Rejected" },
      ],
    },
  ];

  const renderStatus = (use_flag) => {
    const isActive = use_flag === "1";
    return (
      <BadgeStatus
        text={isActive ? "Active" : "Inactive"}
        bgColor={isActive ? "green" : "gray"}
        textColor="white"
      />
    );
  };

  const listHeader = [
    { title: "No", dataIndex: "key" },
    { title: "Shop Name", dataIndex: "shop_name" },
    { title: "Customer Name", dataIndex: "customer_name" },
    { title: "Reward Name", dataIndex: "reward_name" },
    { title: "Type", dataIndex: "type" },
    { title: "Point", dataIndex: "point", align: "center" },
    { title: "Create Date", dataIndex: "created_at", align: "center" },
    { title: "Status", dataIndex: "status", align: "center" },
    { title: "Action", dataIndex: "action", align: "center" },
  ];

  const requestHeader = [
    { title: "No", dataIndex: "key" },
    { title: "Shop Name", dataIndex: "shop_name" },
    { title: "Customer Name", dataIndex: "customer_name" },
    { title: "Reward Name", dataIndex: "reward_name" },
    { title: "QTY (Pcs)", dataIndex: "qty", align: "right" },
    { title: "Points", dataIndex: "points", align: "right" },
    { title: "Date", dataIndex: "date", align: "center" },
    { title: "Status", dataIndex: "status", align: "center" },
    { title: "Action", dataIndex: "action", align: "center" },
  ];

  // --- Fetch list ---
  const fetchList = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    try {
      const res = await useServiceAPI.get(paths.pathRedeemList, {
        platform: "web",
        process: "receive-reward",
        page: "all",
        page_size: pageSize,
        page_length: current,
      });
      if (res.status === 200) {
        const list = res.data?.data || [];
        const formatted = list.map((item, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          id: item.id,
          shop_name: item.shop_name || "-",
          customer_name: item.name_en || "-",
          reward_name: item.reward_name || "-",
          type: item.type || "-",
          point: item.point ?? "-",
          created_at: item.created_at?.split(" ")[0],
          status: renderStatus(item.use_flag),
          action: (
            <Dropdown
              menu={{
                items: (item.action || []).map((act, i) => ({
                  key: i,
                  label: (
                    <ItemDropDown
                      mode={act.action.toLowerCase()}
                      onClick={() =>
                        navigate(`/setting/line/target-group/${act.action.toLowerCase()}`, {
                          state: { id: item.id },
                        })
                      }
                    />
                  ),
                })),
              }}
              placement="bottomRight"
            >
              <a onClick={(e) => e.preventDefault()}>
                <img src="/img/icons/action.png" alt="action" className="inline-block w-5 h-5" />
              </a>
            </Dropdown>
          ),
        }));
        setDataSource(formatted);
        setTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total: res.data.records_filtered },
        }));
      }
    } finally {
      setTableLoading(false);
    }
  };

  // --- Fetch request ---
  const fetchRequest = async () => {
    setRequestTableLoading(true);
    const { current, pageSize } = requestTableParams.pagination;
    try {
      const res = await useServiceAPI.get(paths.pathRedeemRequestList, {
        platform: "web",
        process: "redeem-reward-request",
        page: "all",
        page_size: pageSize,
        page_length: current,
      });
      if (res.status === 200) {
        const list = res.data?.data || [];
        const formatted = list.map((item, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          shop_name: item.shop_name || "-",
          customer_name: item.customer_name || "-",
          reward_name: item.reward_name || "-",
          qty: item.qty ?? "-",
          points: item.points ?? "-",
          date: item.created_at?.split(" ")[0],
          status: (
            <BadgeStatus
              text={item.status_name}
              bgColor={item.status_bg_color || "gray"}
              textColor={item.status_color || "white"}
            />
          ),
          action: (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "view",
                    label: (
                      <ItemDropDown
                        mode="view"
                        onClick={() =>
                          navigate("/redeem/reward/request/view", { state: { id: item.id } })
                        }
                      />
                    ),
                  },
                ],
              }}
            >
              <a onClick={(e) => e.preventDefault()}>
                <img src="/img/icons/action.png" alt="action" className="inline-block w-5 h-5" />
              </a>
            </Dropdown>
          ),
        }));
        setRequestDataSource(formatted);
        setRequestTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total: res.data.records_filtered },
        }));
      }
    } finally {
      setRequestTableLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "list") fetchList();
    else fetchRequest();
  }, [activeTab, tableParams.pagination.current, requestTableParams.pagination.current]);

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Redeem Reward</div>
        <ActionButton mode="create" text="Create" onClick={() => navigate("create")} />
      </div>

      <Tabs className="custom-tabs" activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span className="tab-title">Redeem Reward List</span>} key="list">
          <Filter filters={filtersList} />
          <BoxPrimary>
            <TableComponent
              header={listHeader}
              dataSource={dataSource}
              loading={tableLoading}
              pagination={tableParams.pagination}
              onChange={(pagination) =>
                setTableParams((prev) => ({ ...prev, pagination }))
              }
            />
          </BoxPrimary>
        </TabPane>

        <TabPane tab={<span className="tab-title">Redeem Reward Request List</span>} key="request">
          <Filter filters={filtersRequest} />
          <BoxPrimary>
            <TableComponent
              header={requestHeader}
              dataSource={requestDataSource}
              loading={requestTableLoading}
              pagination={requestTableParams.pagination}
              onChange={(pagination) =>
                setRequestTableParams((prev) => ({ ...prev, pagination }))
              }
            />
          </BoxPrimary>
        </TabPane>
      </Tabs>
    </MainLayout>
  );
}
