import { useContext, useEffect, useRef, useState } from "react";
import { Col, Form, Input, Row } from "antd";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import ActionButton from "../../../../components/button/ActionButton";
import UploadSection from "../../../../components/file_upload/UploadSection";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";
import { AuthContext } from "../../../../contexts/AuthContext";
import {
  CUT_POINT_LIST_PATH,
  apiErrorText,
  cutPointStatusColor,
  cutPointStatusText,
  formatDateTime,
  formatPoint,
  mapCutPointRow,
  openRefundModal,
  toUploadFiles,
  unwrapDetail,
} from "./cutPointShared";

const fieldStyle = { marginBottom: 15 };

export default function CutPointView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showMsg } = useContext(AuthContext);
  const fileUploadRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(location.state?.record || null);

  const id = record?.id || searchParams.get("id") || "";
  const documentNumber = record?.documentNumber || searchParams.get("document_number") || "";

  const loadDetail = async () => {
    if (!id && !documentNumber) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await useServiceAPI.get(paths.pathCutPointDetail, {
        id,
        document_number: documentNumber,
      });
      const detail = unwrapDetail(res);
      if (detail) setRecord(mapCutPointRow(detail));
    } catch (error) {
      if (error?.response?.status !== 404 || !location.state?.record) {
        showMsg?.("warning", apiErrorText(error, "Unable to load the cut point detail"), 2);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, documentNumber]);

  const files = toUploadFiles(record?.files || []);
  const canRefund = record?.canRefund === true;
  const statusColor = cutPointStatusColor(record || {});
  const statusText = cutPointStatusText(record || {});
  const remain =
    record?.balanceAfter != null && record.balanceAfter !== ""
      ? record.balanceAfter
      : record?.currentPoint != null
        ? Number(record.currentPoint) - Number(record.cutPoint || 0)
        : null;

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Cut Point View</div>

      <BoxPrimary>
        {!record ? (
          <div className="text-gray-500">Record not found</div>
        ) : (
          <Form layout="vertical">
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Sale" style={fieldStyle}>
                  <Input disabled value={record.saleName || "-"} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Dealer" style={fieldStyle}>
                  <Input disabled value={record.dealerName || "-"} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Sub Dealer" style={fieldStyle}>
                  <Input disabled value={record.subDealerName || "-"} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Farmer" style={fieldStyle}>
                  <Input disabled value={record.farmerName || "-"} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Reason" style={fieldStyle}>
              <Input.TextArea disabled rows={3} value={record.reason || "-"} />
            </Form.Item>

            <Row gutter={24} align="top" className="mb-6">
              <Col xs={24} md={12}>
                <Form.Item label="Current Point" style={{ marginBottom: 4 }}>
                  <Input disabled value={formatPoint(record.currentPoint)} />
                </Form.Item>
                <div className="text-xs text-gray-500">
                  {record.type === "FM"
                    ? "Farmer balance (แต้มเกษตรกร)"
                    : "Sub dealer balance (แต้มซับดีลเลอร์)"}
                </div>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item label="Cut Point" style={{ marginBottom: 4 }}>
                  <Input disabled value={formatPoint(record.cutPoint)} />
                </Form.Item>
                <div className="text-xs text-red-500">ตัวเลขเต็มเท่านั้น</div>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item label="Remaining" style={{ marginBottom: 4 }}>
                  <Input
                    disabled
                    value={remain !== null && Number.isFinite(Number(remain)) ? formatPoint(remain) : "-"}
                  />
                </Form.Item>
                <div className="text-xs text-gray-500">คงเหลือหลังหัก</div>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Create Date" style={fieldStyle}>
                  <Input disabled value={formatDateTime(record.createdAt)} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Status" style={fieldStyle}>
                  <BadgeStatus
                    text={statusText}
                    bgColor={statusColor.bgColor}
                    textColor={statusColor.textColor}
                  />
                </Form.Item>
              </Col>
            </Row>

            {record.status === "refunded" && (
              <Form.Item label="Remark" style={fieldStyle}>
                <Input.TextArea disabled rows={3} value={record.refundRemark || "-"} />
              </Form.Item>
            )}
          </Form>
        )}

        <UploadSection
          title="Attach"
          fileUploadRef={fileUploadRef}
          fileList={files}
          handleUploadClick={() => {}}
          handleUploadSuccess={() => {}}
          handleFileRemove={() => {}}
          disabled
        />

        <div className="mt-4 flex justify-end gap-3">
          <ActionButton mode="back" text="Back" onClick={() => navigate(CUT_POINT_LIST_PATH)} />
          {canRefund && (
            <ActionButton
              mode="reject"
              text="Refund"
              onClick={() =>
                openRefundModal({
                  record,
                  showMsg,
                  onDone: loadDetail,
                })
              }
            />
          )}
        </div>
      </BoxPrimary>
    </MainLayout>
  );
}
