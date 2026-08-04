import React, { useEffect, useState } from "react";
import { Dropdown, Tabs, Modal } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";

const { TabPane } = Tabs;

const STATUS_OPTIONS_LIST = [
  { code: "RFA", name: "Pending Shipment" },
  { code: "RFR", name: "Delivered" },
];

const STATUS_OPTIONS_REQUEST = [
  { code: "RFP", name: "Waiting for Purchase" },
  { code: "RFA", name: "Pending Shipment" },
];

export default function FarmerPointRedeem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  // --- List state ---
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {
      shop_name: "",
      dater: [],
      status: "",
    },
  });

  // --- Request state ---
  const [requestTableLoading, setRequestTableLoading] = useState(false);
  const [requestDataSource, setRequestDataSource] = useState([]);
  const [requestTableParams, setRequestTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {
      shop_name: "",
      dater: [],
      status: "",
    },
  });

  // --- Address Modal state ---
  const [addressModal, setAddressModal] = useState({ open: false, address: "" });
  const openAddressModal = (address) => setAddressModal({ open: true, address: address || "-" });
  const closeAddressModal = () => setAddressModal({ open: false, address: "" });

  // ---------------- Filters config (UI) ----------------
  const filtersList = [
    { key: "shop_name", type: "text", label: "Farmer Name" },
    { key: "dater", type: "dater", label: "Date Range" },
    { key: "status", type: "select", label: "Status", options: STATUS_OPTIONS_LIST, placeholder: "All" },
  ];
  const filtersRequest = [
    { key: "shop_name", type: "text", label: "Farmer Name" },
    { key: "dater", type: "dater", label: "Date Range" },
    { key: "status", type: "select", label: "Status", options: STATUS_OPTIONS_REQUEST, placeholder: "All" },
  ];

  // ---------------- Format helpers ----------------
  const fmtNum = (v) => (v === null || v === undefined || v === "" || isNaN(Number(v)) ? "-" : Number(v).toLocaleString());
  const fmtDate = (dt) => (dt ? String(dt).split(" ")[0] : "-");
  const renderStatusBadge = (item) => (
    <BadgeStatus text={item?.status_name || "-"} bgColor={item?.status_bg_color || "#9CA3AF"} textColor={item?.status_color || "#FFFFFF"} />
  );

  const hasValidDateRange = (dater) =>
    Array.isArray(dater) &&
    dater.length === 2 &&
    dater[0] &&
    dater[1];

  // ---------------- Columns ----------------
  const commonHeaders = [
    { title: "No", dataIndex: "key", width: 60 },
    { title: "Farmer Name", dataIndex: "shop_name" },
    { title: "Reward Code", dataIndex: "reward_code" },
    { title: "Reward Name", dataIndex: "reward_name" },
    { title: "Stock (Pcs)", dataIndex: "stock", align: "right" },
    { title: "Cost (THB)", dataIndex: "cost", align: "right" },
    { title: "Farmer Points", dataIndex: "points", align: "right" },
    { title: "Date", dataIndex: "date", align: "center" },
    { title: "Shipping", dataIndex: "shipping", align: "center", width: 90 },
    { title: "Status", dataIndex: "status", align: "center", width: 120 },
    { title: "Action", dataIndex: "action", align: "center", width: 80 },
  ];

  // ---------------- Mapper ----------------
  const mapRow = (item, index, current, pageSize, onOpenAddress) => ({
    key: index + 1 + (current - 1) * pageSize,
    id: item.id,
    shop_name: item.shop_name || "-",
    reward_code: item.reward_code || "-",
    reward_name: item.reward_name || "-",
    address: item.address || "-",
    qty: item.qty !== undefined ? fmtNum(item.qty) : "-",
    stock: item.stock !== undefined ? fmtNum(item.stock) : item.reward_value !== undefined ? fmtNum(item.reward_value) : "-",
    cost: item.cost !== undefined ? fmtNum(item.cost) : item.reward_cost !== undefined ? fmtNum(item.reward_cost) : "-",
    points: item.points !== undefined ? fmtNum(item.points) : item.point !== undefined ? fmtNum(item.point) : "-",
    date: fmtDate(item.created_at),
    shipping: (
      <button
        type="button"
        className="btn-icon"
        title="Shipping"
        onClick={(e) => {
          e.preventDefault();
          onOpenAddress(item.address_full);
        }}
      >
        <img src="/img/icons/location.png" alt="shipping" className="inline-block w-5 h-5" />
      </button>
    ),
    status: renderStatusBadge(item),
    action: (
      <Dropdown
        menu={{
          items: (item.action || []).map((act, i) => ({
            key: i,
            label: (
              <ItemDropDown
                mode={String(act.action || "view").toLowerCase()}
                onClick={() =>
                  navigate(`/points/line/farmer-redeem-reward/${String(act.action || "view").toLowerCase()}`, {
                    state: { id: item.id, mode: item.status, is_farmer: true, back_path: "/points/line/farmer-redeem-reward-list" },
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
  });

  // ---------------- Fetch: Points Redeem List ----------------
  const fetchList = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};

    const statusArray = f.status ? [f.status] : ["RFA", "RFR"];

    const payload = {
      shop_name: f.shop_name || "",
      status: statusArray,
      process: "receive-reward",
      mode: "farmer",
      page: "all",
      page_size: pageSize,
      page_length: current,
      ...(hasValidDateRange(f.dater) ? { dater: f.dater } : {}),
    };

    try {
      const res = await useServiceAPI.get(paths.pathRedeemList, payload);
      if (res.status === 200) {
        const body = res.data || {};
        const rows = body?.data ?? [];
        setDataSource(rows.map((item, idx) => mapRow(item, idx, current, pageSize, openAddressModal)));
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: body?.records_filtered ?? body?.records_total ?? rows.length,
          },
        }));
      }
    } finally {
      setTableLoading(false);
    }
  };

  // ---------------- Fetch: Points Redeem Request List ----------------
  const fetchRequest = async () => {
    setRequestTableLoading(true);
    const { current, pageSize } = requestTableParams.pagination;
    const f = requestTableParams.filters || {};

    const statusArray = f.status ? [f.status] : ["RFP", "RFW"];

    const payload = {
      shop_name: f.shop_name || "",
      status: statusArray,
      process: "receive-reward",
      mode: "farmer",
      page: "all",
      page_size: pageSize,
      page_length: current,
      ...(hasValidDateRange(f.dater) ? { dater: f.dater } : {}),
    };

    try {
      const res = await useServiceAPI.get(paths.pathRedeemList, payload);
      if (res.status === 200) {
        const body = res.data || {};
        const rows = body?.data ?? [];
        setRequestDataSource(rows.map((item, idx) => mapRow(item, idx, current, pageSize, openAddressModal)));
        setRequestTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: body?.records_filtered ?? body?.records_total ?? rows.length,
          },
        }));
      }
    } finally {
      setRequestTableLoading(false);
    }
  };

  // ---------------- Effects ----------------
  useEffect(() => {
    if (activeTab === "list") fetchList();
    else fetchRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    requestTableParams.pagination.current,
    requestTableParams.pagination.pageSize,
    JSON.stringify(tableParams.filters),
    JSON.stringify(requestTableParams.filters),
  ]);

  // ---------------- Handlers: Search/Clear ----------------
  const onSearchList = (filters) => {
    setTableParams((prev) => ({
      ...prev,
      filters,
      pagination: { ...prev.pagination, current: 1 },
    }));
  };
  const onClearList = () => {
    setTableParams((prev) => ({
      ...prev,
      filters: { shop_name: "", dater: [], status: "" },
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  const onSearchRequest = (filters) => {
    setRequestTableParams((prev) => ({
      ...prev,
      filters,
      pagination: { ...prev.pagination, current: 1 },
    }));
  };
  const onClearRequest = () => {
    setRequestTableParams((prev) => ({
      ...prev,
      filters: { shop_name: "", dater: [], status: "" },
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page mb-4">Points Redeem (Farmer)</div>

      <Tabs className="custom-tabs" activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span className="tab-title">Points Redeem List</span>} key="list">
          <Filter
            filters={filtersList}
            values={tableParams.filters}
            onSearch={onSearchList}
            onClear={onClearList}
          />
          <BoxPrimary className="mt-4">
            <TableComponent
              header={commonHeaders}
              dataSource={dataSource}
              loading={tableLoading}
              pagination={tableParams.pagination}
              onChange={(pagination) => setTableParams((prev) => ({ ...prev, pagination }))}
            />
          </BoxPrimary>
        </TabPane>

        <TabPane tab={<span className="tab-title">Points Redeem Request List</span>} key="request">
          <Filter
            filters={filtersRequest}
            values={requestTableParams.filters}
            onSearch={onSearchRequest}
            onClear={onClearRequest}
          />
          <BoxPrimary className="mt-4">
            <TableComponent
              header={commonHeaders}
              dataSource={requestDataSource}
              loading={requestTableLoading}
              pagination={requestTableParams.pagination}
              onChange={(pagination) => setRequestTableParams((prev) => ({ ...prev, pagination }))}
            />
          </BoxPrimary>
        </TabPane>
      </Tabs>

      {/* Modal แสดงที่อยู่ (centered) */}
      <Modal centered open={addressModal.open} onCancel={closeAddressModal} footer={null} title="Shipping Address">
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{addressModal.address || "-"}</div>
      </Modal>
    </MainLayout>
  );
}

