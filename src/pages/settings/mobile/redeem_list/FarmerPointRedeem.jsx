import React, { useEffect, useState } from "react";
import { Dropdown, Tabs, Modal } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../../services/CorsService";
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

  const filtersList = [
    { key: "shop_name", type: "text", label: "Farmer / Customer Name" },
    { key: "dater", type: "dater", label: "Date Range" },
    { key: "status", type: "select", label: "Status", options: STATUS_OPTIONS_LIST, placeholder: "All" },
  ];
  const filtersRequest = [
    { key: "shop_name", type: "text", label: "Farmer / Customer Name" },
    { key: "dater", type: "dater", label: "Date Range" },
    { key: "status", type: "select", label: "Status", options: STATUS_OPTIONS_REQUEST, placeholder: "All" },
  ];

  const fmtNum = (v) => (v === null || v === undefined || v === "" || isNaN(Number(v)) ? "-" : Number(v).toLocaleString());
  const fmtDate = (dt) => (dt ? String(dt).split(" ")[0] : "-");
  const renderStatusBadge = (item) => (
    <BadgeStatus text={item?.status_name || "-"} bgColor={item?.status_bg_color || "#9CA3AF"} textColor={item?.status_color || "#FFFFFF"} />
  );

  const hasValidDateRange = (dater) =>
    Array.isArray(dater) && dater.length === 2 && dater[0] && dater[1];

  const commonHeaders = [
    { title: "No", dataIndex: "key", width: 60 },
    { title: "Farmer Name", dataIndex: "shop_name" },
    { title: "Reward Code", dataIndex: "reward_code" },
    { title: "Reward Name", dataIndex: "reward_name" },
    { title: "Stock (Pcs)", dataIndex: "stock", align: "right" },
    { title: "Cost / Piece (THB)", dataIndex: "cost", align: "right" },
    { title: "Farmer Points", dataIndex: "points", align: "right" },
    { title: "Date", dataIndex: "created_at", align: "center" },
    { title: "Shipping", dataIndex: "shipping", align: "center" },
    { title: "Status", dataIndex: "status", align: "center" },
    { title: "Action", dataIndex: "action", align: "center" },
  ];

  const fetchListData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const { shop_name, dater, status } = tableParams.filters;

    const payload = {
      shop_name: shop_name || "",
      status_code: status ? [status] : ["RFA", "RFR"],
      page: current,
      page_size: pageSize,
      mode: "farmer",
      ...(hasValidDateRange(dater) ? { dater } : {}),
    };

    try {
      const res = await useServiceAPI.post(paths.pathRedeemRewardHistory, payload);
      if (res?.status === 200 || res?.status === "200") {
        const list = res.data?.data || [];
        const total = res.data?.records_filtered || list.length;

        const rows = list.map((item, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          shop_name: item.shop_name || "-",
          reward_code: item.reward_code || "-",
          reward_name: item.reward_name || "-",
          stock: fmtNum(item.stock),
          cost: fmtNum(item.cost),
          points: fmtNum(item.points),
          created_at: fmtDate(item.created_at),
          shipping: (
            <button
              onClick={() => openAddressModal(item.address)}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
              title="View Shipping Address"
            >
              📍
            </button>
          ),
          status: renderStatusBadge(item),
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
                          navigate("/points/line/redeem-reward/view", {
                            state: { item, mode_type: "list" },
                          })
                        }
                      />
                    ),
                  },
                ],
              }}
              trigger={["click"]}
            >
              <button className="p-1 hover:bg-gray-100 rounded">...</button>
            </Dropdown>
          ),
        }));

        setDataSource(rows);
        setTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total },
        }));
      }
    } catch (e) {
      console.error("fetch list error:", e);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchRequestData = async () => {
    setRequestTableLoading(true);
    const { current, pageSize } = requestTableParams.pagination;
    const { shop_name, dater, status } = requestTableParams.filters;

    const payload = {
      shop_name: shop_name || "",
      status_code: status ? [status] : ["RFP", "RFW"],
      page: current,
      page_size: pageSize,
      mode: "farmer",
      ...(hasValidDateRange(dater) ? { dater } : {}),
    };

    try {
      const res = await useServiceAPI.post(paths.pathRedeemRewardHistory, payload);
      if (res?.status === 200 || res?.status === "200") {
        const list = res.data?.data || [];
        const total = res.data?.records_filtered || list.length;

        const rows = list.map((item, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          shop_name: item.shop_name || "-",
          reward_code: item.reward_code || "-",
          reward_name: item.reward_name || "-",
          stock: fmtNum(item.stock),
          cost: fmtNum(item.cost),
          points: fmtNum(item.points),
          created_at: fmtDate(item.created_at),
          shipping: (
            <button
              onClick={() => openAddressModal(item.address)}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
              title="View Shipping Address"
            >
              📍
            </button>
          ),
          status: renderStatusBadge(item),
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
                          navigate("/points/line/redeem-reward/view", {
                            state: { item, mode_type: "request" },
                          })
                        }
                      />
                    ),
                  },
                ],
              }}
              trigger={["click"]}
            >
              <button className="p-1 hover:bg-gray-100 rounded">...</button>
            </Dropdown>
          ),
        }));

        setRequestDataSource(rows);
        setRequestTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total },
        }));
      }
    } catch (e) {
      console.error("fetch request error:", e);
    } finally {
      setRequestTableLoading(false);
    }
  };

  useEffect(() => {
    fetchListData();
  }, [tableParams.pagination.current, tableParams.pagination.pageSize, tableParams.filters]);

  useEffect(() => {
    if (activeTab === "request") {
      fetchRequestData();
    }
  }, [activeTab, requestTableParams.pagination.current, requestTableParams.pagination.pageSize, requestTableParams.filters]);

  const handleSearch = (values) => {
    if (activeTab === "list") {
      setTableParams((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, current: 1 },
        filters: values,
      }));
    } else {
      setRequestTableParams((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, current: 1 },
        filters: values,
      }));
    }
  };

  const handleClear = () => {
    if (activeTab === "list") {
      setTableParams((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, current: 1 },
        filters: { shop_name: "", dater: [], status: "" },
      }));
    } else {
      setRequestTableParams((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, current: 1 },
        filters: { shop_name: "", dater: [], status: "" },
      }));
    }
  };

  const handleTableChange = (pagination) => {
    if (activeTab === "list") {
      setTableParams((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, current: pagination.current, pageSize: pagination.pageSize },
      }));
    } else {
      setRequestTableParams((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, current: pagination.current, pageSize: pagination.pageSize },
      }));
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Points Redeem (Farmer)</div>

      <div className="flex justify-between items-center mb-3">
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)} className="custom-tabs">
          <TabPane tab="Points Redeem List" key="list" />
          <TabPane tab="Points Redeem Request List" key="request" />
        </Tabs>
      </div>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        filters={activeTab === "list" ? filtersList : filtersRequest}
        values={activeTab === "list" ? tableParams.filters : requestTableParams.filters}
      />

      <BoxPrimary>
        <TableComponent
          header={commonHeaders}
          dataSource={activeTab === "list" ? dataSource : requestDataSource}
          pagination={activeTab === "list" ? tableParams.pagination : requestTableParams.pagination}
          loading={activeTab === "list" ? tableLoading : requestTableLoading}
          onChange={handleTableChange}
        />
      </BoxPrimary>

      <Modal
        title="Shipping Address"
        open={addressModal.open}
        onOk={closeAddressModal}
        onCancel={closeAddressModal}
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <p className="py-2 text-sm text-gray-700">{addressModal.address}</p>
      </Modal>
    </MainLayout>
  );
}
