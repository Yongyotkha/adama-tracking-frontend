import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Modal } from "antd";
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

export default function RollingForecastTempList() {
  const navigate = useNavigate();
  const { showNotification, formatNumber } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [years, setYears] = useState([]);
  const [sales, setSales] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [filterValues, setFilterValues] = useState({});

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 50, total: 0 },
    filters: {},
  });

  const current = tableParams.pagination.current;
  const pageSize = tableParams.pagination.pageSize;

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
      orderby_column: "id",
      orderby: "desc",
      page_length: pageSize,
      page_size: current,
      year_code: f.year_code ?? "",
      user_id: f.user_id ?? "",
      dealer_id: f.dealer_id ?? "",
      has_qty: f.has_qty ?? "",
      has_value: f.has_value ?? "",
      has_qty2: f.has_qty2 ?? "",
      has_value2: f.has_value2 ?? "",
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathTempMasterRollingList,
        requestData
      );

      if (response?.status === 200) {
        const { data, records_filtered, recordsFiltered } = response;
        const list = Array.isArray(data) ? data : [];

      setDataSource(
        list.map((item, index) => ({
          key: item.upload_id || index + 1 + (current - 1) * pageSize,
          upload_id: item.upload_id,
          file_name: item.file_name || "-",
          status_code: item.status_code,
          status_message: item.status_message,
          status_code_sync: item.status_code_sync,
          status_message_sync: item.status_message_sync,
          inserted: item.inserted ?? "-",
          failed_count: item.failed_count ?? "-",
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
  ]);

  const handleSearch = (filtersFromUI) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: { ...filtersFromUI },
    }));
    setFilterValues({ ...filtersFromUI });
  };

  const handleClear = () => {
    setFilterValues({});
    setDealers([]);
    setTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  const handleFilterChange = (values) => {
    if (values.user_id !== filterValues.user_id) {
      const nextValues = { ...values, dealer_id: "" };
      setFilterValues(nextValues);
      return;
    }

    setFilterValues(values);
  };

  const handleSync = useCallback(
    (uploadId = null) => {
      Modal.confirm({
        title: "Sync Rolling Forecast",
        content: uploadId
          ? `นำ qty2 / value2 ของ Upload ID ${uploadId} จาก temp_master_rolling ไปบันทึกเป็น qty / value ใน rolling_forecast_month_quarter_month_items ?`
          : "นำ qty2 / value2 จาก temp_master_rolling ทั้งหมด ไปบันทึกเป็น qty / value ใน rolling_forecast_month_quarter_month_items ?",
        okText: "Sync",
        cancelText: "ยกเลิก",
        onOk: async () => {
          try {
            const response = await useServiceAPI.post(
              paths.pathTempMasterRollingSync,
              uploadId ? { upload_id: uploadId } : {},
              setSyncLoading
            );

            if (response?.status === 200) {
              showNotification("success", response.message || "Sync สำเร็จ", [
                `เพิ่ม ${response.data?.inserted ?? 0} แถว`,
                `อัปเดต ${response.data?.updated ?? 0} แถว`,
                `ข้าม ${response.data?.skipped ?? 0} แถว`,
              ]);
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
    },
    [fetchData, showNotification]
  );

  const header = useMemo(
    () => [
      { title: "No", dataIndex: "key", width: 70, align: "center" },
      { title: "Upload ID", dataIndex: "upload_id", width: 100, align: "center" },
      { title: "File Name", dataIndex: "file_name", width: 260 },
      {
        title: "สถานะนำเข้า Temp",
        dataIndex: "status_code",
        width: 200,
        align: "center",
        render: (value, row) =>
          renderStatusTag(value, row.status_message, IMPORT_STATUS),
      },
      {
        title: "สถานะ Sync Rolling Forecast",
        dataIndex: "status_code_sync",
        width: 240,
        align: "center",
        render: (value, row) =>
          renderStatusTag(value, row.status_message_sync, FORECAST_STATUS),
      },
      {
        title: "Inserted (Temp)",
        dataIndex: "inserted",
        width: 130,
        align: "center",
      },
      {
        title: "Failed",
        dataIndex: "failed_count",
        width: 90,
        align: "center",
      },
      {
        title: "Uploaded At",
        dataIndex: "created_at",
        width: 160,
        align: "center",
      },
      {
        title: "Processed At",
        dataIndex: "processed_at",
        width: 160,
        align: "center",
      },
      {
        title: "Action",
        dataIndex: "upload_id",
        key: "action",
        width: 160,
        align: "center",
        fixed: "right",
        render: (uploadId, record) => (
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              className="text-[#009845] underline"
              onClick={() =>
                navigate(`/sale-plan/rolling-forecast/temp-list/${uploadId}`)
              }
            >
              ดูข้อมูล
            </button>
            <button
              type="button"
              className="text-[#F89E18] underline disabled:text-gray-400 disabled:no-underline"
              disabled={record.status_code !== "completed" || syncLoading}
              onClick={() => handleSync(uploadId)}
            >
              Sync
            </button>
          </div>
        ),
      },
    ],
    [handleSync, navigate, syncLoading]
  );

  return (
    <MainLayout loading={!!syncLoading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Temp Master Rolling Uploads</div>
        <div className="flex items-center gap-2">
          <ActionButton
            mode="sync"
            text="Sync ข้อมูล"
            onClick={() => handleSync()}
            disabled={syncLoading}
          />
          <ActionButton
            mode="create"
            text="อัปโหลดไฟล์ CSV"
            onClick={() => navigate("/sale-plan/rolling-forecast/upload-temp")}
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
          onChange={(pagination) => {
            setTableParams((prev) => ({ ...prev, pagination }));
          }}
          scroll
        />
      </BoxPrimary>
    </MainLayout>
  );
}
