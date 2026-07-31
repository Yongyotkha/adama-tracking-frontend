import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import TableComponent from "../../../components/table/TableComponent";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function FarmerPointRedeem() {
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  const [filterValues, setFilterValues] = useState({});

  const filters = [
    { key: "shop_name", type: "text", label: "Farmer / Customer Name" },
    { key: "dater", type: "dater", label: "Date Range" },
  ];

  const header = [
    { title: "No", dataIndex: "key", width: 60, align: "center" },
    { title: "Farmer / Customer", dataIndex: "shop_name" },
    { title: "Reward Code", dataIndex: "reward_code" },
    { title: "Reward Name", dataIndex: "reward_name" },
    { title: "Points Redeemed", dataIndex: "points", align: "right" },
    { title: "Redeem Date", dataIndex: "created_at", align: "center" },
    { title: "Status", dataIndex: "status", align: "center" },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};
    const hasDateRange = Array.isArray(f.dater) && f.dater.length === 2 && f.dater[0] && f.dater[1];

    const payload = {
      shop_name: f.shop_name || "",
      status_code: ["RFA", "RFR"],
      page: current,
      page_size: pageSize,
      ...(hasDateRange ? { dater: f.dater } : {}),
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
          points: (item.points || 0).toLocaleString(),
          created_at: item.created_at ? String(item.created_at).split(" ")[0] : "-",
          status: (
            <BadgeStatus
              text={item.status_name || "-"}
              bgColor={item.status_bg_color || "#9CA3AF"}
              textColor={item.status_color || "#FFFFFF"}
            />
          ),
        }));
        setDataSource(rows);
        setTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total },
        }));
      }
    } catch (e) {
      console.error("fetch Farmer Point Redeem failed", e);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableParams.pagination.current, tableParams.pagination.pageSize, tableParams.filters]);

  const handleSearch = () => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: filterValues,
    }));
  };

  const handleClear = () => {
    setFilterValues({});
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: {},
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableChange = (pagination) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: pagination.current, pageSize: pagination.pageSize },
    }));
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Farmer Point Redeem</div>
      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleChange}
        filters={filters}
        values={filterValues}
      />
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
