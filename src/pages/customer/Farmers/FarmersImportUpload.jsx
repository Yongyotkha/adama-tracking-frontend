import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Alert, Steps, Tag, Table, Button, Space, Select } from "antd";
import {
  InboxOutlined,
  UploadOutlined,
  ImportOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

const { Dragger } = Upload;

const STATUS_CONFIG = {
  uploaded: { color: "blue", label: "อัปโหลดแล้ว รอนำเข้า Temp", step: 1 },
  processing: { color: "orange", label: "กำลังนำเข้า Temp", step: 2 },
  completed: { color: "green", label: "นำเข้า Temp สำเร็จ", step: 3 },
  failed: { color: "red", label: "นำเข้า Temp ล้มเหลว", step: 3 },
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return String(value).replace("T", " ").split(".")[0];
};

const toSelectOptions = (list = []) =>
  list
    .map((item) => ({
      value: item.id ?? item.sub_dealer_id,
      label: item.name ?? item.sub_dealer_name ?? String(item.id ?? item.sub_dealer_id ?? ""),
    }))
    .filter((item) => item.value !== undefined && item.value !== null && item.value !== "");

export default function FarmersImportUpload() {
  const navigate = useNavigate();
  const { showMsg, showNotification } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentUpload, setCurrentUpload] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [dataSale, setDataSale] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [dataSubDealer, setDataSubDealer] = useState([]);
  const [dataSaleId, setDataSaleId] = useState(undefined);
  const [dealerId, setDealerId] = useState(undefined);
  const [subDealerId, setSubDealerId] = useState(undefined);

  const currentStatus = currentUpload?.status_code || null;
  const statusConfig = STATUS_CONFIG[currentStatus] || null;
  const currentStep = statusConfig?.step ?? 0;

  useEffect(() => {
    const getMaster = async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterSaleDropdown, { status: "" });
        setDataSale(toSelectOptions(res?.data || []));
      } catch (error) {
        showMsg("error", error.message || "โหลดรายชื่อ Sales ไม่สำเร็จ");
      }
    };
    getMaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchDealer = async () => {
      if (!dataSaleId) {
        setDataDealer([]);
        return;
      }
      try {
        const dealer = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
          user_id: dataSaleId,
        });
        setDataDealer(toSelectOptions(dealer?.data || []));
      } catch (error) {
        setDataDealer([]);
        showMsg("error", error.message || "โหลดรายชื่อ Dealer ไม่สำเร็จ");
      }
    };
    fetchDealer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSaleId]);

  useEffect(() => {
    const fetchSubDealer = async () => {
      if (!dealerId) {
        setDataSubDealer([]);
        return;
      }
      try {
        const res = await useServiceAPI.get(paths.pathMasterDealeretSubDealer, {
          dealer_id: dealerId,
        });
        setDataSubDealer(toSelectOptions(res?.data || []));
      } catch (error) {
        setDataSubDealer([]);
        showMsg("error", error.message || "โหลดรายชื่อ Sub Dealer ไม่สำเร็จ");
      }
    };
    fetchSubDealer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealerId]);

  const handleChangeHierarchy = (field, value) => {
    if (field === "sale") {
      setDataSaleId(value || undefined);
      setDealerId(undefined);
      setSubDealerId(undefined);
      setDataDealer([]);
      setDataSubDealer([]);
      return;
    }

    if (field === "dealer") {
      setDealerId(value || undefined);
      setSubDealerId(undefined);
      setDataSubDealer([]);
      return;
    }

    if (field === "sub_dealer") {
      setSubDealerId(value || undefined);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showMsg("error", "กรุณาเลือกไฟล์ CSV");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (dataSaleId) {
      formData.append("sale_id", dataSaleId);
    }
    if (dealerId) {
      formData.append("dealer_id", dealerId);
    }
    if (subDealerId) {
      formData.append("sub_dealer_id", subDealerId);
    }

    try {
      const response = await useServiceAPI.post(
        paths.pathCustomerFarmersImportUpload,
        formData,
        setLoading,
      );

      if (response.status === 200) {
        setCurrentUpload(response.data || null);
        setSelectedFile(null);
        showNotification("success", response.message || "อัปโหลดไฟล์สำเร็จ", [
          "ไฟล์ถูกเก็บไว้แล้ว กรุณากดนำเข้าข้อมูล เพื่อเก็บลง temp_master_farmers_import",
        ]);
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
        paths.pathCustomerFarmersImport,
        {
          upload_id: currentUpload.upload_id,
          ...(dataSaleId ? { sale_id: dataSaleId } : {}),
          ...(dealerId ? { dealer_id: dealerId } : {}),
          ...(subDealerId ? { sub_dealer_id: subDealerId } : {}),
        },
        setImportLoading,
      );

      if (response.status === 200) {
        const imported = {
          ...(response.data || {}),
          status_code: response.data?.status_code || "completed",
          status_message:
            response.data?.status_message || STATUS_CONFIG.completed.label,
        };
        setCurrentUpload(imported);
        if (imported.status_code === "completed") {
          setUploadHistory((prev) => {
            const next = prev.filter(
              (item) => item.upload_id !== imported.upload_id,
            );
            return [imported, ...next];
          });
        }
        showNotification(
          "success",
          response.message || "นำเข้า Temp สำเร็จ",
          response.data?.failed_count
            ? [
                `นำเข้า Temp ${response.data.inserted} แถว`,
                `ล้มเหลว ${response.data.failed_count} แถว`,
              ]
            : [`นำเข้า Temp ${response.data?.inserted ?? 0} แถว`],
        );
        if (imported.upload_id) {
          navigate(`/customer/farmers/import/${imported.upload_id}`);
        }
      }
    } catch (error) {
      setCurrentUpload((prev) => ({
        ...(prev || {}),
        ...(error.data || {}),
        status_code: error.data?.status_code || "failed",
        status_message: error.data?.status_message || "นำเข้าข้อมูลล้มเหลว",
      }));
      showMsg("error", error.message || "นำเข้าข้อมูลไม่สำเร็จ");
    }
  };

  const historyColumns = [
    { title: "Upload ID", dataIndex: "upload_id", width: 100, align: "center" },
    { title: "File Name", dataIndex: "file_name", width: 240 },
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
  ];

  const canImport =
    currentUpload?.upload_id &&
    ["uploaded", "failed"].includes(currentUpload.status_code);

  return (
    <MainLayout loading={loading || importLoading}>
      <div className="flex items-center justify-between gap-3">
        <div className="title-page">Upload Farmers CSV</div>
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/customer/farmers/import")}
        >
          กลับหน้ารายการ
        </Button>
      </div>

      <BoxPrimary>
        <div className="rounded border border-[#d9d9d9] bg-[#fafafa] p-4 mb-5">
          <div className="mb-3 text-sm font-medium text-[#333]">
            ภายใต้ (ไม่บังคับ)
          </div>
          <div className="mb-3 text-xs text-[#888]">
            สามารถเว้นว่างได้ เพราะจะไป mapping farmer กับ sub dealer ที่หน้า{" "}
            <strong>Sub Dealer Edit</strong> ภายหลัง
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="mb-1 text-sm text-[#333]">Sales</div>
              <Select
                className="w-full"
                placeholder="Select sales"
                allowClear
                showSearch
                optionFilterProp="label"
                options={dataSale}
                value={dataSaleId}
                onChange={(value) => handleChangeHierarchy("sale", value)}
              />
            </div>
            <div>
              <div className="mb-1 text-sm text-[#333]">Dealer</div>
              <Select
                className="w-full"
                placeholder="Select dealer"
                allowClear
                showSearch
                optionFilterProp="label"
                options={dataDealer}
                value={dealerId}
                disabled={!dataSaleId}
                onChange={(value) => handleChangeHierarchy("dealer", value)}
              />
            </div>
            <div>
              <div className="mb-1 text-sm text-[#333]">Sub Dealer</div>
              <Select
                className="w-full"
                placeholder="Select sub dealer"
                allowClear
                showSearch
                optionFilterProp="label"
                options={dataSubDealer}
                value={subDealerId}
                disabled={!dealerId}
                onChange={(value) => handleChangeHierarchy("sub_dealer", value)}
              />
            </div>
          </div>
        </div>
        <div className="rounded border border-[#d9d9d9] bg-[#fafafa] p-4">
          <div className="mb-3 text-sm font-medium text-[#333]">
            การดำเนินการ
          </div>
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
              นำเข้าข้อมูล (Temp)
            </Button>
          </Space>
          <div className="mt-3 text-xs text-[#888]">
            {selectedFile
              ? `ไฟล์ที่เลือก: ${selectedFile.name}`
              : "ขั้นตอนที่ 1: เลือกไฟล์ CSV แล้วกดปุ่ม อัปโหลดไฟล์"}
            {currentUpload?.upload_id &&
            currentUpload.status_code === "uploaded"
              ? " | ขั้นตอนที่ 2: กดปุ่ม นำเข้าข้อมูล"
              : ""}
          </div>
        </div>

        <div className="mb-4 mt-4 text-sm text-[#666]">
          CSV ต้องมี header: <strong>name, mobile_phone, email, address</strong>{" "}
          แล้ว ปุ่มนำเข้าข้อมูลจะ insert ลงตาราง{" "}
          <strong>temp_master_farmers_import</strong> จากนั้นไปหน้ารายการ Temp
          เพื่อเลือกแถวแล้วนำเข้าจริงลง <strong>master_farmers</strong>
          {" "}การผูก farmer กับ sub dealer ให้ไปทำที่หน้า{" "}
          <strong>Sub Dealer Edit</strong>
        </div>

        <Steps
          current={currentStep}
          className="mb-6"
          items={[
            { title: "เลือกไฟล์" },
            { title: "อัปโหลดไฟล์" },
            { title: "นำเข้า Temp" },
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
                    นำเข้า Temp สำเร็จ {currentUpload.inserted ?? 0} แถว
                    {currentUpload.failed_count > 0
                      ? `, ล้มเหลว ${currentUpload.failed_count} แถว`
                      : ""}{" "}
                    จากนั้นเลือกแถวในหน้ารายการ Temp เพื่อนำเข้าจริงลง
                    master_farmers
                  </div>
                ) : currentUpload.status_code === "uploaded" ? (
                  "ไฟล์พร้อมนำเข้า กรุณากดปุ่มนำเข้าข้อมูล เพื่อเก็บลง Temp"
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
                ? [{ uid: "-1", name: selectedFile.name, status: "done" }]
                : []
            }
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">คลิกหรือลากไฟล์ CSV มาวางที่นี่</p>
            <p className="ant-upload-hint">
              ตัวอย่าง header: name,mobile_phone,email,address
            </p>
          </Dragger>
        </div>
      </BoxPrimary>
    </MainLayout>
  );
}
