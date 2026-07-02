import React, { useContext, useEffect, useState } from "react";
import {
  Upload,
  Checkbox,
  Alert,
  Steps,
  Tag,
  Table,
  Button,
  Space,
} from "antd";
import {
  InboxOutlined,
  UploadOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

const { Dragger } = Upload;

const STATUS_CONFIG = {
  uploaded: { color: "blue", label: "อัปโหลดแล้ว รอนำเข้า", step: 1 },
  processing: { color: "orange", label: "กำลังนำเข้าข้อมูล", step: 2 },
  completed: { color: "green", label: "นำเข้าสำเร็จ", step: 3 },
  failed: { color: "red", label: "นำเข้าล้มเหลว", step: 3 },
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return String(value).replace("T", " ").split(".")[0];
};

export default function RollingForecastTempUpload() {
  const { showMsg, showNotification } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [currentUpload, setCurrentUpload] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);

  const currentStatus = currentUpload?.status_code || null;
  const statusConfig = STATUS_CONFIG[currentStatus] || null;
  const currentStep = statusConfig?.step ?? 0;

  const fetchUploadHistory = async () => {
    try {
      const response = await useServiceAPI.get(
        paths.pathTempMasterRollingUploadList,
        {
          page_length: 10,
          page_size: 1,
        },
      );

      if (response?.status === 200) {
        setUploadHistory(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUploadHistory();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      showMsg("error", "กรุณาเลือกไฟล์ CSV");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("clear_existing", clearExisting ? "1" : "0");

    try {
      const response = await useServiceAPI.post(
        paths.pathTempMasterRollingUpload,
        formData,
        setLoading,
      );

      if (response.status === 200) {
        setCurrentUpload(response.data || null);
        setSelectedFile(null);
        showNotification("success", response.message || "อัปโหลดไฟล์สำเร็จ", [
          "ไฟล์ถูกเก็บไว้แล้ว กรุณากด Import เพื่อนำเข้าข้อมูล",
        ]);
        fetchUploadHistory();
      }
    } catch (error) {
      showMsg("error", error.message || "อัปโหลดไม่สำเร็จ");
      setCurrentUpload(error.data || null);
    }
  };

  const handleImport = async () => {
    if (!currentUpload?.upload_id) {
      showMsg("error", "กรุณาอัปโหลดไฟล์ก่อน");
      return;
    }

    if (currentUpload.status_code === "completed") {
      showMsg("error", "ไฟล์นี้นำเข้าข้อมูลแล้ว");
      return;
    }

    if (currentUpload.status_code === "processing") {
      showMsg("error", "ไฟล์นี้กำลังนำเข้าข้อมูลอยู่");
      return;
    }

    setCurrentUpload((prev) =>
      prev
        ? {
            ...prev,
            status_code: "processing",
            status_message: STATUS_CONFIG.processing.label,
          }
        : prev,
    );

    try {
      const response = await useServiceAPI.post(
        paths.pathTempMasterRollingImport,
        { upload_id: currentUpload.upload_id },
        setImportLoading,
      );

      if (response.status === 200) {
        setCurrentUpload(response.data || null);
        showNotification(
          "success",
          response.message || "นำเข้าข้อมูลสำเร็จ",
          response.data?.failed_count
            ? [
                `นำเข้า ${response.data.inserted} แถว`,
                `ล้มเหลว ${response.data.failed_count} แถว`,
              ]
            : [`นำเข้า ${response.data?.inserted ?? 0} แถว`],
        );
        fetchUploadHistory();
      }
    } catch (error) {
      setCurrentUpload((prev) => ({
        ...(prev || {}),
        ...(error.data || {}),
        status_code: error.data?.status_code || "failed",
        status_message: error.data?.status_message || "นำเข้าข้อมูลล้มเหลว",
      }));
      showMsg("error", error.message || "นำเข้าข้อมูลไม่สำเร็จ");
      fetchUploadHistory();
    }
  };

  const historyColumns = [
    { title: "ID", dataIndex: "upload_id", width: 70, align: "center" },
    { title: "File Name", dataIndex: "file_name", width: 220 },
    {
      title: "Status",
      dataIndex: "status_code",
      width: 160,
      align: "center",
      render: (status, row) => {
        const config = STATUS_CONFIG[status] || {
          color: "default",
          label: row.status_message || status,
        };
        return (
          <Tag color={config.color}>{row.status_message || config.label}</Tag>
        );
      },
    },
    {
      title: "Inserted",
      dataIndex: "inserted",
      width: 90,
      align: "center",
      render: (value) => (value === null || value === undefined ? "-" : value),
    },
    {
      title: "Failed",
      dataIndex: "failed_count",
      width: 80,
      align: "center",
      render: (value) => (value === null || value === undefined ? "-" : value),
    },
    {
      title: "Uploaded At",
      dataIndex: "created_at",
      width: 160,
      align: "center",
      render: formatDateTime,
    },
    {
      title: "Processed At",
      dataIndex: "processed_at",
      width: 160,
      align: "center",
      render: formatDateTime,
    },
  ];

  const canImport =
    currentUpload?.upload_id &&
    ["uploaded", "failed"].includes(currentUpload.status_code);

  const renderActionButtons = () => (
    <div className="rounded border border-[#d9d9d9] bg-[#fafafa] p-4">
      <div className="mb-3 text-sm font-medium text-[#333]">การดำเนินการ</div>
      <Space wrap size="middle">
        <Button
          type="primary"
          size="large"
          icon={<UploadOutlined />}
          onClick={handleUpload}
          loading={loading}
          disabled={!selectedFile || importLoading}
        >
          อัปโหลดไฟล์ (Upload File)
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<ImportOutlined />}
          onClick={handleImport}
          loading={importLoading}
          disabled={!canImport || loading}
          style={{
            backgroundColor: canImport ? "#F89E18" : undefined,
            borderColor: canImport ? "#F89E18" : undefined,
          }}
        >
          นำเข้าข้อมูล (Import)
        </Button>
      </Space>
      <div className="mt-3 text-xs text-[#888]">
        {selectedFile
          ? `ไฟล์ที่เลือก: ${selectedFile.name}`
          : "ขั้นตอนที่ 1: เลือกไฟล์ CSV ด้านล่าง แล้วกดปุ่ม อัปโหลดไฟล์"}
        {currentUpload?.upload_id && currentUpload.status_code === "uploaded"
          ? " | ขั้นตอนที่ 2: กดปุ่ม นำเข้าข้อมูล"
          : ""}
      </div>
    </div>
  );

  return (
    <MainLayout loading={loading || importLoading}>
      <div className="title-page">Upload Rolling Forecast CSV</div>

      <BoxPrimary>
        {renderActionButtons()}

        <div className="mb-4 mt-4 text-sm text-[#666]">
          ขั้นตอนที่ 1 อัปโหลดไฟล์ CSV เก็บไว้บนเซิร์ฟเวอร์ ขั้นตอนที่ 2 กด
          Import เพื่อ insert ลงตาราง <strong>temp_master_rolling</strong>
        </div>

        <Steps
          current={currentStep}
          className="mb-6"
          items={[
            { title: "เลือกไฟล์" },
            { title: "อัปโหลดไฟล์" },
            { title: "นำเข้าข้อมูล" },
          ]}
        />

        {currentUpload && (
          <div className="mb-6">
            <Alert
              type={
                currentUpload.status_code === "failed"
                  ? "error"
                  : currentUpload.status_code === "completed"
                    ? "success"
                    : currentUpload.status_code === "processing"
                      ? "info"
                      : "warning"
              }
              showIcon
              message={
                <span className="flex items-center gap-2 flex-wrap">
                  <span>สถานะปัจจุบัน:</span>
                  <Tag color={statusConfig?.color || "default"}>
                    {currentUpload.status_message ||
                      statusConfig?.label ||
                      currentUpload.status_code}
                  </Tag>
                  {currentUpload.file_name && (
                    <span className="text-[#666]">
                      ({currentUpload.file_name})
                    </span>
                  )}
                </span>
              }
              description={
                currentUpload.status_code === "completed" ? (
                  <div>
                    นำเข้าสำเร็จ {currentUpload.inserted ?? 0} แถว
                    {currentUpload.failed_count > 0
                      ? `, ล้มเหลว ${currentUpload.failed_count} แถว`
                      : ""}
                  </div>
                ) : currentUpload.status_code === "uploaded" ? (
                  "ไฟล์พร้อมนำเข้า กรุณากดปุ่ม Import to Database"
                ) : currentUpload.status_code === "processing" ? (
                  "ระบบกำลังนำเข้าข้อมูล กรุณารอสักครู่"
                ) : currentUpload.status_code === "failed" ? (
                  currentUpload.message ||
                  "นำเข้าข้อมูลไม่สำเร็จ สามารถลอง Import ใหม่ได้"
                ) : null
              }
            />
          </div>
        )}

        <div className="mt-4">
          <Dragger
            accept=".csv,text/csv"
            multiple={false}
            maxCount={1}
            beforeUpload={(file) => {
              setSelectedFile(file);
              setCurrentUpload(null);
              return false;
            }}
            onRemove={() => {
              setSelectedFile(null);
              return true;
            }}
            fileList={
              selectedFile
                ? [
                    {
                      uid: "-1",
                      name: selectedFile.name,
                      status: "done",
                    },
                  ]
                : []
            }
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">คลิกหรือลากไฟล์ CSV มาวางที่นี่</p>
            <p className="ant-upload-hint">รองรับเฉพาะไฟล์ .csv</p>
          </Dragger>
        </div>

        <div className="mt-4">
          <Checkbox
            checked={clearExisting}
            onChange={(e) => setClearExisting(e.target.checked)}
          >
            ลบข้อมูลเดิมในตาราง temp_master_rolling ก่อนนำเข้า (ใช้ตอน Import)
          </Checkbox>
        </div>
      </BoxPrimary>

      <BoxPrimary className="mt-4">
        <div className="mb-4 font-semibold text-[#333]">ประวัติการอัปโหลด</div>
        <Table
          rowKey="upload_id"
          columns={historyColumns}
          dataSource={uploadHistory}
          pagination={false}
          size="small"
          scroll={{ x: 900 }}
          onRow={(record) => ({
            onClick: () => setCurrentUpload(record),
            style: { cursor: "pointer" },
          })}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
