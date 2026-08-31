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
  pending: { color: "gold", label: "รอการนำเข้า" },
  inserted: { color: "green", label: "นำเข้าข้อมูลแล้ว" },
  exists: { color: "red", label: "สมาชิกมีในระบบแล้ว" },
  failed: { color: "red", label: "นำเข้าจริงไม่สำเร็จ" },
};

const isCancellableRow = (row) => {
  const code = String(row?.status_code || "").trim().toLowerCase();
  const farmerId = row?.farmer_id;

  return code === "inserted" && farmerId !== null && farmerId !== undefined && farmerId !== "" && farmerId !== "-";
};

const isLockedRow = (row) => {
  if (isCancellableRow(row)) {
    return false;
  }

  const code = String(row?.status_code || "pending").trim().toLowerCase();
  const message = String(row?.status_message || "");

  if (code === "pending") {
    return message.includes("มีในระบบแล้ว") || message.includes("นำเข้าข้อมูลแล้ว");
  }

  return true;
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
  const [selectedMeta, setSelectedMeta] = useState({});
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

      const mapped = list.map((item, index) => {
        const farmerId = item.farmer_id || null;
        const row = {
          key: Number(item.id),
          id: Number(item.id),
          name: displayValue(item.name),
          mobile_phone: displayValue(item.mobile_phone),
          email: displayValue(item.email),
          address: displayValue(item.address),
          status_code: item.status_code,
          status_message: item.status_message,
          farmer_id: farmerId || "-",
          can_insert: item.can_insert !== false && item.status_code === "pending",
          can_cancel: item.can_cancel === true || (item.status_code === "inserted" && Boolean(farmerId)),
          created_at: formatDateTime(item.created_at),
          no: index + 1 + (current - 1) * pageSize,
        };

        return {
          ...row,
          locked: isLockedRow(row) || (row.can_insert === false && row.can_cancel === false),
        };
      });

      setDataSource(mapped);

      const lockedKeys = mapped.filter((row) => row.locked).map((row) => Number(row.key));

      setSelectedMeta((prev) => {
        const next = { ...prev };
        mapped.forEach((row) => {
          next[row.id] = {
            can_insert: row.can_insert,
            can_cancel: row.can_cancel,
          };
        });
        return next;
      });

      setSelectedRowKeys((prev) =>
        prev.map(Number).filter((key) => !lockedKeys.includes(key))
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

  const lockedKeys = useMemo(
    () => dataSource.filter((row) => row.locked).map((row) => row.key),
    [dataSource]
  );

  const insertedSelectedKeys = useMemo(
    () =>
      selectedRowKeys.filter((key) => selectedMeta[Number(key)]?.can_cancel === true),
    [selectedMeta, selectedRowKeys]
  );

  const pendingImportKeys = useMemo(
    () =>
      selectedRowKeys.filter((key) => selectedMeta[Number(key)]?.can_insert === true),
    [selectedMeta, selectedRowKeys]
  );

  const handleSync = () => {
    if (pendingImportKeys.length === 0) {
      showNotification("error", "กรุณาเลือกรายการที่ต้องการนำเข้า");
      return;
    }

    Modal.confirm({
      title: "นำข้อมูลเข้าจริง",
      content: `นำรายการที่เลือก ${pendingImportKeys.length} แถว จาก temp_master_farmers_import ไป insert ลง master_farmers ?`,
      okText: "นำเข้าจริง",
      cancelText: "ปิด",
      onOk: async () => {
        try {
          const response = await useServiceAPI.post(
            paths.pathCustomerFarmersImportSync,
            {
              upload_id: Number(uploadId),
              ids: pendingImportKeys,
            },
            setSyncLoading
          );

          if (response?.status === 200) {
            showNotification("success", response.message || "นำเข้าจริงสำเร็จ", [
              `เพิ่ม ${response.data?.inserted ?? 0} แถว`,
              `ข้าม ${response.data?.skipped ?? 0} แถว`,
              `ล้มเหลว ${response.data?.failed ?? 0} แถว`,
            ]);
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

  const handleCancelSync = () => {
    if (insertedSelectedKeys.length === 0) {
      showNotification("error", "กรุณาเลือกรายการที่นำเข้าจริงแล้ว");
      return;
    }

    Modal.confirm({
      title: "ยกเลิกนำข้อมูลเข้าจริง",
      content: `ยกเลิกรายการที่เลือก ${insertedSelectedKeys.length} แถว ออกจาก master_farmers และคืนสถานะใน Temp เป็นรอการนำเข้า ?`,
      okText: "ยกเลิกนำเข้าจริง",
      okType: "danger",
      cancelText: "ปิด",
      onOk: async () => {
        try {
          const response = await useServiceAPI.post(
            paths.pathCustomerFarmersImportUnsync,
            {
              upload_id: Number(uploadId),
              ids: insertedSelectedKeys,
            },
            setSyncLoading
          );

          if (response?.status === 200) {
            showNotification("success", response.message || "ยกเลิกนำเข้าจริงสำเร็จ", [
              `ยกเลิก ${response.data?.cancelled ?? 0} แถว`,
              `ข้าม ${response.data?.skipped ?? 0} แถว`,
              `ล้มเหลว ${response.data?.failed ?? 0} แถว`,
            ]);
            fetchData();
          }
        } catch (error) {
          showNotification(
            "error",
            error?.response?.data?.message || error.message || "ยกเลิกนำเข้าจริงไม่สำเร็จ"
          );
        }
      },
    });
  };

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      preserveSelectedRowKeys: true,
      hideSelectAll: false,
      onChange: (keys, rows) => {
        const nextKeys = keys
          .map(Number)
          .filter((key) => !lockedKeys.includes(key));
        setSelectedRowKeys(nextKeys);
        setSelectedMeta((prev) => {
          const next = { ...prev };
          (rows || []).forEach((row) => {
            next[row.id] = {
              can_insert: row.can_insert,
              can_cancel: row.can_cancel,
            };
          });
          Object.keys(next).forEach((id) => {
            if (!nextKeys.includes(Number(id))) {
              delete next[id];
            }
          });
          return next;
        });
      },
      getCheckboxProps: (record) => ({
        disabled: !!record.locked,
      }),
    }),
    [lockedKeys, selectedRowKeys]
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
            style={{ width: 196, height: 32 }}
            onClick={() => navigate("/customer/farmers/import")}
          />
          <ActionButton
            mode="delete"
            text="ยกเลิกนำข้อมูลเข้าจริง"
            style={{ width: 220, height: 32 }}
            onClick={handleCancelSync}
            disabled={syncLoading || insertedSelectedKeys.length === 0}
          />
          <ActionButton
            mode="import"
            text="นำข้อมูลเข้าจริง"
            style={{ width: 196, height: 32 }}
            onClick={handleSync}
            disabled={syncLoading || pendingImportKeys.length === 0}
          />
        </div>
      </div>

      <BoxPrimary>
        <div className="mb-3 text-sm text-[#666]">
          เลือกแถวที่ยังไม่ได้นำเข้า แล้วกดปุ่มนำข้อมูลเข้าจริง เพื่อ insert ลง{" "}
          <strong>master_farmers</strong> หรือเลือกแถวที่นำเข้าแล้วเพื่อยกเลิก
          {pendingImportKeys.length > 0 ? ` (รอเข้า ${pendingImportKeys.length} แถว)` : ""}
          {insertedSelectedKeys.length > 0 ? ` (ยกเลิกได้ ${insertedSelectedKeys.length} แถว)` : ""}
        </div>
        <TableComponent
          header={header}
          dataSource={dataSource}
          loading={tableLoading}
          pagination={tableParams.pagination}
          onChange={handleTableChange}
          rowSelection={rowSelection}
          rowKey="id"
          scroll
        />
      </BoxPrimary>
    </MainLayout>
  );
}
