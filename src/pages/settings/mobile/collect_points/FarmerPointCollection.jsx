import React, { useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";

export default function FarmerPointCollection() {
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  const [filterValues, setFilterValues] = useState({});

  const filters = [
    { key: "keyword", type: "text", label: "Search", placeholder: "Search Farmer / Order No" },
    { key: "dater", type: "dater", label: "Date Range" },
  ];

  const header = [
    { title: "No", width: 60, dataIndex: "key", align: "center" },
    { title: "Document No", width: 160, dataIndex: "orderNo", align: "left" },
    { title: "Farmer Name", width: 200, dataIndex: "farmerName", align: "left" },
    { title: "Points Collected", width: 120, dataIndex: "points", align: "right" },
    { title: "Date", width: 150, dataIndex: "orderDate", align: "center" },
    { title: "Status", width: 120, dataIndex: "status", align: "center" },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};
    const hasDateRange = Array.isArray(f.dater) && f.dater.length === 2 && f.dater[0] && f.dater[1];

    const payload = {
      keyword: f.keyword || "",
      status_code: "ODC",
      page: current,
      page_size: pageSize,
      platform: "web",
      ...(hasDateRange ? { dater: f.dater } : {}),
    };

    try {
      const res = await useServiceAPI.get(paths.pathSalePointOrderList, payload);
      if (res.status === 200) {
        const { data, records_filtered } = res.data || {};
        const rows = (data || []).map((row, idx) => ({
          key: idx + 1 + (current - 1) * pageSize,
          orderNo: row.document_number || "-",
          farmerName: row.sub_dealer_name || row.dealer_name || "-",
          points: (row.point || 0).toLocaleString(),
          orderDate: row.document_date || "-",
          status: (
            <BadgeStatus
              text={row.status_transaction_name || "Active"}
              bgColor={row.status_bg_color || "#E6F4EA"}
              textColor={row.status_color || "#137333"}
            />
          ),
        }));
        setDataSource(rows);
        setTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total: records_filtered || rows.length },
        }));
      }
    } catch (e) {
      console.error("fetch Farmer Point Collection failed", e);
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
      <div className="title-page">Farmer Point Collection</div>
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
