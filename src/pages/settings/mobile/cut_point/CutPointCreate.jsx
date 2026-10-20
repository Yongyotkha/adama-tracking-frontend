import { useContext, useEffect, useRef, useState } from "react";
import { Col, Form, Input, InputNumber, Modal, Row, Select } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../../components/button/ActionButton";
import UploadSection from "../../../../components/file_upload/UploadSection";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";
import { AuthContext } from "../../../../contexts/AuthContext";
import {
  CUT_POINT_LIST_PATH,
  apiErrorText,
  formatPoint,
  getBalancePoint,
  isApiOk,
} from "./cutPointShared";

const fieldStyle = { marginBottom: 15 };

const toSelectOptions = (list, valueKey, labelKey) =>
  (Array.isArray(list) ? list : [])
    .map((item) => ({
      value: item[valueKey] ?? item.id ?? item.value,
      label: item[labelKey] ?? item.name ?? item.label ?? "",
    }))
    .filter((item) => item.value !== undefined && item.value !== null && item.label !== "");

export default function CutPointCreate() {
  const navigate = useNavigate();
  const { showMsg } = useContext(AuthContext);
  const [form] = Form.useForm();
  const fileUploadRef = useRef(null);
  const pointRequestRef = useRef(0);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pointLoading, setPointLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [subDealers, setSubDealers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [saleId, setSaleId] = useState();
  const [dealerId, setDealerId] = useState();
  const [subDealerId, setSubDealerId] = useState();
  const [farmerId, setFarmerId] = useState();
  const [currentPoint, setCurrentPoint] = useState(null);
  const [fileList, setFileList] = useState([]);

  const cutPointWatch = Form.useWatch("cut_point", form);
  const customerType = farmerId ? "FM" : subDealerId ? "SD" : "";

  useEffect(() => {
    const loadSales = async () => {
      setLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathMasterSaleDropdown, { status: "" });
        setSales(toSelectOptions(res?.data, "id", "name"));
      } catch (error) {
        showMsg?.("error", apiErrorText(error, "Unable to load sales"), 2);
      } finally {
        setLoading(false);
      }
    };
    loadSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadDealers = async () => {
      if (!saleId) {
        setDealers([]);
        return;
      }
      try {
        const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, { user_id: saleId });
        if (!cancelled) setDealers(toSelectOptions(res?.data, "id", "name"));
      } catch (error) {
        if (!cancelled) {
          setDealers([]);
          showMsg?.("error", apiErrorText(error, "Unable to load dealers"), 2);
        }
      }
    };
    loadDealers();
    return () => {
      cancelled = true;
    };
  }, [saleId, showMsg]);

  useEffect(() => {
    let cancelled = false;
    const loadSubDealers = async () => {
      if (!dealerId) {
        setSubDealers([]);
        return;
      }
      try {
        const res = await useServiceAPI.get(paths.pathMasterSubDealerAll, {
          user_id: saleId || "",
          dealer_id: dealerId,
        });
        if (!cancelled) setSubDealers(toSelectOptions(res?.data, "sub_dealer_id", "sub_dealer_name"));
      } catch (error) {
        if (!cancelled) {
          setSubDealers([]);
          showMsg?.("error", apiErrorText(error, "Unable to load sub dealers"), 2);
        }
      }
    };
    loadSubDealers();
    return () => {
      cancelled = true;
    };
  }, [dealerId, saleId, showMsg]);

  useEffect(() => {
    let cancelled = false;
    const loadFarmers = async () => {
      if (!subDealerId) {
        setFarmers([]);
        return;
      }
      try {
        const res = await useServiceAPI.get(paths.pathUserLineFarmer, { sub_dealer_id: subDealerId });
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : [];
        if (cancelled) return;
        setFarmers(
          list
            .map((item) => ({
              value: item.farmer_id || item.id,
              label: item.farmer_name || item.name || "",
            }))
            .filter((item) => item.value && item.label)
        );
      } catch (error) {
        if (!cancelled) {
          setFarmers([]);
          showMsg?.("error", apiErrorText(error, "Unable to load farmers"), 2);
        }
      }
    };
    loadFarmers();
    return () => {
      cancelled = true;
    };
  }, [subDealerId, showMsg]);

  useEffect(() => {
    const requestId = pointRequestRef.current + 1;
    pointRequestRef.current = requestId;

    const shopType = farmerId ? "farmer" : subDealerId ? "sub_dealer" : "";
    const targetId = farmerId || subDealerId;

    if (!shopType || !targetId) {
      setCurrentPoint(null);
      setPointLoading(false);
      return undefined;
    }

    const loadPoint = async () => {
      setPointLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathDraftCampaignUserInfo, {
          shop_type: shopType,
          id: targetId,
          mode: "dealer",
        });
        if (requestId !== pointRequestRef.current) return;
        setCurrentPoint(Number(getBalancePoint(res)) || 0);
      } catch (error) {
        if (requestId !== pointRequestRef.current) return;
        setCurrentPoint(null);
        showMsg?.("warning", apiErrorText(error, "ดึงแต้มคงเหลือไม่สำเร็จ"), 2);
      } finally {
        if (requestId === pointRequestRef.current) setPointLoading(false);
      }
    };

    loadPoint();
    return undefined;
  }, [farmerId, subDealerId, showMsg]);

  const resetAfter = (level) => {
    const next = { farmer: undefined, cut_point: undefined };
    if (level === "sale") {
      setDealerId(undefined);
      setDealers([]);
      next.dealer = undefined;
    }
    if (level === "sale" || level === "dealer") {
      setSubDealerId(undefined);
      setSubDealers([]);
      next.sub_dealer = undefined;
    }
    setFarmerId(undefined);
    setFarmers([]);
    setCurrentPoint(null);
    form.setFieldsValue(next);
  };

  const handleSave = async (values) => {
    if (!fileList.length) {
      showMsg?.("warning", "Please attach a file", 2);
      return;
    }
    if (pointLoading || currentPoint === null) {
      showMsg?.("warning", "Current point is not available", 2);
      return;
    }

    const cutPoint = Number(values.cut_point);
    const type = values.farmer ? "FM" : "SD";
    const target = type === "FM"
      ? farmers.find((item) => String(item.value) === String(values.farmer))
      : subDealers.find((item) => String(item.value) === String(values.sub_dealer));

    Modal.confirm({
      title: "Confirm Cut Point",
      icon: <ExclamationCircleFilled />,
      centered: true,
      okText: "Save",
      cancelText: "Cancel",
      content: `Cut ${formatPoint(cutPoint)} points from ${type === "FM" ? "Farmer" : "Sub Dealer"} ${target?.label || ""} (remaining ${formatPoint(currentPoint)})`,
      onOk: async () => {
        setSaving(true);
        try {
          const res = await useServiceAPI.post(paths.pathCutPointCreate, {
            type,
            user_id: values.sale,
            dealer_id: values.dealer,
            sub_dealer_id: values.sub_dealer,
            farmer_id: values.farmer || null,
            reason: String(values.reason || "").trim(),
            current_point: Number(currentPoint),
            cut_point: cutPoint,
            files: fileList.map((file) => ({
              file_key: file.uid,
              file_name: file.name,
              file_url: file.url,
            })),
          });

          if (!isApiOk(res)) {
            showMsg?.("warning", res?.message || "Unable to save", 2);
            return;
          }

          showMsg?.("success", "Cut point saved", 2);
          navigate(CUT_POINT_LIST_PATH);
        } catch (error) {
          showMsg?.("error", apiErrorText(error, "Unable to save"), 3);
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const remain =
    currentPoint === null || cutPointWatch === undefined || cutPointWatch === null || cutPointWatch === ""
      ? null
      : Number(currentPoint) - Number(cutPointWatch);

  return (
    <MainLayout loading={loading || saving}>
      <div className="title-page">Create Cut Point</div>

      <BoxPrimary>
        <Form form={form} layout="vertical" onFinish={handleSave} scrollToFirstError>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Sale"
                name="sale"
                style={fieldStyle}
                rules={[{ required: true, message: "Please select a sale" }]}
              >
                <Select
                  showSearch
                  allowClear
                  className="w-full"
                  placeholder="Select sale"
                  optionFilterProp="label"
                  options={sales}
                  onChange={(value) => {
                    setSaleId(value);
                    resetAfter("sale");
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Dealer"
                name="dealer"
                style={fieldStyle}
                rules={[{ required: true, message: "Please select a dealer" }]}
              >
                <Select
                  showSearch
                  allowClear
                  className="w-full"
                  placeholder="Select dealer"
                  optionFilterProp="label"
                  options={dealers}
                  disabled={!saleId}
                  onChange={(value) => {
                    setDealerId(value);
                    resetAfter("dealer");
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Sub Dealer"
                name="sub_dealer"
                style={fieldStyle}
                rules={[{ required: true, message: "Please select a sub dealer" }]}
              >
                <Select
                  showSearch
                  allowClear
                  className="w-full"
                  placeholder="Select sub dealer"
                  optionFilterProp="label"
                  options={subDealers}
                  disabled={!dealerId}
                  onChange={(value) => {
                    setSubDealerId(value);
                    resetAfter("sub_dealer");
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Farmer" name="farmer" style={fieldStyle}>
                <Select
                  showSearch
                  allowClear
                  className="w-full"
                  placeholder="Select farmer"
                  optionFilterProp="label"
                  options={farmers}
                  disabled={!subDealerId}
                  onChange={(value) => {
                    setFarmerId(value);
                    form.setFieldsValue({ cut_point: undefined });
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Reason"
            name="reason"
            style={fieldStyle}
            rules={[{ required: true, whitespace: true, message: "Please enter a reason" }]}
          >
            <Input.TextArea rows={3} placeholder="Freetext" maxLength={1000} showCount />
          </Form.Item>

          <Row gutter={24} align="top" className="mb-6">
            <Col xs={24} md={12}>
              <Form.Item label="Current Point" style={{ marginBottom: 4 }}>
                <Input
                  disabled
                  value={
                    pointLoading
                      ? "Loading current point..."
                      : currentPoint === null
                        ? ""
                        : formatPoint(currentPoint)
                  }
                  placeholder="Select a sub dealer or farmer"
                />
              </Form.Item>
              <div className="text-xs text-gray-500">
                {customerType === "FM"
                  ? "Farmer balance (แต้มเกษตรกร)"
                  : customerType === "SD"
                    ? "Sub dealer balance (แต้มซับดีลเลอร์)"
                    : "Balance loads after a customer is selected (โหลดแต้มหลังเลือกลูกค้า)"}
              </div>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Cut Point"
                name="cut_point"
                style={{ marginBottom: 4 }}
                rules={[
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null || value === "") {
                        return Promise.reject(new Error("Please enter a cut point"));
                      }
                      const number = Number(value);
                      if (!Number.isInteger(number) || number <= 0) {
                        return Promise.reject(new Error("Whole numbers only"));
                      }
                      if (currentPoint === null) {
                        return Promise.reject(new Error("Current point is not available"));
                      }
                      if (number > Number(currentPoint)) {
                        return Promise.reject(new Error("Cut point cannot exceed the current point"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  className="w-full"
                  min={1}
                  step={1}
                  precision={0}
                  controls={false}
                  placeholder="0"
                  disabled={!subDealerId || pointLoading}
                  formatter={(value) => {
                    const digits = String(value ?? "").split(".")[0].replace(/[^\d]/g, "");
                    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  }}
                  parser={(value) => {
                    const digits = String(value || "").split(".")[0].replace(/[^\d]/g, "");
                    return digits ? Number(digits) : null;
                  }}
                />
              </Form.Item>
              <div className="text-xs text-red-500">ตัวเลขเต็มเท่านั้น</div>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Remaining" style={{ marginBottom: 4 }}>
                <Input disabled value={remain === null ? "" : formatPoint(remain)} />
              </Form.Item>
              <div className="text-xs text-gray-500">คงเหลือหลังหัก</div>
            </Col>
          </Row>
        </Form>

        <UploadSection
          title="Attach"
          fileUploadRef={fileUploadRef}
          fileList={fileList}
          handleUploadClick={() => fileUploadRef.current?.triggerUpload()}
          handleUploadSuccess={(response) => {
            const file = response?.data;
            if (!file) return;
            setFileList((prev) => [
              ...prev,
              {
                uid: file.file_key,
                name: file.file_name,
                status: "done",
                url: file.file_url,
              },
            ]);
          }}
          handleFileRemove={(file) =>
            setFileList((prev) => prev.filter((item) => item.uid !== file.uid))
          }
          modeUpload="cut_point"
          required
        />

        <div className="mt-4 flex justify-end gap-3">
          <ActionButton mode="back" text="Back" onClick={() => navigate(CUT_POINT_LIST_PATH)} />
          <ActionButton
            mode="save"
            text="Save"
            disabled={saving}
            onClick={() => form.submit()}
          />
        </div>
      </BoxPrimary>
    </MainLayout>
  );
}
