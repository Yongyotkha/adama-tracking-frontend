import React, { useEffect, useState } from "react";
import { Dropdown, Tabs, Modal } from "antd"; // ⬅️ เพิ่ม Modal
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

export default function RedeemList() {
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

  // --- Address Modal state ---
  const [addressModal, setAddressModal] = useState({
    open: false,
    address: "",
  });

  const openAddressModal = (address) => {
    setAddressModal({
      open: true,
      address: address || "-",
    });
  };

  const closeAddressModal = () => {
    setAddressModal({ open: false, address: "" });
  };

  // ---------------- Filters ----------------
  const filtersList = [
    { key: "target", type: "text", label: "Customer Name" },
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
    { key: "shop", type: "text", label: "Customer Name" },
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

  // ---------------- Format helpers ----------------
  const fmtNum = (v) =>
    v === null || v === undefined || v === "" || isNaN(Number(v))
      ? "-"
      : Number(v).toLocaleString();
  const fmtDate = (dt) => (dt ? String(dt).split(" ")[0] : "-");

  const renderStatusBadge = (item) => (
    <BadgeStatus
      text={item?.status_name || "-"}
      bgColor={item?.status_bg_color || "#9CA3AF"}
      textColor={item?.status_color || "#FFFFFF"}
    />
  );

  // ---------------- Common columns ----------------
  const commonHeaders = [
    { title: "No", dataIndex: "key", width: 60 },
    { title: "Customer Name", dataIndex: "shop_name" },
    { title: "Reward Code", dataIndex: "reward_code" },
    { title: "Reward Name", dataIndex: "reward_name" },
    { title: "Stock (Pcs)", dataIndex: "stock", align: "right" },
    { title: "Cost (THB)", dataIndex: "cost", align: "right" },
    { title: "Points", dataIndex: "points", align: "right" },
    { title: "Date", dataIndex: "date", align: "center" },
    { title: "Shipping", dataIndex: "shipping", align: "center", width: 90 },
    { title: "Status", dataIndex: "status", align: "center", width: 120 },
    { title: "Action", dataIndex: "action", align: "center", width: 80 },
  ];

  // ---------------- Common mapper ----------------
  const mapRow = (item, index, current, pageSize, onOpenAddress) => ({
    key: index + 1 + (current - 1) * pageSize,
    id: item.id,
    shop_name: item.shop_name || "-",
    reward_code: item.reward_code || "-",
    reward_name: item.reward_name || "-",
    address: item.address || "-",
    qty: item.qty !== undefined ? fmtNum(item.qty) : "-",
    stock:
      item.stock !== undefined
        ? fmtNum(item.stock)
        : item.reward_value !== undefined
          ? fmtNum(item.reward_value)
          : "-",
    cost:
      item.cost !== undefined
        ? fmtNum(item.cost)
        : item.reward_cost !== undefined
          ? fmtNum(item.reward_cost)
          : "-",
    points:
      item.points !== undefined
        ? fmtNum(item.points)
        : item.point !== undefined
          ? fmtNum(item.point)
          : "-",
    date: fmtDate(item.created_at),
    shipping: (
      <button
        type="button"
        className="btn-icon"
        title="Shipping"
        onClick={(e) => {
          e.preventDefault();
          onOpenAddress(item.address);
        }}
      >
        <img
          src="/img/icons/location.png"
          alt="shipping"
          className="inline-block w-5 h-5"
        />
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
                  navigate(
                    `/points/line/redeem-reward/${String(
                      act.action || "view"
                    ).toLowerCase()}`,
                    { state: { id: item.id, mode: item.status } }
                  )
                }
              />
            ),
          })),
        }}
        placement="bottomRight"
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
  });

  // ---------------- Fetch: Point Redeem List ----------------
  const fetchList = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    try {
      const res = await useServiceAPI.get(paths.pathRedeemList, {
        platform: "web",
        page: "all",
        page_size: pageSize,
        page_length: current,
        status: ["RFA", "RFR"],
      });

      if (res.status === 200) {
        const payload = res.data || res.data;
        const rows = payload?.data ?? [];
        const formatted = rows.map((item, index) =>
          mapRow(item, index, current, pageSize, openAddressModal)
        );
        setDataSource(formatted);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: payload?.records_filtered ?? payload?.records_total ?? 0,
          },
        }));
      }
    } finally {
      setTableLoading(false);
    }
  };

  // ---------------- Fetch: Point Redeem Request List ----------------
  const fetchRequest = async () => {
    setRequestTableLoading(true);
    const { current, pageSize } = requestTableParams.pagination;
    try {
      const res = await useServiceAPI.get(paths.pathRedeemList, {
        page: "all",
        page_size: pageSize,
        page_length: current,
        status: ["RFW", "RFP"],
      });

      if (res.status === 200) {
        const payload = res.data || res.data;
        const rows = payload?.data ?? [];
        const formatted = rows.map((item, index) =>
          mapRow(item, index, current, pageSize, openAddressModal)
        );
        setRequestDataSource(formatted);
        setRequestTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: payload?.records_filtered ?? payload?.records_total ?? 0,
          },
        }));
      }
    } finally {
      setRequestTableLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "list") fetchList();
    else fetchRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, tableParams.pagination.current, requestTableParams.pagination.current]);

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Points Redeem</div>
      </div>

      <Tabs className="custom-tabs" activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={<span className="tab-title">Points Redeem List</span>}
          key="list"
        >
          <Filter filters={filtersList} />
          <BoxPrimary className="mt-4">
            <TableComponent
              header={commonHeaders}
              dataSource={dataSource}
              loading={tableLoading}
              pagination={tableParams.pagination}
              onChange={(pagination) =>
                setTableParams((prev) => ({ ...prev, pagination }))
              }
            />
          </BoxPrimary>
        </TabPane>

        <TabPane
          tab={<span className="tab-title">Points Redeem Request List</span>}
          key="request"
        >
          <Filter filters={filtersRequest} />
          <BoxPrimary className="mt-4">
            <TableComponent
              header={commonHeaders}
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

      {/* Modal แสดงที่อยู่ (centered) */}
      <Modal
        centered
        open={addressModal.open}
        onCancel={closeAddressModal}
        footer={null}
        title="Shipping Address"
      >
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
          {addressModal.address || "-"}
        </div>
      </Modal>
    </MainLayout>
  );
}
