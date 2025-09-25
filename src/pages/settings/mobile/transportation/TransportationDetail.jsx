import React, { useEffect, useState, useRef, useContext } from "react";
import { Form, Input, DatePicker, Select, notification } from "antd";
import dayjs from "dayjs";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../../components/table/TableComponent";
import ActionButton from "../../../../components/button/ActionButton";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import UploadSection from "../../../../components/file_upload/UploadSection";
import { AuthContext } from "../../../../contexts/AuthContext";


const SEND_BY_OPTIONS = [
  { value: "mail/ship", label: "Mail/Ship" },
  { value: "staff", label: "Staff" },
];

export default function TransportationDetail() {
  const { mode } = useParams(); // 'view' | 'prepare' | 'delivery'
  const isView = String(mode || "view").toLowerCase() === "view";
  const isDelivery = String(mode || "").toLowerCase() === "delivery";
  const isPrepare = String(mode || "").toLowerCase() === "prepare";
  const bottomDisabled = isView || isDelivery;

  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [formTop] = Form.useForm(); // Top form (read-only)
  const [formBottom] = Form.useForm(); // Bottom form (editable for prepare)
  const fileUploadRef = useRef(null); // Ref for file upload
  const [uploadedFiles, setUploadedFiles] = useState([]); // State for uploaded files

  const columns = [
    { title: "Reward Code", dataIndex: "reward_code", align: "left" },
    { title: "Reward Name", dataIndex: "reward_name", align: "left" },
    { title: "Cost (THB)", dataIndex: "reward_cost", align: "right", width: 120 },
    { title: "QTY (Pcs)", dataIndex: "reward_value", align: "right", width: 100 },
  ];

  // helper แปลงค่าจาก UI -> API
  const toApiSendBy = (uiValue) => {
    if (!uiValue) return "Mail/Ship";
    return uiValue.toLowerCase() === "staff" ? "Staff" : "Mail/Ship";
  };

  // helper: API -> UI
  const toUiSendBy = (apiValue) => {
    if (!apiValue) return "mail/ship";
    return String(apiValue).toLowerCase() === "staff" ? "staff" : "mail/ship";
  };

  const fillForm = (data) => {
    formTop.setFieldsValue({
      sub_dealer_name: data.sub_dealer_name || "-",
      shop_name: data.shop_name || "-",
      contact_number: data.contact_number || "-",
      send_date: data.send_at ? dayjs(data.send_at).format("YYYY-MM-DD") : "-",
      status_name: data.status_tran_namsse || "-",
      remark: data.remark || "-",
    });

    formBottom.setFieldsValue({
      send_by: toUiSendBy(data.send_by) ?? "mail/ship",
      send_date: data.send_at ? dayjs(data.send_at) : null,
      remark: data.remark || "",
      remark_tran: data.remark_tran || "-",
    });
  };

  const fetchDetail = async () => {
    setLoading(true);
    const id = location?.state?.id;

    try {
      const res = await useServiceAPI.get(`${paths.pathTransportDetail}/${id}`);
      if (res.status === 200) {
        const data = res.data || {};
        setDetail(data);

        // Populate uploaded files for preview
        const pictures = Array.isArray(data.pictures) ? data.pictures : [];
        setUploadedFiles(
          pictures.map((pic) => ({
            uid: pic.id || new Date().toISOString(),
            name: pic.original_name || "Uploaded File",
            status: "done",
            url: pic.part || "",
          }))
        );

        fillForm(data);
      }
    } catch (error) {
      console.error(e);
      showNotification("error", "Load failed", ["ไม่สามารถโหลดรายละเอียดได้"]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (fileUploadRef.current) {
      fileUploadRef.current.triggerUpload();
    }
  };

  const handleUploadSuccess = (response) => {
    const uploadedFile = response?.data || {};
    setUploadedFiles((prev) => [
      ...prev,
      {
        uid: new Date().toISOString(),
        name: uploadedFile.original_name || "Uploaded File",
        status: "done",
        url: uploadedFile.file_url || "",
      },
    ]);
  };

  const handleFileRemove = (file) => {
    setUploadedFiles((prev) => prev.filter((item) => item.uid !== file.uid));
  };

  const handleSaveDelivery = async () => {
    if (!detail?.id) return;
    try {
      const payload = {
        id: detail.id,
        picture: uploadedFiles.map((file) => file.url), // Extract URLs from uploaded files
      };

      const res = await useServiceAPI.post(paths.pathTransportReceive, payload);
      if (res.status === 200) {
        notification.success({
          message: "Success",
          description: "Transportation details have been successfully updated.",
        });
        navigate(-1); // Navigate back to the list
      }
    } catch (error) {
      console.error("Failed to save transportation detail:", error);
      notification.error({
        message: "Error",
        description: "Failed to update transportation details.",
      });
    }
  };


  const handleSavePrepare = async () => {
    if (!detail?.id) {
      notification.error({ message: "Error", description: "No detail to save." });
      return;
    }
    try {
      // validate
      const values = await formBottom.validateFields();
      // values.send_by เป็นค่าจาก UI ("staff" | "mail/ship")
      // values.send_date เป็น dayjs object

      const payload = {
        id: detail?.id,
        send_by: toApiSendBy(values.send_by),
        send_date: values.send_date ? dayjs(values.send_date).format("YYYY-MM-DD") : null,
        remark: values.send_remark || "",
      };

      const res = await useServiceAPI.post(paths.pathTransportSend, payload);

      if (res?.status === 200) {
        showNotification("success", "Saved", ["บันทึกข้อมูลการขนส่งเรียบร้อย"]);
        navigate(-1);
      } else {
        throw new Error(res?.message || "Unexpected response");
      }
    } catch (error) {
      console.error("Failed to save prepare:", error);
      notification.error({
        message: "Error",
        description: error?.message || "Failed to save prepare.",
      });
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Reward Transaction Detail</div>

      {/* Top Form */}
      <BoxPrimary>
        <Form form={formTop} layout="vertical" disabled>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Form.Item label="Customer Name" name="sub_dealer_name">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Contact Name" name="shop_name">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Contact Number" name="contact_number">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Date" name="send_date">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Status" name="status_name">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Remark" name="remark">
              <Input disabled />
            </Form.Item>
          </div>
        </Form>
      </BoxPrimary>

      {/* Reward Table */}
      <BoxPrimary title="Reward">
        <TableComponent
          header={columns}
          dataSource={detail ? [detail] : []}
          pagination={false}
        />
      </BoxPrimary>

      {/* Bottom Form */}
      {!isView && (
        <BoxPrimary>
          <Form form={formBottom} layout="vertical" disabled={bottomDisabled}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Form.Item
                label="Send By"
                name="send_by"
                rules={isPrepare ? [{ required: true, message: "Please select send by" }] : []}
              >
                <Select
                  options={SEND_BY_OPTIONS}
                  placeholder="Select"
                  allowClear={false}
                  disabled={bottomDisabled}
                />
              </Form.Item>

              <Form.Item
                label="Send Date"
                name="send_date"
                rules={isPrepare ? [{ required: true, message: "Please select send date" }] : []}
              >
                <DatePicker className="w-full" disabled={bottomDisabled} />
              </Form.Item>

              <Form.Item label="Transaction Remark" name="remark_tran">
                <Input placeholder="Enter" disabled={bottomDisabled} />
              </Form.Item>
            </div>
          </Form>
        </BoxPrimary>
      )}

      {/* File Preview for Delivered */}
      {isView && (
        <UploadSection
          title="Attached file/Picture"
          fileUploadRef={null} // No upload functionality in view mode
          fileList={uploadedFiles}
          handleUploadClick={() => { }}
          handleUploadSuccess={() => { }}
          handleFileRemove={() => { }}
          modeUpload="view"
          disabled={true} // Enable view-only mode
        />
      )}

      {/* File Upload for Delivery */}
      {isDelivery && (
        <UploadSection
          title="Attached file/Picture"
          fileUploadRef={fileUploadRef}
          fileList={uploadedFiles}
          handleUploadClick={() => fileUploadRef.current?.triggerUpload()}
          handleUploadSuccess={handleUploadSuccess}
          handleFileRemove={handleFileRemove}
          modeUpload="transport"
          disabled={false} // Enable full functionality
        />
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        {isDelivery && (
          <ActionButton mode="save" text="Save" onClick={handleSaveDelivery} />
        )}
        {isPrepare && (
          <ActionButton mode="save" text="Save" onClick={handleSavePrepare} />
        )}
      </div>
    </MainLayout>
  );
}