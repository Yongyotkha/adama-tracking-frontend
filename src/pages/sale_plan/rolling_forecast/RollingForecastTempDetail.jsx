import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal, Tag } from "antd";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import ActionButton from "../../../components/button/ActionButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

const displayValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return value;
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return String(value).replace("T", " ").split(".")[0];
};

export default function RollingForecastTempDetail() {
  const { uploadId } = useParams();
  const navigate = useNavigate();
  const { showNotification, formatNumber } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [uploadStatusCode, setUploadStatusCode] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [years, setYears] = useState([]);
  const [sales, setSales] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [filterValues, setFilterValues] = useState({});

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 50, total: 0 },
    filters: {},
    syncStatus: "",
    sortField: "id",
    sortOrder: "desc",
  });

  const filters = [
    {
      key: "year_code",
      type: "select",
      label: "Year",
      options: years,
    },
    {
      key: "user_id",
      type: "select",
      label: "Sale",
      options: sales,
    },
    {
      key: "dealer_id",
      type: "select",
      label: "Dealer",
      options: dealers,
      disabled: !filterValues.user_id,
    },
    {
      key: "sync_status",
      type: "select",
      label: "Status",
      options: [
        { id: "pending", name: "ยังไม่นำเข้า" },
        { id: "synced", name: "นำเข้าแล้ว" },
      ],
    },
    {
      key: "value_not_null_group",
      type: "checkboxGroup",
      label: "Qty / Value (Not Null)",
      size: 6,
      options: [
        { key: "has_qty", label: "Qty" },
        { key: "has_value", label: "Value" },
        { key: "has_qty2", label: "Qty2" },
        { key: "has_value2", label: "Value2" },
      ],
    },
  ];

  const header = [
    { title: "No", dataIndex: "key", width: 70, align: "center", fixed: "left" },
    {
      title: "Status",
      dataIndex: "sync_status",
      width: 160,
      align: "center",
      fixed: "left",
      filters: [
        { text: "ยังไม่นำเข้า", value: "pending" },
        { text: "นำเข้าแล้ว", value: "synced" },
      ],
      filterMultiple: false,
      filteredValue: tableParams.syncStatus ? [tableParams.syncStatus] : null,
      sorter: true,
      sortOrder:
        tableParams.sortField === "sync_status"
          ? tableParams.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (value, row) =>
        value === "synced" ? (
          <Tag color="green">{row.sync_status_label || "นำเข้าแล้ว"}</Tag>
        ) : (
          <Tag>{row.sync_status_label || "ยังไม่นำเข้า"}</Tag>
        ),
    },
    // { title: "ID", dataIndex: "id", width: 80, align: "center", fixed: "left" },
    { title: "Year", dataIndex: "year_code", width: 80, align: "center" },
    { title: "Type", dataIndex: "type", width: 180 },
    // { title: "Use Flag", dataIndex: "use_flag", width: 90, align: "center" },
    {
      title: "H ID",
      dataIndex: "workplan_header_id",
      align: "center",
    },
    {
      title: "A H ID",
      dataIndex: "workplan_area_header_id",
      align: "center",
    },
    {
      title: "S H ID",
      dataIndex: "workplan_sale_header_id",
      align: "center",
    },
    // { title: "Area ID", dataIndex: "area_id", width: 90, align: "center" },
    { title: "Area", dataIndex: "area_name", width: 120 },
    // { title: "Sale Area ID", dataIndex: "sale_area_id", width: 110, align: "center" },
    { title: "Sale Area", dataIndex: "sale_area_name", width: 160 },
    // { title: "User ID", dataIndex: "user_id", width: 90, align: "center" },
    { title: "Sale", dataIndex: "user_name", width: 160 },
    // { title: "Quarter ID", dataIndex: "quarter_id", width: 100, align: "center" },
    { title: "Quarter", dataIndex: "quarter_name", width: 100, align: "center" },
    // { title: "Month ID", dataIndex: "month_id", width: 90, align: "center" },
    { title: "Month", dataIndex: "month_name", width: 80, align: "center" },
    // { title: "Product ID", dataIndex: "product_id", width: 100, align: "center" },
    { title: "Product", dataIndex: "product_name", width: 180 },
    { title: "Pack Size", dataIndex: "pack_size", width: 120 },
    {
      title: "Unit Convert",
      dataIndex: "unit_convert_value",
      width: 110,
      align: "right",
    },
    // { title: "Dealer ID", dataIndex: "dealer_id", width: 100, align: "center" },
    { title: "Dealer", dataIndex: "dealer_name", width: 220 },
    { title: "Qty", dataIndex: "qty", width: 100, align: "right" },
    { title: "Value", dataIndex: "value", width: 100, align: "right" },
    { title: "Qty2", dataIndex: "qty2", width: 100, align: "right" },
    { title: "Value2", dataIndex: "value2", width: 100, align: "right" },
    { title: "Remark", dataIndex: "remark", width: 140 },
    // {
    //   title: "Created At",
    //   dataIndex: "created_at",
    //   width: 160,
    //   align: "center",
    // },
    // {
    //   title: "Updated At",
    //   dataIndex: "updated_at",
    //   width: 160,
    //   align: "center",
    // },
    // {
    //   title: "Deleted At",
    //   dataIndex: "deleted_at",
    //   width: 160,
    //   align: "center",
    // },
    // { title: "Created By", dataIndex: "created_by", width: 100, align: "center" },
    // { title: "Updated By", dataIndex: "updated_by", width: 100, align: "center" },
    // { title: "Deleted By", dataIndex: "deleted_by", width: 100, align: "center" },
  ];

  const formatDecimal = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    return formatNumber ? formatNumber(value) : value;
  };

  const loadDealers = async (userId) => {
    if (!userId) {
      setDealers([]);
      return;
    }

    try {
      const response = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
        user_id: userId,
      });

      if (response?.status === 200) {
        setDealers(response.data || []);
      }
    } catch (error) {
      setDealers([]);
      showNotification("error", error.message || "โหลดข้อมูล Dealer ไม่สำเร็จ");
    }
  };

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [yearRes, saleRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterYear),
          useServiceAPI.get(paths.pathMasterSaleDropdown),
        ]);

        if (yearRes?.status === 200) {
          setYears(yearRes.data || []);
        }

        if (saleRes?.status === 200) {
          setSales(saleRes.data || []);
        }
      } catch (error) {
        showNotification("error", error.message || "โหลดข้อมูล Filter ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);

  useEffect(() => {
    loadDealers(filterValues.user_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues.user_id]);

  const fetchData = async () => {
    setTableLoading(true);

    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};

    const requestData = {
      orderby_column: tableParams.sortField || "id",
      orderby: tableParams.sortOrder || "desc",
      page_length: pageSize,
      page_size: current,
      upload_id: uploadId,
      year_code: f.year_code ?? "",
      user_id: f.user_id ?? "",
      dealer_id: f.dealer_id ?? "",
      has_qty: f.has_qty ?? "",
      has_value: f.has_value ?? "",
      has_qty2: f.has_qty2 ?? "",
      has_value2: f.has_value2 ?? "",
      sync_status: f.sync_status || tableParams.syncStatus || "",
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathTempMasterRollingList,
        requestData
      );

      if (response?.status === 200) {
        const { data, records_filtered, recordsFiltered } = response;
        const list = Array.isArray(data) ? data : [];

        const formatted = list.map((item, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          id: displayValue(item.id),
          sync_status: item.sync_status || (item.is_synced ? "synced" : "pending"),
          sync_status_label: item.sync_status_label || (item.is_synced ? "นำเข้าแล้ว" : "ยังไม่นำเข้า"),
          year_code: displayValue(item.year_code),
          type: displayValue(item.type),
          use_flag: displayValue(item.use_flag),
          workplan_header_id: displayValue(item.workplan_header_id),
          workplan_area_header_id: displayValue(item.workplan_area_header_id),
          workplan_sale_header_id: displayValue(item.workplan_sale_header_id),
          area_id: displayValue(item.area_id),
          area_name: displayValue(item.area_name),
          sale_area_id: displayValue(item.sale_area_id),
          sale_area_name: displayValue(item.sale_area_name),
          user_id: displayValue(item.user_id),
          user_name: displayValue(item.user_name),
          quarter_id: displayValue(item.quarter_id),
          quarter_name: displayValue(item.quarter_name),
          month_id: displayValue(item.month_id),
          month_name: displayValue(item.month_name),
          product_id: displayValue(item.product_id),
          product_name: displayValue(item.product_name),
          pack_size: displayValue(item.pack_size),
          unit_convert_value: formatDecimal(item.unit_convert_value),
          dealer_id: displayValue(item.dealer_id),
          dealer_name: displayValue(item.dealer_name),
          qty: formatDecimal(item.qty),
          value: formatDecimal(item.value),
          qty2: formatDecimal(item.qty2),
          value2: formatDecimal(item.value2),
          remark: displayValue(item.remark),
          created_at: formatDateTime(item.created_at),
          updated_at: formatDateTime(item.updated_at),
          deleted_at: formatDateTime(item.deleted_at),
          created_by: displayValue(item.created_by),
          updated_by: displayValue(item.updated_by),
          deleted_by: displayValue(item.deleted_by),
        }));

        setDataSource(formatted);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: Number(records_filtered ?? recordsFiltered ?? 0),
          },
        }));
      }
    } catch (error) {
      showNotification("error", error.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    JSON.stringify(tableParams.filters),
    tableParams.syncStatus,
    tableParams.sortField,
    tableParams.sortOrder,
    uploadId,
  ]);

  const handleSearch = (filtersFromUI) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: { ...filtersFromUI },
      syncStatus: filtersFromUI.sync_status || "",
    }));
    setFilterValues({ ...filtersFromUI });
  };

  const handleClear = () => {
    setFilterValues({});
    setDealers([]);
    setTableParams((prev) => ({
      ...prev,
      filters: {},
      syncStatus: "",
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  const loadUploadStatus = async () => {
    if (!uploadId) {
      return;
    }

    try {
      const response = await useServiceAPI.get(paths.pathTempMasterRollingUploadStatus, {
        upload_id: uploadId,
      });
      setUploadStatusCode(response?.data?.status_code || "");
    } catch (error) {
      setUploadStatusCode("");
    }
  };

  useEffect(() => {
    loadUploadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadId]);

  const handleSync = () => {
    Modal.confirm({
      title: "Sync Rolling Forecast",
      content: `นำ qty2 / value2 ของ Upload ID ${uploadId} จาก temp_master_rolling ไปบันทึกเป็น qty / value ใน rolling_forecast_month_quarter_month_items ?`,
      okText: "Sync",
      cancelText: "ยกเลิก",
      onOk: async () => {
        try {
          const response = await useServiceAPI.post(
            paths.pathTempMasterRollingSync,
            { upload_id: uploadId },
            setSyncLoading
          );

          if (response?.status === 200) {
            showNotification("success", response.message || "Sync สำเร็จ", [
              `เพิ่ม ${response.data?.inserted ?? 0} แถว`,
              `อัปเดต ${response.data?.updated ?? 0} แถว`,
              `ข้าม ${response.data?.skipped ?? 0} แถว`,
            ]);
            loadUploadStatus();
            fetchData();
          }
        } catch (error) {
          showNotification(
            "error",
            error?.response?.data?.message || error.message || "Sync ไม่สำเร็จ"
          );
        }
      },
    });
  };

  const handleFilterChange = (values) => {
    if (values.user_id !== filterValues.user_id) {
      const nextValues = { ...values, dealer_id: "" };
      setFilterValues(nextValues);
      return;
    }

    setFilterValues(values);
  };

  return (
    <MainLayout loading={loading || syncLoading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Temp Master Rolling #{uploadId}</div>
        <div className="flex items-center gap-2">
          <ActionButton
            mode="sync"
            text="Sync"
            className="h-8 box-border"
            style={{ width: 96, height: 32, minWidth: 96, minHeight: 32, boxSizing: "border-box" }}
            disabled={uploadStatusCode !== "completed" || syncLoading}
            onClick={handleSync}
          />
          <ActionButton
            mode="back"
            text="กลับหน้ารายการอัปโหลด"
            onClick={() => navigate("/sale-plan/rolling-forecast/temp-list")}
          />
        </div>
      </div>

      <Filter
        filters={filters}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClear}
        values={filterValues}
      />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          loading={tableLoading}
          pagination={tableParams.pagination}
          onChange={(pagination, tableFilters, sorter) => {
            const syncFilter = tableFilters?.sync_status;
            const syncStatus = Array.isArray(syncFilter)
              ? syncFilter[0] || ""
              : syncFilter || "";
            const isStatusSort = sorter?.field === "sync_status" && sorter?.order;

            setTableParams((prev) => ({
              ...prev,
              pagination: {
                ...prev.pagination,
                current: pagination.current,
                pageSize: pagination.pageSize,
              },
              filters: {
                ...prev.filters,
                sync_status: syncStatus,
              },
              syncStatus,
              sortField: isStatusSort ? "sync_status" : "id",
              sortOrder: isStatusSort
                ? sorter.order === "ascend"
                  ? "asc"
                  : "desc"
                : "desc",
            }));
            setFilterValues((prev) => ({ ...prev, sync_status: syncStatus }));
          }}
          scroll
        />
      </BoxPrimary>
    </MainLayout>
  );
}
