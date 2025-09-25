// src/pages/settings/mobile/request_purchase/RequestPurchaseList.jsx
import React, { useEffect, useState } from "react";
import { Dropdown } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";

export default function RequestPurchaseList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  // ✅ กำหนด filter fields
  const filters = [
    { key: "status_code", type: "select", label: "Status", options: [] },
    { key: "reward_code", type: "text", label: "Reward Code" },
    { key: "reward_name", type: "text", label: "Reward Name" },
    { key: "dater", type: "dater", label: "Date Range" },
    { key: "use_flag", type: "select", label: "Use Flag", options: [] },
  ];

  const fmtNum = (v) =>
    v === null || v === undefined || v === "" || isNaN(Number(v))
      ? "-"
      : Number(v).toLocaleString();
  const fmtDate = (dt) => (dt ? String(dt).split(" ")[0] : "-");

  const mapRow = (item, index, current, pageSize) => ({
    key: index + 1 + (current - 1) * pageSize,
    id: item.id,
    reward_code: item.reward_code || "-",
    reward_name: item.reward_name || "-",
    stock: fmtNum(item.reward_value_stock),
    input_qty: fmtNum(item.reward_value),
    update_date: fmtDate(item.updated_at),
    status: (
      <BadgeStatus
        text={item.status_name || "-"}
        bgColor={item.status_bg_color || "#9CA3AF"}
        textColor={item.status_color || "#FFFFFF"}
      />
    ),
    action: (
      <Dropdown
        menu={{
          items: [
            {
              key: "update-stock",
              label: (
                <ItemDropDown
                  mode="edit"
                  text={"Update Stock"}
                  onClick={() =>
                    navigate(`/setting/line/request-purchase/update-stock`, {
                      state: { id: item.id, value: item.reward_value },
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
          <img
            src="/img/icons/action.png"
            alt="action"
            className="inline-block w-5 h-5"
          />
        </a>
      </Dropdown>
    ),
  });

  // ✅ fetch data รวม filterValues
  const fetchRequestPurchaseList = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    try {
      const res = await useServiceAPI.get(paths.pathRequestPurchaseList, {
        page_size: pageSize,
        page_length: current,
        ...filterValues, // ส่ง filter ที่เลือกเข้ามา
      });

      if (res.status === 200) {
        const payload = res.data || {};
        const rows = payload?.data ?? [];
        const formatted = rows.map((item, index) =>
          mapRow(item, index, current, pageSize)
        );
        setDataSource(formatted);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: payload?.records_filtered ?? 0,
          },
        }));
      }
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestPurchaseList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableParams.pagination.current, filterValues]);

  const header = [
    { title: "Reward Code", dataIndex: "reward_code", align: "left" },
    { title: "Reward Name", dataIndex: "reward_name", align: "left" },
    { title: "Stock (Pcs)", dataIndex: "stock", align: "center", width: 120 },
    {
      title: "Input QTY (Pcs)",
      dataIndex: "input_qty",
      align: "center",
      width: 150,
    },
    {
      title: "Update Date",
      dataIndex: "update_date",
      align: "center",
      width: 160,
    },
    { title: "Status", dataIndex: "status", align: "center", width: 180 },
    { title: "Action", dataIndex: "action", align: "center", width: 90 },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Reward Purchasing</div>

      {/* ✅ Filter Component */}
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
