import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Input, Select, DatePicker, Row, Col } from "antd";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import dayjs from "dayjs";
import ActionButton from "../../../../components/button/ActionButton";
import { AuthContext } from "../../../../contexts/AuthContext";

const STATUS_OPTIONS = [
  { label: "Pending", value: "ODW" },
  { label: "Complete", value: "RFC" },
  { label: "In Progress", value: "IPG" },
];

export default function EditOrViewCustomerLine() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useParams();
  const isViewMode = mode === "view";
  const id = location?.state?.id;
  const { showNotification, showMsg } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await useServiceAPI.get(paths.pathCustomerContactDetail, { id });
      if (res.status === 200 && res.data) {
        setFormData(res.data);
      }
    } catch (err) {
      showMsg("error", err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.status_code) {
      showNotification("error", "กรุณาเลือกสถานะ");
      return;
    }

    try {
      const response = await useServiceAPI.put(paths.pathCustomerContactUpdate, {
        id: formData.id,
        status_code: formData.status_code,
      });

      if (response.status === 200) {
        showNotification("success", response?.data?.message || "อัปเดตเรียบร้อยแล้ว");
        fetchDetail(); // refresh updated value
      }
    } catch (error) {
      showNotification("error", error?.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Customer Detail</div>
      <BoxPrimary>
        <Row gutter={16}>
          <Col span={6}>
            <label>Customer Name</label>
            <Input value={formData.shop_name || "-"} disabled />
          </Col>
          <Col span={6}>
            <label>Customer Name</label>
            <Input
              value={`${formData.first_name || ""} ${formData.last_name || ""}`.trim()}
              disabled
            />
          </Col>
          <Col span={6}>
            <label>Contact Number</label>
            <Input value={formData.phone || "-"} disabled />
          </Col>
          <Col span={6}>
            <label>Contact Type</label>
            <Input value={formData.contact_type_name || "-"} disabled />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={24}>
            <label>Remark</label>
            <Input.TextArea value={formData.remark || "-"} disabled autoSize />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            <label>Date</label>
            <DatePicker
              value={formData.created_at ? dayjs(formData.created_at) : null}
              disabled
              style={{ width: "100%" }}
            />
          </Col>
          <Col span={6}>
            <label>Status</label>
            <Select
              value={formData.status_code}
              disabled={isViewMode}
              style={{ width: "100%" }}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  status_code: value,
                  status_name: STATUS_OPTIONS.find((s) => s.value === value)?.label || "",
                }))
              }
              options={STATUS_OPTIONS}
            />
          </Col>
          <Col span={6}>
            <label>Line Name</label>
            <Input value={formData.line_name || "-"} disabled />
          </Col>
          <Col span={6}>
            <label>Line ID</label>
            <Input value={formData.line_id || "-"} disabled />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={24}>
            <label>Line URL</label>
            <Input value={formData.line_url || "-"} disabled />
          </Col>
        </Row>

        <div className="flex justify-end space-x-4 mt-6">
          <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
          {!isViewMode && (
            <ActionButton
              mode="update"
              text={mode === "create" ? "Create" : "Save"}
              onClick={handleSubmit}
            />
          )}
        </div>
      </BoxPrimary>
    </MainLayout>
  );
}
