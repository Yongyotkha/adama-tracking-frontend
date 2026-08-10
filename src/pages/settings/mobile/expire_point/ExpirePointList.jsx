import React, { useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";

export default function ExpirePointList() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [filterValues, setFilterValues] = useState({});
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  });

  const fmtNum = (v) =>
    v === null || v === undefined || v === "" || isNaN(Number(v))
      ? "-"
      : Number(v).toLocaleString();

  const fmtDate = (dt) => {
    if (!dt) return "-";
    const s = String(dt);
    // "30/7/2026 17:40:48.972" หรือ ISO
    if (s.includes("/")) return s.split(" ")[0];
    return s.split(" ")[0];
  };

  const shopTypeLabel = (t) => {
    const map = {
      farmer: "Farmer",
      sub_dealer: "Sub Dealer",
      dealer: "Dealer",
    };
    return map[t] || t || "-";
  };

  const mapRow = (item, index, current, pageSize) => ({
    key: index + 1 + (current - 1) * pageSize,
    user_id: item.user_id,
    shop_name: item.shop_name || "-",
    contact_name: item.name_en || item.line_name || "-",
    phone_no: item.phone_number || "-",
    customer_type: shopTypeLabel(item.shop_type),
    shop_type: item.shop_type || "-",
    point: fmtNum(item.point),
    expire_date: fmtDate(item.expire_at),
    created_at: fmtDate(item.created_at),
  });

  const fetchExpirePointList = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    try {
      const res = await useServiceAPI.get(paths.pathSalePointPointList, {
        page: 1,
        page_size: pageSize,
        page_length: current,
        point_type: "receive",
        orderby_column: "expire_at",
        orderby: "asc",
        ...filterValues,
      });

      if (res.status === 200) {
        const payload = res.data || {};
        const rows = payload?.data ?? [];
        setDataSource(
          rows.map((item, index) => mapRow(item, index, current, pageSize))
        );
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: payload?.records_filtered ?? 0,
          },
        }));
      }
    } catch (error) {
      console.error("Failed to fetch expire point list:", error);
      setDataSource([]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchExpirePointList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableParams.pagination.current, tableParams.pagination.pageSize, filterValues]);

  const filters = [
    { key: "phone_number", type: "text", label: "Phone No" },
    { key: "user_id", type: "text", label: "User ID" },
    {
      key: "shop_type",
      type: "select",
      label: "Customer Type",
      options: [
        { id: "farmer", name: "Farmer" },
        { id: "sub_dealer", name: "Sub Dealer" },
        { id: "dealer", name: "Dealer" },
      ],
    },
  ];

  const header = [
    { title: "No", dataIndex: "key", align: "left", width: 50 },
    { title: "Shop Name", dataIndex: "shop_name", align: "left" },
    { title: "Contact Name", dataIndex: "contact_name", align: "left" },
    { title: "Phone No", dataIndex: "phone_no", align: "left" },
    { title: "Customer Type", dataIndex: "customer_type", align: "left", width: 120 },
    { title: "Shop Type", dataIndex: "shop_type", align: "left", width: 120 },
    { title: "Point", dataIndex: "point", align: "center", width: 100 },
    { title: "Expire Date", dataIndex: "expire_date", align: "center", width: 140 },
    { title: "Created At", dataIndex: "created_at", align: "center", width: 140 },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Expire Point</div>
      </div>

      <Filter
        filters={filters}
        onSearch={(values) => {
          setFilterValues(values);
          setTableParams((prev) => ({
            ...prev,
            pagination: { ...prev.pagination, current: 1 },
          }));
        }}
        onClear={() => {
          setFilterValues({});
          setTableParams((prev) => ({
            ...prev,
            pagination: { ...prev.pagination, current: 1 },
          }));
        }}
      />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
          onChange={(pagination) =>
            setTableParams((prev) => ({ ...prev, pagination }))
          }
        />
      </BoxPrimary>
    </MainLayout>
  );
}
