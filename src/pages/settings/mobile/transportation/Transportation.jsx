import React, { useEffect, useState } from "react";
import { Dropdown, Tabs } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";

const { TabPane } = Tabs;

/** ---------- Send By options (ค่าตรง API) ---------- */
const SEND_BY_OPTIONS = [
  { id: "Mail/Ship", name: "Mail/Ship" },
  { id: "Staff", name: "Staff" },
];

/** ---------- Status Tran options ---------- */
const STATUS_TRAN_OPTIONS = [
  { id: "RTP", name: "Prepare" },
  { id: "RTD", name: "Delivery" },
  { id: "RTV", name: "Delivered" },
];

/** ---------- Active/Inactive map to use_flag ---------- */
const STATUS_ACTIVE_OPTIONS = [
  { id: "1", name: "Active" },
  { id: "0", name: "Inactive" },
];

export default function Transportation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("transport");

  // --- Transportation List state ---
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  // --- Preparation List state ---
  const [prepTableLoading, setPrepTableLoading] = useState(false);
  const [prepDataSource, setPrepDataSource] = useState([]);
  const [prepTableParams, setPrepTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  /** ---------------- Filters ----------------
   * เพิ่ม:
   * - status_tran: multiple
   * - keyword: text
   * - status: select -> map ไป use_flag
   */
  const commonFilters = [
    { key: "sub_dealer_name", type: "text", label: "Sub Dealer Name" },
    { key: "send_by", type: "select", label: "Send By", options: SEND_BY_OPTIONS },
    { key: "send_at", type: "date", label: "Send Date" },
    { key: "dater", type: "dater", label: "Date Range" },
    // { key: "status_tran", type: "select", label: "Status (Tran)", options: STATUS_TRAN_OPTIONS, multiple: true },
    { key: "keyword", type: "text", label: "Keyword" },
    // { key: "status", type: "select", label: "Status (Active)", options: STATUS_ACTIVE_OPTIONS }, // use_flag
  ];
  const filtersTransportation = commonFilters;
  const filtersPreparation = commonFilters;

  /** ---------------- Columns ---------------- */
  const columns = [
    { title: "Date", dataIndex: "date", align: "left", width: 140 },
    { title: "Customer Name", dataIndex: "sub_dealer_name", align: "left" },
    { title: "Reward Code", dataIndex: "reward_code", align: "left", width: 160 },
    { title: "Reward Name", dataIndex: "reward_name", align: "left" },
    { title: "QTY", dataIndex: "qty", align: "right", width: 100 },
    { title: "Cost (THB)", dataIndex: "cost", align: "right", width: 120 },
    { title: "Send By", dataIndex: "send_by", align: "center", width: 140 },
    { title: "Send Date", dataIndex: "send_date", align: "center", width: 140 },
    { title: "Status", dataIndex: "status", align: "center", width: 140 },
    { title: "Action", dataIndex: "action", align: "center", width: 90 },
  ];

  /** ---------------- Fetch: Transportation List ---------------- */
  const fetchTransportation = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};

    // default status_tran ถ้าไม่เลือกในแท็บนี้ = ["RTD","RTV"]
    const statusTran =
      Array.isArray(f.status_tran) && f.status_tran.length > 0
        ? f.status_tran
        : ["RTD", "RTV"];

    try {
      const res = await useServiceAPI.get(paths.pathTransportList, {
        page_size: pageSize,
        page_length: current,
        status_tran: statusTran,
        sub_dealer_name: f.sub_dealer_name || "",
        send_by: f.send_by || "",
        send_at: f.send_at || "",
        dater: f.dater || [],
        keyword: f.keyword || "",
        use_flag: f.status ?? "", // map status -> use_flag
      });

      if (res.status === 200) {
        const rows = res.data?.data || [];
        const mapped = rows.map((item, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          date: item.created_at?.split?.(" ")[0] || "-",
          sub_dealer_name: item.sub_dealer_name || "-",
          reward_code: item.reward_code || "-",
          reward_name: item.reward_name || "-",
          qty: item.reward_value ?? "-",
          cost: item.reward_cost ?? "-",
          send_by: item.send_by || "-",
          send_date: item.send_at ? item.send_at.split(" ")[0] : "-",
          status: (
            <BadgeStatus
              text={item.status_tran_name || item.status_tran_namsse || "-"}
              bgColor={item.status_tran_bg_color || "gray"}
              textColor={item.status_tran_color || "white"}
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
                          navigate("/points/line/transportation/view", {
                            state: { id: item.id, mode: "delivered" },
                          })
                        }
                      />
                    ),
                  },
                  ...(item.status_tran === "RTD"
                    ? [
                        {
                          key: "delivery",
                          label: (
                            <ItemDropDown
                              mode="edit"
                              text={"Delivery"}
                              onClick={() =>
                                navigate("/points/line/transportation/delivery", {
                                  state: { id: item.id, mode: "delivery" },
                                })
                              }
                            />
                          ),
                        },
                      ]
                    : []),
                ],
              }}
              placement="bottomRight"
            >
              <a onClick={(e) => e.preventDefault()}>
                <img src="/img/icons/action.png" alt="action" className="inline-block w-5 h-5" />
              </a>
            </Dropdown>
          ),
        }));

        setDataSource(mapped);
        setTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total: res.data.records_filtered },
        }));
      }
    } finally {
      setTableLoading(false);
    }
  };

  /** ---------------- Fetch: Preparation List ---------------- */
  const fetchPreparation = async () => {
    setPrepTableLoading(true);
    const { current, pageSize } = prepTableParams.pagination;
    const f = prepTableParams.filters || {};

    // default status_tran ถ้าไม่เลือกในแท็บนี้ = ["RTP"]
    const statusTran =
      Array.isArray(f.status_tran) && f.status_tran.length > 0
        ? f.status_tran
        : ["RTP"];

    try {
      const res = await useServiceAPI.get(paths.pathTransportList, {
        page_size: pageSize,
        page_length: current,
        status_tran: statusTran,
        sub_dealer_name: f.sub_dealer_name || "",
        send_by: f.send_by || "",
        send_at: f.send_at || "",
        dater: f.dater || [],
        keyword: f.keyword || "",
        use_flag: f.status ?? "", // map status -> use_flag
      });

      if (res.status === 200) {
        const rows = res.data?.data || [];
        const mapped = rows.map((item, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          date: item.created_at ? item.created_at.split(" ")[0] : "-",
          sub_dealer_name: item.sub_dealer_name || "-",
          reward_code: item.reward_code || "-",
          reward_name: item.reward_name || "-",
          qty: item.reward_value ?? "-",
          cost: item.reward_cost ?? "-",
          send_by: item.send_by || "-",
          send_date: item.send_at ? item.send_at.split(" ")[0] : "-",
          status: (
            <BadgeStatus
              text={item.status_tran_name || item.status_tran_namsse || "Prepare"}
              bgColor={item.status_tran_bg_color || "#b5aca4"}
              textColor={item.status_tran_color || "#ffffff"}
            />
          ),
          action: (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "prepare",
                    label: (
                      <ItemDropDown
                        mode="edit"
                        onClick={() =>
                          navigate("/points/line/transportation/prepare", {
                            state: { id: item.id },
                          })
                        }
                      />
                    ),
                  },
                ],
              }}
              placement="bottomRight"
            >
              <a onClick={(e) => e.preventDefault()}>
                <img src="/img/icons/action.png" alt="action" className="inline-block w-5 h-5" />
              </a>
            </Dropdown>
          ),
        }));

        setPrepDataSource(mapped);
        setPrepTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total: res.data.records_filtered },
        }));
      }
    } finally {
      setPrepTableLoading(false);
    }
  };

  /** ---------------- Effects ---------------- */
  useEffect(() => {
    if (activeTab === "transport") fetchTransportation();
    else fetchPreparation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    tableParams.pagination.current,
    prepTableParams.pagination.current,
    JSON.stringify(tableParams.filters),
    JSON.stringify(prepTableParams.filters),
  ]);

  /** ---------------- Handlers ---------------- */
  const onSearchTransport = (filters) => {
    setTableParams((prev) => ({
      ...prev,
      filters,
      pagination: { ...prev.pagination, current: 1 },
    }));
  };
  const onClearTransport = () => {
    setTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  const onSearchPrep = (filters) => {
    setPrepTableParams((prev) => ({
      ...prev,
      filters,
      pagination: { ...prev.pagination, current: 1 },
    }));
  };
  const onClearPrep = () => {
    setPrepTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Reward Transaction</div>
      </div>

      <Tabs className="custom-tabs" activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span className="tab-title">Transaction List</span>} key="transport">
          <Filter filters={filtersTransportation} onSearch={onSearchTransport} onClear={onClearTransport} />
          <BoxPrimary className="mt-4">
            <TableComponent
              header={columns}
              dataSource={dataSource}
              loading={tableLoading}
              pagination={tableParams.pagination}
              onChange={(pagination) => setTableParams((prev) => ({ ...prev, pagination }))}
            />
          </BoxPrimary>
        </TabPane>

        <TabPane tab={<span className="tab-title">Transaction Preparation List</span>} key="preparation">
          <Filter filters={filtersPreparation} onSearch={onSearchPrep} onClear={onClearPrep} />
          <BoxPrimary className="mt-4">
            <TableComponent
              header={columns}
              dataSource={prepDataSource}
              loading={prepTableLoading}
              pagination={prepTableParams.pagination}
              onChange={(pagination) => setPrepTableParams((prev) => ({ ...prev, pagination }))}
            />
          </BoxPrimary>
        </TabPane>
      </Tabs>
    </MainLayout>
  );
}
