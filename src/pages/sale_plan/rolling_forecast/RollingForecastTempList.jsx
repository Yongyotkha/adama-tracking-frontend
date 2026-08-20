import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag } from "antd";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import ActionButton from "../../../components/button/ActionButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return String(value).replace("T", " ").split(".")[0];
};

const IMPORT_STATUS = {
  uploaded: { color: "blue", label: "อัปโหลดแล้ว รอนำเข้า" },
  processing: { color: "orange", label: "กำลังนำเข้า Temp" },
  completed: { color: "green", label: "นำเข้า Temp สำเร็จ" },
  failed: { color: "red", label: "นำเข้า Temp ล้มเหลว" },
};

const FORECAST_STATUS = {
  pending: { color: "gold", label: "รอนำเข้า Rolling Forecast" },
  processing: { color: "orange", label: "กำลังนำเข้า Rolling Forecast" },
  completed: { color: "green", label: "นำเข้า Rolling Forecast สำเร็จ" },
  failed: { color: "red", label: "นำเข้า Rolling Forecast ล้มเหลว" },
};

const renderStatusTag = (code, message, config) => {
  if (!code) {
    return <Tag>ยังไม่เริ่ม</Tag>;
  }

  const status = config[code] || { color: "default", label: message || code };
  return <Tag color={status.color}>{message || status.label}</Tag>;
};

export default function RollingForecastTempList() {
  const navigate = useNavigate();
  const { showNotification } = useContext(AuthContext);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 20, total: 0 },
  });

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
        title: "สถานะนำเข้า Rolling Forecast",
        dataIndex: "forecast_status_code",
        width: 240,
        align: "center",
        render: (value, row) =>
          renderStatusTag(value, row.forecast_status_message, FORECAST_STATUS),
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
        title: "Forecast Inserted",
        dataIndex: "forecast_inserted_count",
        width: 150,
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
        width: 140,
        align: "center",
        fixed: "right",
        render: (uploadId) => (
          <button
            type="button"
            className="text-[#009845] underline"
            onClick={() =>
              navigate(`/sale-plan/rolling-forecast/temp-list/${uploadId}`)
            }
          >
            ดูข้อมูล
          </button>
        ),
      },
    ],
    [navigate]
  );

  const current = tableParams.pagination.current;
  const pageSize = tableParams.pagination.pageSize;

  const fetchData = useCallback(async () => {
    setTableLoading(true);

    try {
      const response = await useServiceAPI.get(
        paths.pathTempMasterRollingUploadList,
        {
          page_length: pageSize,
          page_size: current,
        }
      );

      const list = Array.isArray(response?.data) ? response.data : [];
      const total = Number(
        response?.records_filtered ?? response?.recordsFiltered ?? list.length ?? 0
      );

      setDataSource(
        list.map((item, index) => ({
          key: item.upload_id || index + 1 + (current - 1) * pageSize,
          upload_id: item.upload_id,
          file_name: item.file_name || "-",
          status_code: item.status_code,
          status_message: item.status_message,
          forecast_status_code: item.forecast_status_code,
          forecast_status_message: item.forecast_status_message,
          inserted: item.inserted ?? "-",
          failed_count: item.failed_count ?? "-",
          forecast_inserted_count: item.forecast_inserted_count ?? "-",
          created_at: formatDateTime(item.created_at),
          processed_at: formatDateTime(item.processed_at),
        }))
      );

      setTableParams((prev) => {
        if (prev.pagination.total === total) {
          return prev;
        }

        return {
          ...prev,
          pagination: {
            ...prev.pagination,
            total,
          },
        };
      });
    } catch (error) {
      setDataSource([]);
      showNotification("error", error.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setTableLoading(false);
    }
  }, [current, pageSize, showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTableChange = (pagination) => {
    setTableParams((prev) => {
      if (
        prev.pagination.current === pagination.current &&
        prev.pagination.pageSize === pagination.pageSize
      ) {
        return prev;
      }

      return {
        ...prev,
        pagination: {
          ...prev.pagination,
          current: pagination.current,
          pageSize: pagination.pageSize,
        },
      };
    });
  };

  return (
    <MainLayout loading={false}>
      <div className="flex items-center justify-between">
        <div className="title-page">Temp Master Rolling Uploads</div>
        <ActionButton
          mode="create"
          text="อัปโหลดไฟล์ CSV"
          onClick={() => navigate("/sale-plan/rolling-forecast/upload-temp")}
        />
      </div>

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          loading={tableLoading}
          pagination={tableParams.pagination}
          onChange={handleTableChange}
          scroll
        />
      </BoxPrimary>
    </MainLayout>
  );
}
