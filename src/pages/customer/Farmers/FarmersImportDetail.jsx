import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal, Tag } from "antd";
import MainLayout from "../../../layouts/MainLayout";
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

const TEMP_STATUS = {
  pending: { color: "gold", label: "รอนำเข้าจริง" },
  inserted: { color: "green", label: "นำเข้า master_farmers แล้ว" },
  failed: { color: "red", label: "นำเข้าจริงไม่สำเร็จ" },
};

const renderStatusTag = (code, message) => {
  const status = TEMP_STATUS[code] || { color: "default", label: message || code || "-" };
  return <Tag color={status.color}>{message || status.label}</Tag>;
};

export default function FarmersImportDetail() {
  const { uploadId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useContext(AuthContext);
  const [tableLoading, setTableLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 50, total: 0 },
  });

  const current = tableParams.pagination.current;
  const pageSize = tableParams.pagination.pageSize;

  const fetchData = useCallback(async () => {
    setTableLoading(true);

    try {
      const response = await useServiceAPI.get(paths.pathCustomerFarmersImportList, {
        page_length: pageSize,
        page_size: current,
        upload_id: uploadId,
      });

      const list = Array.isArray(response?.data) ? response.data : [];
      const total = Number(
        response?.records_filtered ?? response?.recordsFiltered ?? list.length ?? 0
      );

      setDataSource(
        list.map((item, index) => ({
          key: item.id,
          id: item.id,
          name: displayValue(item.name),
          mobile_phone: displayValue(item.mobile_phone),
          email: displayValue(item.email),
          address: displayValue(item.address),
          status_code: item.status_code,
          status_message: item.status_message,
          farmer_id: item.farmer_id || "-",
          can_insert: item.can_insert !== false && item.status_code !== "inserted",
          created_at: formatDateTime(item.created_at),
          no: index + 1 + (current - 1) * pageSize,
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
  }, [current, pageSize, showNotification, uploadId]);

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

  const handleSync = () => {
    if (selectedRowKeys.length === 0) {
      showNotification("error", "กรุณาเลือกรายการที่ต้องการนำเข้า");
      return;
    }

    Modal.confirm({
      title: "นำข้อมูลเข้าจริง",
      content: `นำรายการที่เลือก ${selectedRowKeys.length} แถว จาก temp_master_farmers_import ไป insert ลง master_farmers ?`,
      okText: "นำเข้าจริง",
      cancelText: "ยกเลิก",
      onOk: async () => {
        try {
          const response = await useServiceAPI.post(
            paths.pathCustomerFarmersImportSync,
            {
              upload_id: Number(uploadId),
              ids: selectedRowKeys,
            },
            setSyncLoading
          );

          if (response?.status === 200) {
            showNotification("success", response.message || "นำเข้าจริงสำเร็จ", [
              `เพิ่ม ${response.data?.inserted ?? 0} แถว`,
              `ข้าม ${response.data?.skipped ?? 0} แถว`,
              `ล้มเหลว ${response.data?.failed ?? 0} แถว`,
            ]);
            setSelectedRowKeys([]);
            fetchData();
          }
        } catch (error) {
          showNotification(
            "error",
            error?.response?.data?.message || error.message || "นำเข้าจริงไม่สำเร็จ"
          );
        }
      },
    });
  };

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (keys) => setSelectedRowKeys(keys),
      getCheckboxProps: (record) => ({
        disabled: !record.can_insert,
      }),
    }),
    [selectedRowKeys]
  );

  const header = [
    { title: "No", dataIndex: "no", width: 70, align: "center" },
    { title: "Temp ID", dataIndex: "id", width: 90, align: "center" },
    { title: "Name", dataIndex: "name", width: 220 },
    { title: "Mobile Phone", dataIndex: "mobile_phone", width: 150, align: "center" },
    { title: "Email", dataIndex: "email", width: 220 },
    { title: "Address", dataIndex: "address", width: 320 },
    {
      title: "สถานะ",
      dataIndex: "status_code",
      width: 220,
      align: "center",
      render: (value, row) => renderStatusTag(value, row.status_message),
    },
    { title: "Farmer ID", dataIndex: "farmer_id", width: 110, align: "center" },
    { title: "Created At", dataIndex: "created_at", width: 170, align: "center" },
  ];

  return (
    <MainLayout loading={!!syncLoading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Temp Farmers #{uploadId}</div>
        <div className="flex items-center gap-2">
          <ActionButton
            mode="back"
            text="กลับ"
            onClick={() => navigate("/customer/farmers/import")}
          />
          <ActionButton
            mode="import"
            text="นำข้อมูลเข้าจริง"
            onClick={handleSync}
            disabled={syncLoading || selectedRowKeys.length === 0}
          />
        </div>
      </div>

      <BoxPrimary>
        <div className="mb-3 text-sm text-[#666]">
          เลือกแถวที่ยังไม่ได้นำเข้า แล้วกดปุ่มนำข้อมูลเข้าจริง เพื่อ insert ลง{" "}
          <strong>master_farmers</strong>
          {selectedRowKeys.length > 0 ? ` (เลือกแล้ว ${selectedRowKeys.length} แถว)` : ""}
        </div>
        <TableComponent
          header={header}
          dataSource={dataSource}
          loading={tableLoading}
          pagination={tableParams.pagination}
          onChange={handleTableChange}
          rowSelection={rowSelection}
          scroll
        />
      </BoxPrimary>
    </MainLayout>
  );
}
